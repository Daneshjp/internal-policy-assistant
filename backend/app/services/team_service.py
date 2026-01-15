"""
Service layer for team and resource management.

Module 4: Resource Coordination
"""
import logging
from datetime import datetime, date, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func

from app.models.team import (
    Team,
    TeamMember,
    InspectorAssignment,
    ResourceAvailability,
    RoleInTeam,
    AssignmentRole,
    AssignmentStatus,
    AvailabilityStatus
)
from app.models.annual_plan import PlannedInspection
from app.models.user import User
from app.schemas.team import (
    TeamCreate,
    TeamUpdate,
    TeamMemberCreate,
    InspectorAssignmentCreate,
    ResourceAvailabilityUpdate,
    ResourceAvailabilityBulkUpdate
)

logger = logging.getLogger(__name__)


# Team Operations
def create_team(
    db: Session,
    data: TeamCreate,
    created_by_id: int
) -> Team:
    """
    Create a new team.

    Args:
        db: Database session
        data: Team creation data
        created_by_id: ID of user creating the team

    Returns:
        Team: Created team

    Raises:
        ValueError: If team name already exists or team leader doesn't exist
    """
    # Check if team name already exists
    existing = db.query(Team).filter(Team.name == data.name).first()
    if existing:
        raise ValueError(f"Team with name '{data.name}' already exists")

    # Validate team leader if provided
    if data.team_leader_id:
        leader = db.query(User).filter(User.id == data.team_leader_id).first()
        if not leader:
            raise ValueError(f"Team leader with ID {data.team_leader_id} not found")

    team = Team(**data.model_dump())
    db.add(team)
    db.commit()
    db.refresh(team)

    logger.info(f"Created team {team.id} '{team.name}' by user {created_by_id}")
    return team


def get_teams(
    db: Session,
    department: Optional[str] = None,
    is_active: Optional[bool] = True,
    skip: int = 0,
    limit: int = 100
) -> List[Team]:
    """
    Get list of teams with optional filters.

    Args:
        db: Database session
        department: Filter by department
        is_active: Filter by active status
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List[Team]: List of teams
    """
    query = db.query(Team)

    if department:
        query = query.filter(Team.department == department)
    if is_active is not None:
        query = query.filter(Team.is_active == is_active)

    query = query.order_by(Team.name)
    return query.offset(skip).limit(limit).all()


def get_team(db: Session, team_id: int) -> Optional[Team]:
    """
    Get team by ID with members.

    Args:
        db: Database session
        team_id: Team ID

    Returns:
        Optional[Team]: Team if found
    """
    return db.query(Team).options(
        joinedload(Team.members)
    ).filter(Team.id == team_id).first()


def update_team(
    db: Session,
    team_id: int,
    data: TeamUpdate
) -> Optional[Team]:
    """
    Update a team.

    Args:
        db: Database session
        team_id: Team ID
        data: Update data

    Returns:
        Optional[Team]: Updated team if found

    Raises:
        ValueError: If team leader doesn't exist or name already taken
    """
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        return None

    # Check team leader if being updated
    update_data = data.model_dump(exclude_unset=True)
    if 'team_leader_id' in update_data and update_data['team_leader_id']:
        leader = db.query(User).filter(User.id == update_data['team_leader_id']).first()
        if not leader:
            raise ValueError(f"Team leader with ID {update_data['team_leader_id']} not found")

    # Check name uniqueness if being updated
    if 'name' in update_data:
        existing = db.query(Team).filter(
            and_(Team.name == update_data['name'], Team.id != team_id)
        ).first()
        if existing:
            raise ValueError(f"Team with name '{update_data['name']}' already exists")

    for field, value in update_data.items():
        setattr(team, field, value)

    db.commit()
    db.refresh(team)

    logger.info(f"Updated team {team_id}")
    return team


