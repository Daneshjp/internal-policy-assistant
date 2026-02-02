"""Category model for organizing documents."""

from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TimestampMixin


class Category(Base, TimestampMixin):
    """
    Category model for organizing policy documents.

    Supports hierarchical categories through self-referential relationship.

    Attributes:
        id: Primary key
        name: Category name (unique)
        description: Optional description
        icon: Optional icon identifier
        parent_id: Foreign key to parent category (nullable for top-level)
    """

    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)
    parent_id = Column(
        Integer,
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    # Self-referential relationship for subcategories
    parent = relationship(
        "Category",
        remote_side=[id],
        back_populates="children"
    )
    children = relationship(
        "Category",
        back_populates="parent",
        cascade="all, delete-orphan"
    )

    # Relationship to documents
    documents = relationship(
        "Document",
        back_populates="category",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Category(id={self.id}, name='{self.name}')>"
