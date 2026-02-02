"""Document model for storing policy documents."""

import enum
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum, Index
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TimestampMixin


class DocumentStatus(enum.Enum):
    """Enumeration of document processing statuses."""

    processing = "processing"
    active = "active"
    archived = "archived"


class Document(Base, TimestampMixin):
    """
    Document model for storing policy documents and their metadata.

    Attributes:
        id: Primary key
        user_id: Foreign key to user who uploaded the document
        category_id: Foreign key to category (nullable)
        title: Document title
        description: Optional document description
        file_url: URL/path to the stored file
        file_type: Type of file (pdf, docx, txt)
        file_size: Size of file in bytes
        content: Extracted text content
        status: Processing status (processing, active, archived)
    """

    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    category_id = Column(
        Integer,
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    file_url = Column(String(500), nullable=False)
    file_type = Column(String(10), nullable=False)
    file_size = Column(Integer, nullable=False)
    content = Column(Text, nullable=True)
    status = Column(
        Enum(DocumentStatus),
        default=DocumentStatus.processing,
        nullable=False,
        index=True
    )

    # Relationships
    user = relationship("User", back_populates="documents")
    category = relationship("Category", back_populates="documents")
    chunks = relationship(
        "DocumentChunk",
        back_populates="document",
        cascade="all, delete-orphan"
    )
    views = relationship(
        "DocumentView",
        back_populates="document",
        cascade="all, delete-orphan"
    )

    # Composite indexes for common queries
    __table_args__ = (
        Index('ix_documents_user_status', 'user_id', 'status'),
        Index('ix_documents_category_status', 'category_id', 'status'),
    )

    def __repr__(self):
        return f"<Document(id={self.id}, title='{self.title}', status={self.status.value})>"
