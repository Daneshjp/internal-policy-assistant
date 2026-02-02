"""Pydantic schemas for Document model."""

from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field

from app.models.document import DocumentStatus


class DocumentCreate(BaseModel):
    """Schema for creating a new document."""

    title: str = Field(..., min_length=1, max_length=255, description="Document title")
    description: Optional[str] = Field(None, max_length=1000, description="Document description")
    category_id: Optional[int] = Field(None, description="Category ID for the document")


class DocumentUpdate(BaseModel):
    """Schema for updating a document."""

    title: Optional[str] = Field(None, min_length=1, max_length=255, description="Document title")
    description: Optional[str] = Field(None, max_length=1000, description="Document description")
    category_id: Optional[int] = Field(None, description="Category ID for the document")
    status: Optional[DocumentStatus] = Field(None, description="Document status")


class CategoryInfo(BaseModel):
    """Minimal category info for document response."""

    id: int
    name: str
    icon: Optional[str] = None

    class Config:
        from_attributes = True


class UserInfo(BaseModel):
    """Minimal user info for document response."""

    id: int
    full_name: str
    email: str

    class Config:
        from_attributes = True


class DocumentResponse(BaseModel):
    """Schema for document response."""

    id: int
    user_id: int
    category_id: Optional[int]
    title: str
    description: Optional[str]
    file_url: str
    file_type: str
    file_size: int
    status: DocumentStatus
    created_at: datetime
    updated_at: datetime
    user: Optional[UserInfo] = None
    category: Optional[CategoryInfo] = None

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    """Schema for paginated document list response."""

    items: List[DocumentResponse]
    total: int
    page: int
    per_page: int
    pages: int


class DocumentFilters(BaseModel):
    """Schema for document filtering options."""

    category_id: Optional[int] = None
    status: Optional[DocumentStatus] = None
    search: Optional[str] = None
