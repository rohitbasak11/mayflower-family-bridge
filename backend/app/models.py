from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Integer, ForeignKey, Text, JSON, DateTime, func, Float
from sqlalchemy.dialects.postgresql import UUID
import uuid
from typing import List, Optional
import datetime

class Base(DeclarativeBase):
    pass

class Profile(Base):
    __tablename__ = "profiles"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    email: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String)
    credits: Mapped[int] = mapped_column(Integer, default=0)

class Feedback(Base):
    __tablename__ = "feedback"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("profiles.id"), nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String, default="submitted")
    
    # AI Fields
    ai_category: Mapped[Optional[str]] = mapped_column(String)
    ai_priority: Mapped[Optional[str]] = mapped_column(String)
    ai_sentiment: Mapped[Optional[str]] = mapped_column(String)
    ai_summary: Mapped[Optional[str]] = mapped_column(Text)
    ai_draft: Mapped[Optional[str]] = mapped_column(Text)
    ai_confidence: Mapped[Optional[float]] = mapped_column(Float)
    ai_processed_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True))
    
    # Admin Fields
    final_category: Mapped[Optional[str]] = mapped_column(String)
    final_priority: Mapped[Optional[str]] = mapped_column(String)
    response: Mapped[Optional[str]] = mapped_column(Text)
    responded_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("profiles.id"))
    responded_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True))
    
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=func.now())

class AIProcessingLog(Base):
    __tablename__ = "ai_processing_log"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    feedback_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("feedback.id", ondelete="CASCADE"), nullable=False)
    model_used: Mapped[str] = mapped_column(String, nullable=False)
    input_text: Mapped[str] = mapped_column(Text, nullable=False)
    output_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    latency_ms: Mapped[Optional[int]] = mapped_column(Integer)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=func.now())

class AdminOverride(Base):
    __tablename__ = "admin_overrides"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    feedback_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("feedback.id", ondelete="CASCADE"), nullable=False)
    admin_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("profiles.id"), nullable=False)
    field_changed: Mapped[str] = mapped_column(String, nullable=False)
    old_value: Mapped[Optional[str]] = mapped_column(String)
    new_value: Mapped[str] = mapped_column(String, nullable=False)
    reason: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=func.now())
