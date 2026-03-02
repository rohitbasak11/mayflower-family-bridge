import asyncio
from sqlalchemy import text
from app.db import engine

async def diag():
    async with engine.connect() as conn:
        res = await conn.execute(text("SELECT id, content, status, ai_processed_at FROM feedback ORDER BY created_at DESC LIMIT 5"))
        rows = res.fetchall()
        print("Latest feedback entries:")
        for r in rows:
            print(f"ID: {str(r[0])[:8]}, Status: {r[2]}, Content: {r[1][:30]}...")

if __name__ == "__main__":
    asyncio.run(diag())
