"""Message model for conversation messages."""

import enum
from sqlalchemy import Column, Integer, Text, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.sql import func

from app.database import Base


class MessageRole(enum.Enum):
    """Enumeration of message roles."""

    user = "user"
    assistant = "assistant"


class MessageFeedback(enum.Enum):
    """Enumeration of message feedback types."""

    helpful = "helpful"
    not_helpful = "not_helpful"


class Message(Base):
    """
    Message model for storing individual chat messages.

    Attributes:
        id: Primary key
        conversation_id: Foreign key to parent conversation
        role: Message role (user or assistant)
        content: Message text content
        source_documents: JSON array of referenced document IDs/info
        feedback: User feedback on assistant messages
        created_at: Message creation timestamp
    """

    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(
        Integer,
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    role = Column(Enum(MessageRole), nullable=False)
    content = Column(Text, nullable=False)
    source_documents = Column(JSON, nullable=True)
    feedback = Column(Enum(MessageFeedback), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")

    def __repr__(self):
        return f"<Message(id={self.id}, role={self.role.value}, conversation_id={self.conversation_id})>"