# Team Member Operations
def add_team_member(
    db: Session,
    team_id: int,
    data: TeamMemberCreate
) -> TeamMember:
    """
    Add a member to a team.

    Args:
        db: Database session
        team_id: Team ID
        data: Team member data

    Returns:
        TeamMember: Created team member

    Raises:
        ValueError: If team or user doesn't exist, or user already in team
    """
    # Validate team exists
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise ValueError(f"Team {team_id} not found")

    # Validate user exists
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise ValueError(f"User {data.user_id} not found")

    # Check if user already in team
    existing = db.query(TeamMember).filter(
        and_(
            TeamMember.team_id == team_id,
            TeamMember.user_id == data.user_id
        )
    ).first()

    if existing:
        raise ValueError(f"User {data.user_id} is already a member of team {team_id}")

    member = TeamMember(
        team_id=team_id,
        user_id=data.user_id,
        role_in_team=data.role_in_team,
        joined_at=datetime.now()
    )
    db.add(member)
    db.commit()
    db.refresh(member)

    logger.info(f"Added user {data.user_id} to team {team_id} as {data.role_in_team.value}")
    return member


def remove_team_member(
    db: Session,
    team_id: int,
    user_id: int
) -> bool:
    """
    Remove a member from a team.

    Args:
        db: Database session
        team_id: Team ID
        user_id: User ID to remove

    Returns:
        bool: True if member was removed

    Raises:
        ValueError: If team member not found
    """
    member = db.query(TeamMember).filter(
        and_(
            TeamMember.team_id == team_id,
            TeamMember.user_id == user_id
        )
    ).first()

    if not member:
        raise ValueError(f"User {user_id} is not a member of team {team_id}")

    db.delete(member)
    db.commit()

    logger.info(f"Removed user {user_id} from team {team_id}")
    return True


