"""
Work request schemas.

Module 8: Work Request Integration
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.models.work_request import WRPriority, WRType, WRStatus, SAPSyncStatus, WRDocumentType


# Base Schemas
class WorkRequestBase(BaseModel):
    """Base work request schema."""
    title: str = Field(..., min_length=1, max_length=300)
    description: str = Field(..., min_length=1)
    priority: WRPriority
    wr_type: WRType
    asset_id: Optional[int] = None
    estimated_cost: Optional[float] = None


# Create Schemas
class WorkRequestCreate(WorkRequestBase):
    """Schema for creating a work request."""
    inspection_id: Optional[int] = None
    finding_id: Optional[int] = None
    report_id: Optional[int] = None


# Update Schemas
class WorkRequestUpdate(BaseModel):
    """Schema for updating a work request."""
    title: Optional[str] = Field(None, min_length=1, max_length=300)
    description: Optional[str] = Field(None, min_length=1)
    priority: Optional[WRPriority] = None
    wr_type: Optional[WRType] = None
    status: Optional[WRStatus] = None
    asset_id: Optional[int] = None
    estimated_cost: Optional[float] = None
    approved_by_id: Optional[int] = None


# Status Update Schema
class WorkRequestStatusUpdate(BaseModel):
    """Schema for updating work request status."""
    status: WRStatus
    notes: Optional[str] = None


# Response Schemas
class UserSimple(BaseModel):
    """Simple user schema for responses."""
    id: int
    email: str
    full_name: Optional[str] = None

    class Config:
        from_attributes = True


class AssetSimple(BaseModel):
    """Simple asset schema for responses."""
    id: int
    name: str
    asset_code: str

    class Config:
        from_attributes = True


class WorkRequestResponse(WorkRequestBase):
    """Schema for work request response."""
    id: int
    wr_number: str
    status: WRStatus
    sap_sync_status: SAPSyncStatus
    sap_sync_at: Optional[datetime] = None
    inspection_id: Optional[int] = None
    finding_id: Optional[int] = None
    report_id: Optional[int] = None
    created_by_id: Optional[int] = None
    approved_by_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[UserSimple] = None
    approved_by: Optional[UserSimple] = None
    asset: Optional[AssetSimple] = None

    class Config:
        from_attributes = True


# Document Schemas
class WRDocumentCreate(BaseModel):
    """Schema for creating a work request document."""
    document_type: WRDocumentType
    file_name: str
    file_url: str


class WRDocumentResponse(BaseModel):
    """Schema for work request document response."""
    id: int
    wr_id: int
    document_type: WRDocumentType
    file_name: str
    file_url: str
    uploaded_at: datetime

    class Config:
        from_attributes = True


# Statistics Schemas
class WorkRequestStats(BaseModel):
    """Work request statistics."""
    total: int
    by_status: dict
    by_priority: dict
    by_type: dict
    overdue: int
    pending_approval: int
    avg_resolution_days: Optional[float] = None


# List Response
class WorkRequestListResponse(BaseModel):
    """Paginated work request list response."""
    items: List[WorkRequestResponse]
    total: int
    page: int
    page_size: int
