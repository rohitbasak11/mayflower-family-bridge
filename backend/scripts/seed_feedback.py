import asyncio
import uuid
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from app.db import engine
from app.models import Feedback
from app.tasks import process_feedback_task
import os
from dotenv import load_dotenv

load_dotenv()

# Test Feedback Data
TEST_DATA = [
    {
        "content": "The soup was very cold today at lunch. This has happened twice this week.",
        "category": "Dining"
    },
    {
        "content": "I love the new exercise classes! The instructor is fantastic and very helpful.",
        "category": "Activity"
    },
    {
        "content": "My room is freezing. I've tried adjusting the thermostat but nothing happens.",
        "category": "Temperature"
    },
    {
        "content": "Nurse Sarah was exceptionally patient with me today during my checkup.",
        "category": "Staff"
    },
    {
        "content": "Emergency! There is water leaking from my ceiling in the bathroom!",
        "category": "General"
    }
]

async def seed_data():
    async_session = async_sessionmaker(
        engine, expire_on_commit=False
    )
    
    async with async_session() as db:
        print("Starting seed process...")
        
        # 1. Create a mock profile if it doesn't exist
        mock_user_id = uuid.UUID("f47ac10b-58cc-4372-a567-0e02b2c3d479")
        from app.models import Profile
        
        res = await db.get(Profile, mock_user_id)
        if not res:
            print(f"Creating mock profile {mock_user_id}...")
            mock_profile = Profile(
                id=mock_user_id,
                email="test@example.com",
                role="family",
                full_name="Test User"
            )
            db.add(mock_profile)
            await db.commit()
        
            # 2. Add feedback
        for item in TEST_DATA:
            new_feedback = Feedback(
                user_id=mock_user_id,
                content=item["content"],
                category=item["category"],
                status="submitted"
            )
            db.add(new_feedback)
            await db.commit()
            await db.refresh(new_feedback)
            
            f_id = str(new_feedback.id)
            print(f"Added feedback: {f_id[:8]} - {item['category']}")
            
            # Optionally trigger AI processing immediately for testing
            print(f"Triggering AI analysis for {f_id[:8]}...")
            try:
                await process_feedback_task(f_id, db)
                print(f"AI analysis complete for {f_id[:8]}")
            except Exception as e:
                print(f"AI analysis failed for {f_id[:8]}: {e}")

    print("Seeding finished.")

if __name__ == "__main__":
    asyncio.run(seed_data())
