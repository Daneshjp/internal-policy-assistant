"""DocumentChunk model for RAG vector storage."""

from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector

from app.database import Base


class DocumentChunk(Base):
    """
    DocumentChunk model for storing document chunks with embeddings for RAG.

    Uses pgvector extension for efficient similarity search.

    Attributes:
        id: Primary key
        document_id: Foreign key to parent document
        chunk_index: Index of chunk within document (for ordering)
        content: Text content of the chunk
        embedding: Vector embedding (1536 dimensions for OpenAI)
        token_count: Number of tokens in the chunk
        created_at: Chunk creation timestamp
    """

    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(
        Integer,
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(Vector(1536), nullable=True)
    token_count = Column(Integer, nullable=False, default=0)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relationships
    document = relationship("Document", back_populates="chunks")

    # Composite index for ordering chunks within a document
    __table_args__ = (
        Index('ix_document_chunks_document_index', 'document_id', 'chunk_index'),
    )

    def __repr__(self):
        return f"<DocumentChunk(id={self.id}, document_id={self.document_id}, chunk_index={self.chunk_index})>"
