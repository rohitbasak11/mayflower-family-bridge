from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select
from .db import get_db
from .schemas import FeedbackOut, FeedbackCreate
from .models import Feedback
from .tasks import process_feedback_task
from .auth import get_current_user

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "ok"}

@router.get("/db-health")
async def db_health_check(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/feedback", response_model=FeedbackOut)
async def create_feedback(
    feedback_in: FeedbackCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Submit new feedback and trigger AI analysis in the background.
    """
    new_feedback = Feedback(
        user_id=current_user.id,
        content=feedback_in.content,
        category=feedback_in.category,
        status="submitted"
    )
    db.add(new_feedback)
    await db.commit()
    await db.refresh(new_feedback)
    
    # Trigger AI processing in background
    background_tasks.add_task(process_feedback_task, str(new_feedback.id), db)
    
    return new_feedback

@router.get("/feedback", response_model=List[FeedbackOut])
async def get_feedback(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all feedback, with optional status filtering.
    """
    query = select(Feedback)
    if status:
        query = query.where(Feedback.status == status)
    
    query = query.order_by(Feedback.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/feedback/{feedback_id}", response_model=FeedbackOut)
async def get_feedback_item(
    feedback_id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get a single feedback item by ID.
    """
    result = await db.execute(select(Feedback).where(Feedback.id == feedback_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return item

@router.patch("/feedback/{feedback_id}", response_model=FeedbackOut)
async def update_feedback_status(
    feedback_id: str,
    status: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Update feedback status (e.g., mark as read or completed).
    """
    # Restricted to staff in future Task 11/12
    result = await db.execute(select(Feedback).where(Feedback.id == feedback_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    item.status = status
    await db.commit()
    await db.refresh(item)
    return item

@router.post("/feedback/{feedback_id}/response", response_model=FeedbackOut)
async def submit_admin_response(
    feedback_id: str,
    response: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Submit a final response to the feedback.
    """
    result = await db.execute(select(Feedback).where(Feedback.id == feedback_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    item.response = response
    item.responded_by = current_user.id
    item.responded_at = datetime.now(timezone.utc)
    item.status = "responded"
    
    await db.commit()
    await db.refresh(item)
    return item

@router.post("/feedback/{feedback_id}/override")
async def override_ai_values(
    feedback_id: str,
    field_name: str,
    new_value: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Manually override an AI-generated value.
    """
    # 1. Update the feedback record
    result = await db.execute(select(Feedback).where(Feedback.id == feedback_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    old_value = getattr(item, f"ai_{field_name}", None)
    setattr(item, f"final_{field_name}", new_value)
    
    # 2. Log the override
    from .models import AdminOverride
    override_log = AdminOverride(
        feedback_id=feedback_id,
        admin_id=current_user.id,
        field_name=field_name,
        old_value=str(old_value) if old_value else None,
        new_value=new_value
    )
    db.add(override_log)
    
    await db.commit()
    return {"status": "success", "message": f"Field '{field_name}' overridden"}
