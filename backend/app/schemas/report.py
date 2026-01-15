"""
Report schemas for API validation and serialization.

Module 6: Report Management
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from enum import Enum


# Enums
class ReportTypeEnum(str, Enum):
    """Report type enumeration."""
    routine_inspection = "routine_inspection"
    statutory_inspection = "statutory_inspection"
    rbi_inspection = "rbi_inspection"
    shutdown_inspection = "shutdown_inspection"
    emergency_inspection = "emergency_inspection"
    summary = "summary"


class ReportStatusEnum(str, Enum):
    """Report status enumeration."""
    draft = "draft"
    qc_pending = "qc_pending"
    qc_approved = "qc_approved"
    qc_rejected = "qc_rejected"
    submitted = "submitted"
    approved = "approved"
    rejected = "rejected"
    locked = "locked"


class InspectionTypeEnum(str, Enum):
    """Inspection type for templates."""
    routine = "routine"
    statutory = "statutory"
    rbi = "rbi"
    shutdown = "shutdown"
    emergency = "emergency"


# Report Template Schemas
class ReportTemplateCreate(BaseModel):
    """Schema for creating a report template."""
    name: str = Field(..., max_length=200, description="Template name")
    inspection_type: Optional[InspectionTypeEnum] = Field(None, description="Type of inspection this template is for")
    template_html: str = Field(..., description="HTML template content")
    variables: Optional[dict] = Field(None, description="Template variables and definitions")

    model_config = ConfigDict(from_attributes=True)


class ReportTemplateUpdate(BaseModel):
    """Schema for updating a report template."""
    name: Optional[str] = Field(None, max_length=200)
    inspection_type: Optional[InspectionTypeEnum] = None
    template_html: Optional[str] = None
    variables: Optional[dict] = None
    is_active: Optional[str] = Field(None, max_length=10)

    model_config = ConfigDict(from_attributes=True)


class ReportTemplateResponse(BaseModel):
    """Schema for report template response."""
    id: int
    name: str
    inspection_type: Optional[str] = None
    template_html: str
    variables: Optional[dict] = None
    is_active: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Inspection Report Schemas
class InspectionReportCreate(BaseModel):
    """Schema for creating an inspection report."""
    inspection_id: int = Field(..., description="ID of the inspection")
    template_id: Optional[int] = Field(None, description="ID of the template to use")
    report_type: ReportTypeEnum = Field(..., description="Type of report")
    executive_summary: Optional[str] = Field(None, description="Executive summary")
    detailed_findings: Optional[str] = Field(None, description="Detailed findings")
    recommendations: Optional[str] = Field(None, description="Recommendations")
    conclusions: Optional[str] = Field(None, description="Conclusions")

    model_config = ConfigDict(from_attributes=True)


class InspectionReportUpdate(BaseModel):
    """Schema for updating an inspection report."""
    executive_summary: Optional[str] = None
    detailed_findings: Optional[str] = None
    recommendations: Optional[str] = None
    conclusions: Optional[str] = None
    status: Optional[ReportStatusEnum] = None
    qc_comments: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ReportVersionResponse(BaseModel):
    """Schema for report version response."""
    id: int
    report_id: int
    version_number: int
    content: dict
    created_by_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InspectionReportResponse(BaseModel):
    """Schema for inspection report response."""
    id: int
    inspection_id: int
    report_number: str
    report_type: str
    version: int
    status: str
    executive_summary: Optional[str] = None
    detailed_findings: Optional[str] = None
    recommendations: Optional[str] = None
    conclusions: Optional[str] = None
    generated_at: datetime
    generated_by_id: Optional[int] = None
    qc_reviewed_by_id: Optional[int] = None
    qc_reviewed_at: Optional[datetime] = None
    qc_comments: Optional[str] = None
    submitted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InspectionReportListResponse(BaseModel):
    """Schema for report list item."""
    id: int
    inspection_id: int
    report_number: str
    report_type: str
    version: int
    status: str
    generated_at: datetime
    generated_by_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Report Version Schemas
class ReportVersionCreate(BaseModel):
    """Schema for creating a report version."""
    version_number: int = Field(..., description="Version number")
    content: dict = Field(..., description="Full report content snapshot")
    changes_made: Optional[str] = Field(None, description="Description of changes")

    model_config = ConfigDict(from_attributes=True)


# QC Review Schemas
class QCReviewRequest(BaseModel):
    """Schema for QC review request."""
    comments: Optional[str] = Field(None, description="QC review comments")

    model_config = ConfigDict(from_attributes=True)


class QCApprovalRequest(BaseModel):
    """Schema for QC approval request."""
    comments: Optional[str] = Field(None, description="Approval comments")

    model_config = ConfigDict(from_attributes=True)


class QCRejectionRequest(BaseModel):
    """Schema for QC rejection request."""
    comments: str = Field(..., description="Rejection reason (required)")

    model_config = ConfigDict(from_attributes=True)


# Report Generation Schemas
class ReportGenerateRequest(BaseModel):
    """Schema for report generation request."""
    inspection_id: int = Field(..., description="ID of the inspection")
    template_id: Optional[int] = Field(None, description="Optional template ID")

    model_config = ConfigDict(from_attributes=True)


# Report Export Schemas
class ReportExportFormat(str, Enum):
    """Report export format enumeration."""
    pdf = "pdf"
    docx = "docx"
