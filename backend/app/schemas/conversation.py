"""Pydantic schemas for conversation and message models."""

from datetime import datetime
from typing import Optional, List
from enum import Enum

from pydantic import BaseModel, Field


class MessageFeedbackEnum(str, Enum):
    """Enumeration of message feedback types."""
    helpful = "helpful"
    not_helpful = "not_helpful"


class MessageRoleEnum(str, Enum):
    """Enumeration of message roles."""
    user = "user"
    assistant = "assistant"


# ============== Source Document Schemas ==============

class SourceDocumentResponse(BaseModel):
    """Schema for source document references in messages."""
    document_id: int
    title: str
    chunk_content: str
    relevance_score: float

    class Config:
        from_attributes = True


# ============== Message Schemas ==============

class MessageCreate(BaseModel):
    """Schema for creating a new message."""
    content: str = Field(..., min_length=1, max_length=10000, description="Message content")


class MessageResponse(BaseModel):
    """Schema for message response."""
    id: int
    role: MessageRoleEnum
    content: str
    source_documents: Optional[List[SourceDocumentResponse]] = None
    feedback: Optional[MessageFeedbackEnum] = None
    created_at: datetime

    class Config:
        from_attributes = True


class MessageFeedbackUpdate(BaseModel):
    """Schema for updating message feedback."""
    feedback: MessageFeedbackEnum


# ============== Conversation Schemas ==============

class ConversationCreate(BaseModel):
    """Schema for creating a new conversation."""
    title: Optional[str] = Field(None, max_length=255, description="Optional conversation title")


class ConversationResponse(BaseModel):
    """Schema for conversation response."""
    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    messages: Optional[List[MessageResponse]] = None

    class Config:
        from_attributes = True


class ConversationListItem(BaseModel):
    """Schema for conversation list item (without messages)."""
    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = 0

    class Config:
        from_attributes = True


class ConversationListResponse(BaseModel):
    """Schema for paginated conversation list response."""
    items: List[ConversationListItem]
    total: int
    page: int
    per_page: int
    pages: int
