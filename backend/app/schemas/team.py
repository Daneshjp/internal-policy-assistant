"""
Pydantic schemas for team and resource management.

Module 4: Resource Coordination
"""
from datetime import datetime
from datetime import date as date_type
from typing import Optional, List
from pydantic import BaseModel, Field

from app.models.team import (
    RoleInTeam,
    AssignmentRole,
    AssignmentStatus,
    AvailabilityStatus
)


# Team Schemas
class TeamBase(BaseModel):
    """Base team schema."""
    name: str = Field(..., min_length=1, max_length=200, description="Team name")
    department: Optional[str] = Field(None, max_length=100, description="Department")
    specialization: Optional[str] = Field(None, max_length=200, description="Team specialization")


class TeamCreate(TeamBase):
    """Schema for creating a team."""
    team_leader_id: Optional[int] = Field(None, description="Team leader user ID")


class TeamUpdate(BaseModel):
    """Schema for updating a team."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    department: Optional[str] = Field(None, max_length=100)
    specialization: Optional[str] = Field(None, max_length=200)
    team_leader_id: Optional[int] = None
    is_active: Optional[bool] = None


class TeamResponse(TeamBase):
    """Schema for team response."""
    id: int
    team_leader_id: Optional[int]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TeamMemberInfo(BaseModel):
    """Schema for team member information."""
    id: int
    user_id: int
    role_in_team: RoleInTeam
    joined_at: datetime

    class Config:
        from_attributes = True


class TeamWithMembers(TeamResponse):
    """Schema for team with members list."""
    members: List[TeamMemberInfo] = []

    class Config:
        from_attributes = True


# Team Member Schemas
class TeamMemberBase(BaseModel):
    """Base team member schema."""
    user_id: int = Field(..., description="User ID to add to team")
    role_in_team: RoleInTeam = Field(RoleInTeam.inspector, description="Role within the team")


class TeamMemberCreate(TeamMemberBase):
    """Schema for adding a team member."""
    pass


class TeamMemberResponse(BaseModel):
    """Schema for team member response."""
    id: int
    team_id: int
    user_id: int
    role_in_team: RoleInTeam
    joined_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Inspector Assignment Schemas
class InspectorAssignmentBase(BaseModel):
    """Base inspector assignment schema."""
    planned_inspection_id: int = Field(..., description="Planned inspection ID")
    inspector_id: int = Field(..., description="Inspector user ID")
    role: AssignmentRole = Field(AssignmentRole.assistant, description="Assignment role")


class InspectorAssignmentCreate(InspectorAssignmentBase):
    """Schema for creating an inspector assignment."""
    pass


class InspectorAssignmentResponse(InspectorAssignmentBase):
    """Schema for inspector assignment response."""
    id: int
    assigned_by_id: Optional[int]
    assigned_at: datetime
    status: AssignmentStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AssignmentAcceptRequest(BaseModel):
    """Schema for accepting an assignment."""
    comments: Optional[str] = Field(None, description="Optional acceptance comments")


class AssignmentDeclineRequest(BaseModel):
    """Schema for declining an assignment."""
    reason: str = Field(..., min_length=1, description="Reason for declining")


# Resource Availability Schemas
class ResourceAvailabilityBase(BaseModel):
    """Base resource availability schema."""
    date: date_type = Field(..., description="Availability date")
    status: AvailabilityStatus = Field(..., description="Availability status")
    notes: Optional[str] = Field(None, max_length=500, description="Additional notes")


class ResourceAvailabilityCreate(ResourceAvailabilityBase):
    """Schema for creating resource availability."""
    user_id: int = Field(..., description="User ID")


class ResourceAvailabilityUpdate(BaseModel):
    """Schema for updating resource availability."""
    status: AvailabilityStatus = Field(..., description="Availability status")
    notes: Optional[str] = Field(None, max_length=500, description="Additional notes")


class ResourceAvailabilityBulkUpdate(BaseModel):
    """Schema for bulk updating resource availability."""
    from_date: date_type = Field(..., description="Start date")
    to_date: date_type = Field(..., description="End date")
    status: AvailabilityStatus = Field(..., description="Availability status")
    notes: Optional[str] = Field(None, max_length=500, description="Additional notes")


class ResourceAvailabilityResponse(ResourceAvailabilityBase):
    """Schema for resource availability response."""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Inspector workload summary
class InspectorWorkload(BaseModel):
    """Schema for inspector workload summary."""
    inspector_id: int
    inspector_name: str
    total_assignments: int
    accepted_assignments: int
    pending_assignments: int
    completed_assignments: int
    upcoming_inspections: int


# Team statistics
class TeamStatistics(BaseModel):
    """Schema for team statistics."""
    team_id: int
    team_name: str
    total_members: int
    active_assignments: int
    completed_inspections: int
    upcoming_inspections: int
