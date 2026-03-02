from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

import uuid

class FeedbackCreate(BaseModel):
    content: str
    category: Optional[str] = None

class FeedbackOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    user_id: uuid.UUID
    content: str
    category: Optional[str] = None
    status: str
    
    # AI Fields
    ai_category: Optional[str] = None
    ai_priority: Optional[str] = None
    ai_sentiment: Optional[str] = None
    ai_summary: Optional[str] = None
    ai_draft: Optional[str] = None
    ai_confidence: Optional[float] = None
    ai_processed_at: Optional[datetime] = None
    
    # Admin Fields
    final_category: Optional[str] = None
    final_priority: Optional[str] = None
    response: Optional[str] = None
    responded_by: Optional[uuid.UUID] = None
    responded_at: Optional[datetime] = None
    
    created_at: datetime
