"""
Asset management schemas (Pydantic models for request/response validation).

Module 2: Asset & Equipment Management
"""
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field, validator


# Request Schemas
class AssetCreate(BaseModel):
    """Asset creation request schema."""
    asset_code: str = Field(..., min_length=1, max_length=50, description="Unique asset code")
    name: str = Field(..., min_length=1, max_length=200, description="Asset name")
    description: Optional[str] = Field(None, description="Asset description")
    asset_type: str = Field(..., description="Asset type (pressure_vessel, pipeline, tank, pump, heat_exchanger, valve, compressor, other)")
    location: Optional[str] = Field(None, max_length=200, description="Asset location")
    facility: Optional[str] = Field(None, max_length=200, description="Facility name")
    unit: Optional[str] = Field(None, max_length=100, description="Unit/Area")
    criticality: str = Field(default="medium", description="Asset criticality (low, medium, high, critical)")
    manufacturer: Optional[str] = Field(None, max_length=200, description="Manufacturer")
    model: Optional[str] = Field(None, max_length=200, description="Model number")
    serial_number: Optional[str] = Field(None, max_length=100, description="Serial number")
    installation_date: Optional[date] = Field(None, description="Installation date")
    next_inspection_due: Optional[date] = Field(None, description="Next inspection due date")
    rbi_category: Optional[str] = Field(None, max_length=50, description="RBI category")
    status: str = Field(default="active", description="Asset status (active, inactive, maintenance, decommissioned)")

    @validator("asset_type")
    def validate_asset_type(cls, v: str) -> str:
        """Validate asset type is one of the allowed values."""
        allowed_types = ["pressure_vessel", "pipeline", "tank", "pump", "heat_exchanger", "valve", "compressor", "other"]
        if v not in allowed_types:
            raise ValueError(f"Asset type must be one of: {', '.join(allowed_types)}")
        return v

    @validator("criticality")
    def validate_criticality(cls, v: str) -> str:
        """Validate criticality is one of the allowed values."""
        allowed_criticality = ["low", "medium", "high", "critical"]
        if v not in allowed_criticality:
            raise ValueError(f"Criticality must be one of: {', '.join(allowed_criticality)}")
        return v

    @validator("status")
    def validate_status(cls, v: str) -> str:
        """Validate status is one of the allowed values."""
        allowed_status = ["active", "inactive", "maintenance", "decommissioned"]
        if v not in allowed_status:
            raise ValueError(f"Status must be one of: {', '.join(allowed_status)}")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "asset_code": "HX-101",
                "name": "Heat Exchanger Unit 101",
                "description": "Primary heat exchanger for process cooling",
                "asset_type": "heat_exchanger",
                "location": "Building A, Level 2",
                "facility": "Abu Dhabi Refinery",
                "unit": "Process Unit 1",
                "criticality": "high",
                "manufacturer": "Alfa Laval",
                "model": "CB110",
                "serial_number": "AL-2024-12345",
                "installation_date": "2024-01-15",
                "next_inspection_due": "2026-06-15",
                "rbi_category": "RBI-2A",
                "status": "active"
            }
        }


class AssetUpdate(BaseModel):
    """Asset update request schema (all fields optional)."""
    name: Optional[str] = Field(None, min_length=1, max_length=200, description="Asset name")
    description: Optional[str] = Field(None, description="Asset description")
    asset_type: Optional[str] = Field(None, description="Asset type")
    location: Optional[str] = Field(None, max_length=200, description="Asset location")
    facility: Optional[str] = Field(None, max_length=200, description="Facility name")
    unit: Optional[str] = Field(None, max_length=100, description="Unit/Area")
    criticality: Optional[str] = Field(None, description="Asset criticality")
    manufacturer: Optional[str] = Field(None, max_length=200, description="Manufacturer")
    model: Optional[str] = Field(None, max_length=200, description="Model number")
    serial_number: Optional[str] = Field(None, max_length=100, description="Serial number")
    installation_date: Optional[date] = Field(None, description="Installation date")
    last_inspection_date: Optional[date] = Field(None, description="Last inspection date")
    next_inspection_due: Optional[date] = Field(None, description="Next inspection due date")
    rbi_category: Optional[str] = Field(None, max_length=50, description="RBI category")
    status: Optional[str] = Field(None, description="Asset status")

    @validator("asset_type")
    def validate_asset_type(cls, v: Optional[str]) -> Optional[str]:
        """Validate asset type if provided."""
        if v is not None:
            allowed_types = ["pressure_vessel", "pipeline", "tank", "pump", "heat_exchanger", "valve", "compressor", "other"]
            if v not in allowed_types:
                raise ValueError(f"Asset type must be one of: {', '.join(allowed_types)}")
        return v

    @validator("criticality")
    def validate_criticality(cls, v: Optional[str]) -> Optional[str]:
        """Validate criticality if provided."""
        if v is not None:
            allowed_criticality = ["low", "medium", "high", "critical"]
            if v not in allowed_criticality:
                raise ValueError(f"Criticality must be one of: {', '.join(allowed_criticality)}")
        return v

    @validator("status")
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        """Validate status if provided."""
        if v is not None:
            allowed_status = ["active", "inactive", "maintenance", "decommissioned"]
            if v not in allowed_status:
                raise ValueError(f"Status must be one of: {', '.join(allowed_status)}")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Heat Exchanger Unit 101 - Updated",
                "status": "maintenance",
                "next_inspection_due": "2026-12-31"
            }
        }


