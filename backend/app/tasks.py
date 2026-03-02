from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from .models import Feedback, AIProcessingLog
from .agent import analyze_feedback_task
import datetime
import json
import time

async def process_feedback_task(feedback_id: str, db: AsyncSession):
    """
    Background task to process feedback:
    1. Fetch feedback from DB.
    2. Run AI analysis.
    3. Update feedback with AI results.
    4. Log the AI interaction.
    """
    # 1. Fetch feedback
    result = await db.execute(select(Feedback).where(Feedback.id == feedback_id))
    feedback = result.scalar_one_or_none()
    
    if not feedback:
        return

    start_time = time.time()
    
    try:
        # 2. Run AI Analysis
        analysis = await analyze_feedback_task(feedback.content)
        
        # 3. Update Feedback
        await db.execute(
            update(Feedback)
            .where(Feedback.id == feedback_id)
            .values(
                status="ai_processed",
                ai_category=analysis.category,
                ai_priority=analysis.priority,
                ai_sentiment=analysis.sentiment,
                ai_summary=analysis.summary,
                ai_draft=analysis.draft_response,
                ai_confidence=analysis.confidence,
                ai_processed_at=datetime.datetime.now(datetime.timezone.utc)
            )
        )
        
        # 4. Log the interaction
        latency = int((time.time() - start_time) * 1000)
        log_entry = AIProcessingLog(
            feedback_id=feedback_id,
            model_used="openai:gpt-4o-mini",
            input_text=feedback.content,
            output_json=analysis.model_dump(),
            latency_ms=latency
        )
        db.add(log_entry)
        
        await db.commit()
        
    except Exception as e:
        await db.rollback()
        # Log error in future Task 7
        print(f"Error processing feedback {feedback_id}: {str(e)}")
