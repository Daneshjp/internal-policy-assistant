"""
Approval workflow schemas for API validation and serialization.

Module 7: Multi-Stage Approval Workflow
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


# Enums
class ApprovalStageEnum(str):
    """Approval stage enumeration."""
    inspector = "inspector"
    engineer = "engineer"
    rbi = "rbi"
    team_leader = "team_leader"


class WorkflowStatusEnum(str):
    """Workflow status enumeration."""
    pending = "pending"
    in_progress = "in_progress"
    approved = "approved"
    rejected = "rejected"
    cancelled = "cancelled"


class StageStatusEnum(str):
    """Stage status enumeration."""
    pending = "pending"
    in_review = "in_review"
    approved = "approved"
    rejected = "rejected"
    skipped = "skipped"


class CommentTypeEnum(str):
    """Comment type enumeration."""
    approval = "approval"
    rejection = "rejection"
    request_changes = "request_changes"
    general = "general"


# Approval Action Schemas
class ApprovalActionRequest(BaseModel):
    """Schema for approval or rejection action."""
    comments: Optional[str] = Field(None, description="Comments for the action")

    model_config = ConfigDict(from_attributes=True)


class RejectionRequest(BaseModel):
    """Schema for rejection request."""
    comments: str = Field(..., min_length=1, description="Rejection reason (required)")

    model_config = ConfigDict(from_attributes=True)


# Response Schemas
class ApprovalCommentResponse(BaseModel):
    """Schema for approval comment response."""
    id: int
    stage_id: int
    reviewer_id: Optional[int]
    comment: str
    comment_type: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApprovalStageResponse(BaseModel):
    """Schema for approval stage response."""
    id: int
    workflow_id: int
    stage_name: str
    stage_order: int
    reviewer_id: Optional[int]
    status: str
    comments: Optional[str]
    reviewed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApprovalHistoryResponse(BaseModel):
    """Schema for approval history response."""
    id: int
    workflow_id: int
    action: str
    performed_by_id: Optional[int]
    stage_name: Optional[str]
    comments: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApprovalWorkflowResponse(BaseModel):
    """Schema for approval workflow response."""
    id: int
    report_id: int
    current_stage: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime
    stages: List[ApprovalStageResponse] = []
    history: List[ApprovalHistoryResponse] = []

    model_config = ConfigDict(from_attributes=True)


# List Response with Extended Information
class PendingApprovalItem(BaseModel):
    """Schema for pending approval list item with extended information."""
    workflow_id: int
    report_id: int
    report_number: str
    inspection_id: int
    asset_id: Optional[int] = None
    asset_name: Optional[str] = None
    inspection_date: Optional[datetime] = None
    inspection_type: Optional[str] = None
    inspector_id: Optional[int] = None
    inspector_name: Optional[str] = None
    findings_count: int = 0
    critical_findings: int = 0
    high_findings: int = 0
    medium_findings: int = 0
    low_findings: int = 0
    current_stage: Optional[str] = None
    workflow_status: str
    submitted_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PendingApprovalsResponse(BaseModel):
    """Schema for pending approvals list response."""
    items: List[PendingApprovalItem]
    total: int
    page: int = 1
    page_size: int = 20

    model_config = ConfigDict(from_attributes=True)
