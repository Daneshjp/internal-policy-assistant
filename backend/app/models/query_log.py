"""QueryLog model for analytics and tracking."""

from sqlalchemy import Column, Integer, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.sql import func

from app.database import Base


class QueryLog(Base):
    """
    QueryLog model for tracking user queries and analytics.

    Attributes:
        id: Primary key
        user_id: Foreign key to user who made the query
        question: The question/query text
        had_answer: Whether the system found relevant documents
        documents_referenced: JSON array of document IDs used in response
        created_at: Query timestamp
    """

    __tablename__ = "query_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    question = Column(Text, nullable=False)
    had_answer = Column(Boolean, nullable=False, default=True)
    documents_referenced = Column(JSON, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True
    )

    # Relationships
    user = relationship("User", back_populates="query_logs")

    def __repr__(self):
        return f"<QueryLog(id={self.id}, user_id={self.user_id}, had_answer={self.had_answer})>"
