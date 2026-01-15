"""
API endpoints for team and resource management.

Module 4: Resource Coordination
"""
import logging
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_user, RoleChecker
from app.models.user import User, UserRole
from app.models.team import AssignmentStatus
from app.schemas.team import (
    TeamCreate,
    TeamUpdate,
    TeamResponse,
    TeamWithMembers,
    TeamMemberCreate,
    TeamMemberResponse,
    InspectorAssignmentCreate,
    InspectorAssignmentResponse,
    AssignmentAcceptRequest,
    AssignmentDeclineRequest,
    ResourceAvailabilityUpdate,
    ResourceAvailabilityBulkUpdate,
    ResourceAvailabilityResponse
)
from app.services.team_service import (
    create_team,
    get_teams,
    get_team,
    update_team,
    add_team_member,
    remove_team_member,
    assign_inspector,
    accept_assignment,
    decline_assignment,
    get_inspector_assignments,
    get_inspector_availability,
    update_availability,
    bulk_update_availability,
    check_availability_conflicts
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/teams", tags=["Teams & Resources"])


# Role checker dependencies - using RoleChecker from auth.dependencies
require_team_leader_or_admin = RoleChecker(["team_leader", "admin"])
require_inspector = RoleChecker(["inspector", "team_leader", "admin"])


# Team Endpoints
@router.get("", response_model=List[TeamResponse])
async def list_teams(
    department: Optional[str] = Query(None, description="Filter by department"),
    is_active: Optional[bool] = Query(True, description="Filter by active status"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[TeamResponse]:
    """
    Get list of teams.

    Returns list of teams with optional filters.
    """
    teams = get_teams(
        db=db,
        department=department,
        is_active=is_active,
        skip=skip,
        limit=limit
    )
    return teams


@router.post("", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
async def create_team(
    data: TeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_team_leader_or_admin)
) -> TeamResponse:
    """
    Create a new team.

    Requires team_leader or admin role.
    """
    try:
        team = create_team(db=db, data=data, created_by_id=current_user.id)
        logger.info(f"Team {team.id} created by user {current_user.id}")
        return team
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{team_id}", response_model=TeamWithMembers)
async def get_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> TeamWithMembers:
    """
    Get team details with members.

    Returns team information including member list.
    """
    team = get_team(db=db, team_id=team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Team {team_id} not found"
        )
    return team


@router.put("/{team_id}", response_model=TeamResponse)
async def update_team(
    team_id: int,
    data: TeamUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_team_leader_or_admin)
) -> TeamResponse:
    """
    Update a team.

    Requires team_leader or admin role.
    """
    try:
        team = update_team(db=db, team_id=team_id, data=data)
        if not team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Team {team_id} not found"
            )
        logger.info(f"Team {team_id} updated by user {current_user.id}")
        return team
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/{team_id}/members", response_model=TeamMemberResponse, status_code=status.HTTP_201_CREATED)
async def add_team_member(
    team_id: int,
    data: TeamMemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_team_leader_or_admin)
) -> TeamMemberResponse:
    """
    Add a member to a team.

    Requires team_leader or admin role.
    """
    try:
        member = add_team_member(db=db, team_id=team_id, data=data)
        logger.info(f"User {data.user_id} added to team {team_id} by user {current_user.id}")
        return member
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{team_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_team_member(
    team_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_team_leader_or_admin)
) -> None:
    """
    Remove a member from a team.

    Requires team_leader or admin role.
    """
    try:
        remove_team_member(db=db, team_id=team_id, user_id=user_id)
        logger.info(f"User {user_id} removed from team {team_id} by user {current_user.id}")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# Inspector Assignment Endpoints
