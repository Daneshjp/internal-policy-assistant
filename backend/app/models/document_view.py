"""DocumentView model for tracking document views."""

from sqlalchemy import Column, Integer, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class DocumentView(Base):
    """
    DocumentView model for tracking when users view documents.

    Attributes:
        id: Primary key
        document_id: Foreign key to viewed document
        user_id: Foreign key to user who viewed
        viewed_at: Timestamp of view
    """

    __tablename__ = "document_views"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(
        Integer,
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    viewed_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relationships
    document = relationship("Document", back_populates="views")
    user = relationship("User", back_populates="document_views")

    # Composite indexes for analytics queries
    __table_args__ = (
        Index('ix_document_views_document_viewed', 'document_id', 'viewed_at'),
        Index('ix_document_views_user_viewed', 'user_id', 'viewed_at'),
    )

    def __repr__(self):
        return f"<DocumentView(id={self.id}, document_id={self.document_id}, user_id={self.user_id})>"
