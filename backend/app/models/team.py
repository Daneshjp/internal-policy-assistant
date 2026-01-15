"""
Team and resource management models.

Module 4: Resource Coordination
"""
import enum
from sqlalchemy import Column, Integer, String, Boolean, Enum, Date, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin


class RoleInTeam(enum.Enum):
    """Team member role enumeration."""
    leader = "leader"
    senior_inspector = "senior_inspector"
    inspector = "inspector"
    trainee = "trainee"


class AssignmentRole(enum.Enum):
    """Inspector assignment role enumeration."""
    lead = "lead"
    assistant = "assistant"
    trainee = "trainee"


class AssignmentStatus(enum.Enum):
    """Assignment status enumeration."""
    assigned = "assigned"
    accepted = "accepted"
    rejected = "rejected"
    completed = "completed"
    cancelled = "cancelled"


class AvailabilityStatus(enum.Enum):
    """Resource availability status enumeration."""
    available = "available"
    on_assignment = "on_assignment"
    on_leave = "on_leave"
    training = "training"
    unavailable = "unavailable"


class Team(Base, TimestampMixin):
    """
    Team model for organizing inspectors.

    Groups inspectors into teams for coordination and assignment.
    """
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    team_leader_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    department = Column(String(100), nullable=True)
    specialization = Column(String(200), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    team_leader = relationship("User", back_populates="teams_led", foreign_keys=[team_leader_id])
    members = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")

    __table_args__ = (
        Index('idx_team_name', 'name'),
        Index('idx_team_leader', 'team_leader_id'),
        Index('idx_team_active', 'is_active'),
        Index('idx_team_department', 'department'),
    )

    def __repr__(self) -> str:
        return f"<Team(id={self.id}, name='{self.name}')>"


class TeamMember(Base, TimestampMixin):
    """
    Team membership model.

    Associates users with teams and their roles within teams.
    """
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role_in_team = Column(Enum(RoleInTeam), default=RoleInTeam.inspector, nullable=False)
    joined_at = Column(DateTime(timezone=True), nullable=False)

    # Relationships
    team = relationship("Team", back_populates="members")
    user = relationship("User", back_populates="team_memberships")

    __table_args__ = (
        Index('idx_team_member_team', 'team_id'),
        Index('idx_team_member_user', 'user_id'),
        Index('idx_team_member_role', 'role_in_team'),
    )

    def __repr__(self) -> str:
        return f"<TeamMember(id={self.id}, team_id={self.team_id}, user_id={self.user_id})>"


class InspectorAssignment(Base, TimestampMixin):
    """
    Inspector assignment model.

    Assigns inspectors to planned inspections.
    """
    __tablename__ = "inspector_assignments"

    id = Column(Integer, primary_key=True, index=True)
    planned_inspection_id = Column(Integer, ForeignKey("planned_inspections.id", ondelete="CASCADE"), nullable=False)
    inspector_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(Enum(AssignmentRole), default=AssignmentRole.lead, nullable=False)
    assigned_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assigned_at = Column(DateTime(timezone=True), nullable=False)
    status = Column(Enum(AssignmentStatus), default=AssignmentStatus.assigned, nullable=False)

    # Relationships
    planned_inspection = relationship("PlannedInspection", back_populates="inspector_assignments")
    inspector = relationship("User", back_populates="inspector_assignments", foreign_keys=[inspector_id])
    assigned_by = relationship("User", foreign_keys=[assigned_by_id])

    __table_args__ = (
        Index('idx_assignment_inspection', 'planned_inspection_id'),
        Index('idx_assignment_inspector', 'inspector_id'),
        Index('idx_assignment_status', 'status'),
        Index('idx_assignment_date', 'assigned_at'),
    )

    def __repr__(self) -> str:
        return f"<InspectorAssignment(id={self.id}, planned_inspection_id={self.planned_inspection_id}, inspector_id={self.inspector_id})>"


class ResourceAvailability(Base, TimestampMixin):
    """
    Resource availability tracking model.

    Tracks inspector availability for scheduling.
    """
    __tablename__ = "resource_availabilities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    status = Column(Enum(AvailabilityStatus), default=AvailabilityStatus.available, nullable=False)
    notes = Column(String(500), nullable=True)

    # Relationships
    user = relationship("User", back_populates="resource_availabilities")

    __table_args__ = (
        Index('idx_availability_user', 'user_id'),
        Index('idx_availability_date', 'date'),
        Index('idx_availability_status', 'status'),
        Index('idx_availability_user_date', 'user_id', 'date'),
    )

    def __repr__(self) -> str:
        return f"<ResourceAvailability(id={self.id}, user_id={self.user_id}, date={self.date}, status={self.status.value})>"