@router.get("/assignments", response_model=List[InspectorAssignmentResponse])
async def list_assignments(
    inspector_id: Optional[int] = Query(None, description="Filter by inspector"),
    planned_inspection_id: Optional[int] = Query(None, description="Filter by planned inspection"),
    assignment_status: Optional[AssignmentStatus] = Query(None, alias="status", description="Filter by status"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[InspectorAssignmentResponse]:
    """
    Get list of inspector assignments.

    Returns list of assignments with optional filters.
    """
    # If inspector filter not provided and user is inspector, show only their assignments
    if inspector_id is None and current_user.role == UserRole.inspector:
        inspector_id = current_user.id

    assignments = get_inspector_assignments(
        db=db,
        inspector_id=inspector_id,
        planned_inspection_id=planned_inspection_id,
        status=assignment_status,
        skip=skip,
        limit=limit
    )
    return assignments


@router.post("/assignments", response_model=InspectorAssignmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assignment(
    data: InspectorAssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_team_leader_or_admin)
) -> InspectorAssignmentResponse:
    """
    Assign an inspector to a planned inspection.

    Prevents double-booking and checks availability.
    Requires team_leader or admin role.
    """
    try:
        assignment = assign_inspector(
            db=db,
            data=data,
            assigned_by_id=current_user.id
        )
        logger.info(
            f"Inspector {data.inspector_id} assigned to planned inspection "
            f"{data.planned_inspection_id} by user {current_user.id}"
        )
        return assignment
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/assignments/{assignment_id}/accept", response_model=InspectorAssignmentResponse)
async def accept_assignment(
    assignment_id: int,
    request: AssignmentAcceptRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_inspector)
) -> InspectorAssignmentResponse:
    """
    Accept an inspector assignment.

    Only the assigned inspector can accept their own assignment.
    """
    try:
        assignment = accept_assignment(
            db=db,
            assignment_id=assignment_id,
            inspector_id=current_user.id
        )
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Assignment {assignment_id} not found"
            )
        logger.info(f"Assignment {assignment_id} accepted by inspector {current_user.id}")
        return assignment
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.put("/assignments/{assignment_id}/decline", response_model=InspectorAssignmentResponse)
async def decline_assignment(
    assignment_id: int,
    request: AssignmentDeclineRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_inspector)
) -> InspectorAssignmentResponse:
    """
    Decline an inspector assignment.

    Only the assigned inspector can decline their own assignment.
    Requires a reason for declining.
    """
    try:
        assignment = decline_assignment(
            db=db,
            assignment_id=assignment_id,
            inspector_id=current_user.id,
            reason=request.reason
        )
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Assignment {assignment_id} not found"
            )
        logger.info(f"Assignment {assignment_id} declined by inspector {current_user.id}: {request.reason}")
        return assignment
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


# Resource Availability Endpoints
@router.get("/availability/{user_id}", response_model=List[ResourceAvailabilityResponse])
async def get_availability(
    user_id: int,
    date_from: Optional[date] = Query(None, description="Start date (default: today)"),
    date_to: Optional[date] = Query(None, description="End date (default: 30 days from start)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[ResourceAvailabilityResponse]:
    """
    Get inspector availability for a date range.

    Returns availability records for the specified user and date range.
    """
    availabilities = get_inspector_availability(
        db=db,
        user_id=user_id,
        date_from=date_from,
        date_to=date_to
    )
    return availabilities


@router.put("/availability", response_model=ResourceAvailabilityResponse)
async def update_own_availability(
    availability_date: date = Query(..., description="Date to update availability"),
    data: ResourceAvailabilityUpdate = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_inspector)
) -> ResourceAvailabilityResponse:
    """
    Update own availability for a specific date.

    Inspectors can update their own availability status.
    """
    availability = update_availability(
        db=db,
        user_id=current_user.id,
        availability_date=availability_date,
        data=data
    )
    logger.info(f"User {current_user.id} updated availability for {availability_date}")
    return availability


@router.put("/availability/bulk", response_model=List[ResourceAvailabilityResponse])
async def bulk_update_availability(
    data: ResourceAvailabilityBulkUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_inspector)
) -> List[ResourceAvailabilityResponse]:
    """
    Bulk update own availability for a date range.

    Allows inspectors to set availability status for multiple dates at once.
    """
    try:
        availabilities = bulk_update_availability(
            db=db,
            user_id=current_user.id,
            data=data
        )
        logger.info(
            f"User {current_user.id} bulk updated availability from {data.from_date} to {data.to_date}"
        )
        return availabilities
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/availability/{user_id}/check/{check_date}", response_model=dict)
async def check_availability(
    user_id: int,
    check_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Check if inspector is available on a specific date.

    Returns availability status considering both availability records and existing assignments.
    """
    is_available = check_availability_conflicts(
        db=db,
        user_id=user_id,
        check_date=check_date
    )
    return {
        "user_id": user_id,
        "date": check_date,
        "is_available": is_available
    }
