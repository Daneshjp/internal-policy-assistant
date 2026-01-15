"""
Pydantic schemas for annual inspection planning.

Module 3: Annual Inspection Planning (AIP/QIP/MIP)
"""
from datetime import datetime
from datetime import date as date_type
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator

from app.models.annual_plan import (
    PlanStatus,
    Quarter,
    InspectionType,
    InspectionPriority,
    PlannedInspectionStatus
)


# Annual Plan Schemas
class AnnualPlanBase(BaseModel):
    """Base annual plan schema."""
    year: int = Field(..., ge=2020, le=2050, description="Plan year")
    title: str = Field(..., min_length=1, max_length=200, description="Plan title")
    description: Optional[str] = Field(None, description="Plan description")
    total_inspections: int = Field(0, ge=0, description="Total planned inspections")
    start_date: date_type = Field(..., description="Plan start date")
    end_date: date_type = Field(..., description="Plan end date")

    @field_validator('end_date')
    @classmethod
    def validate_dates(cls, v: date_type, info) -> date_type:
        """Validate end_date is after start_date."""
        if 'start_date' in info.data and v <= info.data['start_date']:
            raise ValueError('end_date must be after start_date')
        return v


class AnnualPlanCreate(AnnualPlanBase):
    """Schema for creating an annual plan."""
    pass


class AnnualPlanUpdate(BaseModel):
    """Schema for updating an annual plan."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    total_inspections: Optional[int] = Field(None, ge=0)
    start_date: Optional[date_type] = None
    end_date: Optional[date_type] = None
    status: Optional[PlanStatus] = None


class AnnualPlanResponse(AnnualPlanBase):
    """Schema for annual plan response."""
    id: int
    status: PlanStatus
    created_by_id: Optional[int]
    approved_by_id: Optional[int]
    approved_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AnnualPlanWithDetails(AnnualPlanResponse):
    """Schema for annual plan with related plans."""
    quarterly_plans: List['QuarterlyPlanResponse'] = []

    class Config:
        from_attributes = True


# Quarterly Plan Schemas
class QuarterlyPlanBase(BaseModel):
    """Base quarterly plan schema."""
    quarter: Quarter = Field(..., description="Quarter (Q1-Q4)")
    title: str = Field(..., min_length=1, max_length=200, description="Plan title")
    total_inspections: int = Field(0, ge=0, description="Total planned inspections")
    start_date: date_type = Field(..., description="Quarter start date")
    end_date: date_type = Field(..., description="Quarter end date")

    @field_validator('end_date')
    @classmethod
    def validate_dates(cls, v: date_type, info) -> date_type:
        """Validate end_date is after start_date."""
        if 'start_date' in info.data and v <= info.data['start_date']:
            raise ValueError('end_date must be after start_date')
        return v


class QuarterlyPlanCreate(QuarterlyPlanBase):
    """Schema for creating a quarterly plan."""
    annual_plan_id: int = Field(..., description="Parent annual plan ID")


class QuarterlyPlanUpdate(BaseModel):
    """Schema for updating a quarterly plan."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    total_inspections: Optional[int] = Field(None, ge=0)
    start_date: Optional[date_type] = None
    end_date: Optional[date_type] = None
    status: Optional[PlanStatus] = None


class QuarterlyPlanResponse(QuarterlyPlanBase):
    """Schema for quarterly plan response."""
    id: int
    annual_plan_id: int
    status: PlanStatus
    created_by_id: Optional[int]
    approved_by_id: Optional[int]
    approved_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class QuarterlyPlanWithDetails(QuarterlyPlanResponse):
    """Schema for quarterly plan with monthly plans."""
    monthly_plans: List['MonthlyPlanResponse'] = []

    class Config:
        from_attributes = True


