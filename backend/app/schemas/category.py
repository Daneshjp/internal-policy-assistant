"""Pydantic schemas for Category model."""

from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field


class CategoryCreate(BaseModel):
    """Schema for creating a new category."""

    name: str = Field(..., min_length=1, max_length=100, description="Category name")
    description: Optional[str] = Field(None, max_length=500, description="Category description")
    icon: Optional[str] = Field(None, max_length=50, description="Icon identifier")
    parent_id: Optional[int] = Field(None, description="Parent category ID for nesting")


class CategoryUpdate(BaseModel):
    """Schema for updating an existing category."""

    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Category name")
    description: Optional[str] = Field(None, max_length=500, description="Category description")
    icon: Optional[str] = Field(None, max_length=50, description="Icon identifier")


class CategoryResponse(BaseModel):
    """Schema for category response."""

    id: int
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    parent_id: Optional[int] = None
    document_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class CategoryTreeResponse(BaseModel):
    """Schema for category tree response with nested children."""

    id: int
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    parent_id: Optional[int] = None
    document_count: int = 0
    children: List["CategoryTreeResponse"] = []
    created_at: datetime

    class Config:
        from_attributes = True


# Update forward references for recursive type
CategoryTreeResponse.model_rebuild()


class CategoryWithDocuments(BaseModel):
    """Schema for category with paginated documents."""

    id: int
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    parent_id: Optional[int] = None
    document_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True
