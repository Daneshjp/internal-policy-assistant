"""
Database models for the Internal Policy Assistant.

This module exports all SQLAlchemy models for use throughout the application.
"""

from app.models.base import TimestampMixin, SoftDeleteMixin
from app.models.user import User, UserRole
from app.models.refresh_token import RefreshToken
from app.models.category import Category
from app.models.document import Document, DocumentStatus
from app.models.document_chunk import DocumentChunk
from app.models.conversation import Conversation
from app.models.message import Message, MessageRole, MessageFeedback
from app.models.query_log import QueryLog
from app.models.document_view import DocumentView

__all__ = [
    # Mixins
    "TimestampMixin",
    "SoftDeleteMixin",
    # User models
    "User",
    "UserRole",
    "RefreshToken",
    # Document models
    "Category",
    "Document",
    "DocumentStatus",
    "DocumentChunk",
    "DocumentView",
    # Chat models
    "Conversation",
    "Message",
    "MessageRole",
    "MessageFeedback",
    # Analytics
    "QueryLog",
]