# Monthly Plan Schemas
class MonthlyPlanBase(BaseModel):
    """Base monthly plan schema."""
    month: int = Field(..., ge=1, le=12, description="Month (1-12)")
    title: str = Field(..., min_length=1, max_length=200, description="Plan title")
    total_inspections: int = Field(0, ge=0, description="Total planned inspections")
    start_date: date_type = Field(..., description="Month start date")
    end_date: date_type = Field(..., description="Month end date")

    @field_validator('end_date')
    @classmethod
    def validate_dates(cls, v: date_type, info) -> date_type:
        """Validate end_date is after start_date."""
        if 'start_date' in info.data and v <= info.data['start_date']:
            raise ValueError('end_date must be after start_date')
        return v


class MonthlyPlanCreate(MonthlyPlanBase):
    """Schema for creating a monthly plan."""
    quarterly_plan_id: int = Field(..., description="Parent quarterly plan ID")


class MonthlyPlanUpdate(BaseModel):
    """Schema for updating a monthly plan."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    total_inspections: Optional[int] = Field(None, ge=0)
    start_date: Optional[date_type] = None
    end_date: Optional[date_type] = None
    status: Optional[PlanStatus] = None


class MonthlyPlanResponse(MonthlyPlanBase):
    """Schema for monthly plan response."""
    id: int
    quarterly_plan_id: int
    status: PlanStatus
    created_by_id: Optional[int]
    approved_by_id: Optional[int]
    approved_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Planned Inspection Schemas
class PlannedInspectionBase(BaseModel):
    """Base planned inspection schema."""
    asset_id: int = Field(..., description="Asset to be inspected")
    inspection_type: InspectionType = Field(..., description="Type of inspection")
    priority: InspectionPriority = Field(InspectionPriority.medium, description="Inspection priority")
    scheduled_date: date_type = Field(..., description="Scheduled inspection date")
    estimated_duration_hours: Optional[int] = Field(None, ge=1, description="Estimated duration in hours")
    assigned_team_leader_id: Optional[int] = Field(None, description="Assigned team leader ID")
    notes: Optional[str] = Field(None, description="Additional notes")


class PlannedInspectionCreate(PlannedInspectionBase):
    """Schema for creating a planned inspection."""
    annual_plan_id: Optional[int] = Field(None, description="Parent annual plan ID")
    quarterly_plan_id: Optional[int] = Field(None, description="Parent quarterly plan ID")
    monthly_plan_id: Optional[int] = Field(None, description="Parent monthly plan ID")

    @field_validator('monthly_plan_id')
    @classmethod
    def validate_plan_hierarchy(cls, v: Optional[int], info) -> Optional[int]:
        """Validate at least one plan level is specified."""
        data = info.data
        if not v and not data.get('quarterly_plan_id') and not data.get('annual_plan_id'):
            raise ValueError('At least one plan level (annual, quarterly, or monthly) must be specified')
        return v


class PlannedInspectionUpdate(BaseModel):
    """Schema for updating a planned inspection."""
    inspection_type: Optional[InspectionType] = None
    priority: Optional[InspectionPriority] = None
    scheduled_date: Optional[date_type] = None
    estimated_duration_hours: Optional[int] = Field(None, ge=1)
    assigned_team_leader_id: Optional[int] = None
    status: Optional[PlannedInspectionStatus] = None
    notes: Optional[str] = None


class PlannedInspectionResponse(PlannedInspectionBase):
    """Schema for planned inspection response."""
    id: int
    annual_plan_id: Optional[int]
    quarterly_plan_id: Optional[int]
    monthly_plan_id: Optional[int]
    status: PlannedInspectionStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Breakdown request schema
class BreakdownRequest(BaseModel):
    """Schema for automatic plan breakdown request."""
    distribute_evenly: bool = Field(True, description="Distribute inspections evenly across periods")
    custom_distribution: Optional[dict] = Field(None, description="Custom distribution percentages")


# Approval schema
class ApprovalRequest(BaseModel):
    """Schema for plan approval."""
    comments: Optional[str] = Field(None, description="Approval comments")


# Forward references for nested models
AnnualPlanWithDetails.model_rebuild()
QuarterlyPlanWithDetails.model_rebuild()