class AssetDocumentCreate(BaseModel):
    """Asset document upload request schema."""
    file_url: str = Field(..., min_length=1, max_length=500, description="Document file URL (S3/MinIO)")
    file_name: str = Field(..., min_length=1, max_length=255, description="Document file name")
    document_type: str = Field(..., description="Document type (technical_drawing, specification, certificate, manual, inspection_report, other)")
    title: Optional[str] = Field(None, max_length=200, description="Document title")

    @validator("document_type")
    def validate_document_type(cls, v: str) -> str:
        """Validate document type is one of the allowed values."""
        allowed_types = ["technical_drawing", "specification", "certificate", "manual", "inspection_report", "other"]
        if v not in allowed_types:
            raise ValueError(f"Document type must be one of: {', '.join(allowed_types)}")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "file_url": "https://s3.amazonaws.com/bucket/documents/hx101-datasheet.pdf",
                "file_name": "HX-101_Datasheet.pdf",
                "document_type": "specification",
                "title": "Heat Exchanger Datasheet"
            }
        }


# Response Schemas
class AssetDocumentResponse(BaseModel):
    """Asset document response schema."""
    id: int = Field(..., description="Document ID")
    asset_id: int = Field(..., description="Asset ID")
    document_type: str = Field(..., description="Document type")
    file_name: str = Field(..., description="File name")
    file_url: str = Field(..., description="File URL")
    uploaded_by_id: Optional[int] = Field(None, description="Uploader user ID")
    uploaded_at: datetime = Field(..., description="Upload timestamp")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "asset_id": 1,
                "document_type": "specification",
                "file_name": "HX-101_Datasheet.pdf",
                "file_url": "https://s3.amazonaws.com/bucket/documents/hx101-datasheet.pdf",
                "uploaded_by_id": 1,
                "uploaded_at": "2026-01-13T10:00:00Z"
            }
        }


class AssetResponse(BaseModel):
    """Asset response schema."""
    id: int = Field(..., description="Asset ID")
    asset_code: str = Field(..., description="Unique asset code")
    name: str = Field(..., description="Asset name")
    description: Optional[str] = Field(None, description="Asset description")
    asset_type: str = Field(..., description="Asset type")
    location: Optional[str] = Field(None, description="Asset location")
    facility: Optional[str] = Field(None, description="Facility name")
    unit: Optional[str] = Field(None, description="Unit/Area")
    criticality: str = Field(..., description="Asset criticality")
    manufacturer: Optional[str] = Field(None, description="Manufacturer")
    model: Optional[str] = Field(None, description="Model number")
    serial_number: Optional[str] = Field(None, description="Serial number")
    installation_date: Optional[date] = Field(None, description="Installation date")
    last_inspection_date: Optional[date] = Field(None, description="Last inspection date")
    next_inspection_due: Optional[date] = Field(None, description="Next inspection due date")
    rbi_category: Optional[str] = Field(None, description="RBI category")
    status: str = Field(..., description="Asset status")
    created_by_id: Optional[int] = Field(None, description="Creator user ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    documents: List[AssetDocumentResponse] = Field(default=[], description="Asset documents")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "asset_code": "HX-101",
                "name": "Heat Exchanger Unit 101",
                "description": "Primary heat exchanger for process cooling",
                "asset_type": "heat_exchanger",
                "location": "Building A, Level 2",
                "facility": "Abu Dhabi Refinery",
                "unit": "Process Unit 1",
                "criticality": "high",
                "manufacturer": "Alfa Laval",
                "model": "CB110",
                "serial_number": "AL-2024-12345",
                "installation_date": "2024-01-15",
                "last_inspection_date": "2025-12-15",
                "next_inspection_due": "2026-06-15",
                "rbi_category": "RBI-2A",
                "status": "active",
                "created_by_id": 1,
                "created_at": "2026-01-13T10:00:00Z",
                "updated_at": "2026-01-13T10:00:00Z",
                "documents": []
            }
        }


class AssetListResponse(BaseModel):
    """Asset list response with pagination."""
    items: List[AssetResponse] = Field(..., description="List of assets")
    total: int = Field(..., description="Total number of assets")
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Items per page")
    pages: int = Field(..., description="Total number of pages")

    class Config:
        json_schema_extra = {
            "example": {
                "items": [],
                "total": 100,
                "page": 1,
                "page_size": 20,
                "pages": 5
            }
        }