# Inspector Assignment Operations
def assign_inspector(
    db: Session,
    data: InspectorAssignmentCreate,
    assigned_by_id: int
) -> InspectorAssignment:
    """
    Assign an inspector to a planned inspection.

    Args:
        db: Database session
        data: Assignment data
        assigned_by_id: ID of user making the assignment

    Returns:
        InspectorAssignment: Created assignment

    Raises:
        ValueError: If planned inspection or inspector doesn't exist, or double-booking detected
    """
    # Validate planned inspection exists
    inspection = db.query(PlannedInspection).filter(
        PlannedInspection.id == data.planned_inspection_id
    ).first()
    if not inspection:
        raise ValueError(f"Planned inspection {data.planned_inspection_id} not found")

    # Validate inspector exists
    inspector = db.query(User).filter(User.id == data.inspector_id).first()
    if not inspector:
        raise ValueError(f"Inspector {data.inspector_id} not found")

    # Check for double-booking - inspector already assigned to another inspection on same date
    existing_assignments = db.query(InspectorAssignment).join(
        PlannedInspection,
        PlannedInspection.id == InspectorAssignment.planned_inspection_id
    ).filter(
        and_(
            InspectorAssignment.inspector_id == data.inspector_id,
            PlannedInspection.scheduled_date == inspection.scheduled_date,
            InspectorAssignment.status.in_([
                AssignmentStatus.assigned,
                AssignmentStatus.accepted
            ])
        )
    ).all()

    if existing_assignments:
        raise ValueError(
            f"Inspector {data.inspector_id} is already assigned to another inspection on {inspection.scheduled_date}"
        )

    # Check inspector availability
    availability = db.query(ResourceAvailability).filter(
        and_(
            ResourceAvailability.user_id == data.inspector_id,
            ResourceAvailability.date == inspection.scheduled_date
        )
    ).first()

    if availability and availability.status != AvailabilityStatus.available:
        logger.warning(
            f"Inspector {data.inspector_id} is marked as {availability.status.value} on {inspection.scheduled_date}"
        )

    assignment = InspectorAssignment(
        planned_inspection_id=data.planned_inspection_id,
        inspector_id=data.inspector_id,
        role=data.role,
        assigned_by_id=assigned_by_id,
        assigned_at=datetime.now(),
        status=AssignmentStatus.assigned
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    logger.info(f"Assigned inspector {data.inspector_id} to planned inspection {data.planned_inspection_id}")
    return assignment


def accept_assignment(
    db: Session,
    assignment_id: int,
    inspector_id: int
) -> Optional[InspectorAssignment]:
    """
    Accept an inspector assignment.

    Args:
        db: Database session
        assignment_id: Assignment ID
        inspector_id: Inspector ID accepting the assignment

    Returns:
        Optional[InspectorAssignment]: Updated assignment if found

    Raises:
        ValueError: If assignment not in correct state or inspector mismatch
    """
    assignment = db.query(InspectorAssignment).filter(
        InspectorAssignment.id == assignment_id
    ).first()

    if not assignment:
        return None

    # Verify inspector owns this assignment
    if assignment.inspector_id != inspector_id:
        raise ValueError("Assignment does not belong to this inspector")

    # Only assigned assignments can be accepted
    if assignment.status != AssignmentStatus.assigned:
        raise ValueError(f"Cannot accept assignment in status {assignment.status.value}")

    assignment.status = AssignmentStatus.accepted
    db.commit()
    db.refresh(assignment)

    logger.info(f"Inspector {inspector_id} accepted assignment {assignment_id}")
    return assignment


def decline_assignment(
    db: Session,
    assignment_id: int,
    inspector_id: int,
    reason: str
) -> Optional[InspectorAssignment]:
    """
    Decline an inspector assignment.

    Args:
        db: Database session
        assignment_id: Assignment ID
        inspector_id: Inspector ID declining the assignment
        reason: Reason for declining

    Returns:
        Optional[InspectorAssignment]: Updated assignment if found

    Raises:
        ValueError: If assignment not in correct state or inspector mismatch
    """
    assignment = db.query(InspectorAssignment).filter(
        InspectorAssignment.id == assignment_id
    ).first()

    if not assignment:
        return None

    # Verify inspector owns this assignment
    if assignment.inspector_id != inspector_id:
        raise ValueError("Assignment does not belong to this inspector")

    # Only assigned or accepted assignments can be declined
    if assignment.status not in [AssignmentStatus.assigned, AssignmentStatus.accepted]:
        raise ValueError(f"Cannot decline assignment in status {assignment.status.value}")

    assignment.status = AssignmentStatus.rejected
    db.commit()
    db.refresh(assignment)

    logger.info(f"Inspector {inspector_id} declined assignment {assignment_id}: {reason}")
    return assignment


def get_inspector_assignments(
    db: Session,
    inspector_id: Optional[int] = None,
    planned_inspection_id: Optional[int] = None,
    status: Optional[AssignmentStatus] = None,
    skip: int = 0,
    limit: int = 100
) -> List[InspectorAssignment]:
    """
    Get list of inspector assignments with filters.

    Args:
        db: Database session
        inspector_id: Filter by inspector
        planned_inspection_id: Filter by planned inspection
        status: Filter by status
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List[InspectorAssignment]: List of assignments
    """
    query = db.query(InspectorAssignment)

    if inspector_id:
        query = query.filter(InspectorAssignment.inspector_id == inspector_id)
    if planned_inspection_id:
        query = query.filter(InspectorAssignment.planned_inspection_id == planned_inspection_id)
    if status:
        query = query.filter(InspectorAssignment.status == status)

    query = query.order_by(InspectorAssignment.assigned_at.desc())
    return query.offset(skip).limit(limit).all()


# Resource Availability Operations
def get_inspector_availability(
    db: Session,
    user_id: int,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None
) -> List[ResourceAvailability]:
    """
    Get inspector availability for a date range.

    Args:
        db: Database session
        user_id: User ID
        date_from: Start date (default: today)
        date_to: End date (default: 30 days from start)

    Returns:
        List[ResourceAvailability]: List of availability records
    """
    if not date_from:
        date_from = date.today()
    if not date_to:
        date_to = date_from + timedelta(days=30)

    availabilities = db.query(ResourceAvailability).filter(
        and_(
            ResourceAvailability.user_id == user_id,
            ResourceAvailability.date >= date_from,
            ResourceAvailability.date <= date_to
        )
    ).order_by(ResourceAvailability.date).all()

    return availabilities


def update_availability(
    db: Session,
    user_id: int,
    availability_date: date,
    data: ResourceAvailabilityUpdate
) -> ResourceAvailability:
    """
    Update inspector availability for a specific date.

    Args:
        db: Database session
        user_id: User ID
        availability_date: Date to update
        data: Availability update data

    Returns:
        ResourceAvailability: Updated or created availability record
    """
    # Check if availability record exists
    availability = db.query(ResourceAvailability).filter(
        and_(
            ResourceAvailability.user_id == user_id,
            ResourceAvailability.date == availability_date
        )
    ).first()

    if availability:
        # Update existing record
        availability.status = data.status
        availability.notes = data.notes
    else:
        # Create new record
        availability = ResourceAvailability(
            user_id=user_id,
            date=availability_date,
            status=data.status,
            notes=data.notes
        )
        db.add(availability)

    db.commit()
    db.refresh(availability)

    logger.info(f"Updated availability for user {user_id} on {availability_date}: {data.status.value}")
    return availability


def bulk_update_availability(
    db: Session,
    user_id: int,
    data: ResourceAvailabilityBulkUpdate
) -> List[ResourceAvailability]:
    """
    Bulk update inspector availability for a date range.

    Args:
        db: Database session
        user_id: User ID
        data: Bulk update data with date range

    Returns:
        List[ResourceAvailability]: List of updated/created availability records

    Raises:
        ValueError: If date range is invalid
    """
    if data.to_date < data.from_date:
        raise ValueError("to_date must be after from_date")

    # Generate list of dates in range
    date_list = []
    current_date = data.from_date
    while current_date <= data.to_date:
        date_list.append(current_date)
        current_date += timedelta(days=1)

    updated_records = []
    for availability_date in date_list:
        # Check if availability record exists
        availability = db.query(ResourceAvailability).filter(
            and_(
                ResourceAvailability.user_id == user_id,
                ResourceAvailability.date == availability_date
            )
        ).first()

        if availability:
            # Update existing record
            availability.status = data.status
            availability.notes = data.notes
        else:
            # Create new record
            availability = ResourceAvailability(
                user_id=user_id,
                date=availability_date,
                status=data.status,
                notes=data.notes
            )
            db.add(availability)

        updated_records.append(availability)

    db.commit()

    logger.info(
        f"Bulk updated availability for user {user_id} from {data.from_date} to {data.to_date}: "
        f"{len(updated_records)} records"
    )
    return updated_records


def check_availability_conflicts(
    db: Session,
    user_id: int,
    check_date: date
) -> bool:
    """
    Check if inspector has availability conflicts on a date.

    Args:
        db: Database session
        user_id: User ID
        check_date: Date to check

    Returns:
        bool: True if inspector is available, False otherwise
    """
    # Check availability record
    availability = db.query(ResourceAvailability).filter(
        and_(
            ResourceAvailability.user_id == user_id,
            ResourceAvailability.date == check_date
        )
    ).first()

    if availability and availability.status != AvailabilityStatus.available:
        return False

    # Check for existing assignments
    existing_assignments = db.query(InspectorAssignment).join(
        PlannedInspection,
        PlannedInspection.id == InspectorAssignment.planned_inspection_id
    ).filter(
        and_(
            InspectorAssignment.inspector_id == user_id,
            PlannedInspection.scheduled_date == check_date,
            InspectorAssignment.status.in_([
                AssignmentStatus.assigned,
                AssignmentStatus.accepted
            ])
        )
    ).count()

    return existing_assignments == 0
