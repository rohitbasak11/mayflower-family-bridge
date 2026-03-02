from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext
from typing import Optional
from .config import settings

class FeedbackAnalysis(BaseModel):
    category: str = Field(description="One of: Dining, Temperature, Activity, Staff, General")
    priority: str = Field(description="One of: Low, Medium, High, Urgent")
    sentiment: str = Field(description="Resident's emotional tone: Positive, Neutral, Negative")
    summary: str = Field(description="A concise 1-sentence summary of the issue")
    draft_response: str = Field(description="A professional, empathetic draft response for the admin to review")
    confidence: float = Field(description="AI confidence score between 0.0 and 1.0")

SYSTEM_PROMPT = """
You are an expert AI assistant for "Family Bridge", a senior living community management system.
Your task is to analyze feedback submitted by residents or their families.

Rules:
1. Classification: Choose the most appropriate category.
2. Priority: 
   - 'Urgent' for medical issues, safety hazards, or extreme distress.
   - 'High' for significant discomfort (e.g., very cold room) or repeated issues.
   - 'Medium' for standard requests or suggestions.
   - 'Low' for general positive feedback.
3. Sentiment: Be objective.
4. Summary: Keep it brief and actionable.
5. Draft Response: 
   - Be empathetic and professional. 
   - Address the resident by name if provided.
   - Acknowledge the specific issue.
   - State that the staff has been notified and will look into it.
"""

feedback_agent = Agent(
    "groq:llama-3.3-70b-versatile",
    output_type=FeedbackAnalysis,
    system_prompt=SYSTEM_PROMPT,
)

async def analyze_feedback_task(content: str, resident_name: Optional[str] = "Resident") -> FeedbackAnalysis:
    """
    Analyzes feedback content using Pydantic AI.
    """
    prompt = f"Resident Name: {resident_name}\nFeedback Content: {content}"
    result = await feedback_agent.run(prompt)
    return result.output
