"""
User authentication and session models.

Module 1: Authentication & User Management
"""
import enum
from sqlalchemy import Column, Integer, String, Boolean, Enum, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin


class UserRole(enum.Enum):
    """User role enumeration."""
    inspector = "inspector"
    team_leader = "team_leader"
    engineer = "engineer"
    rbi_auditor = "rbi_auditor"
    admin = "admin"


class User(Base, TimestampMixin):
    """
    User model for authentication and authorization.

    Supports both email/password and OAuth authentication.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)  # Nullable for OAuth users
    full_name = Column(String(100), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.inspector, nullable=False)
    department = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    oauth_provider = Column(String(50), nullable=True)  # 'google', 'azure', etc.
    avatar_url = Column(String(500), nullable=True)

    # Relationships
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    created_assets = relationship("Asset", back_populates="created_by", foreign_keys="Asset.created_by_id")
    teams_led = relationship("Team", back_populates="team_leader", foreign_keys="Team.team_leader_id")
    team_memberships = relationship("TeamMember", back_populates="user")
    inspector_assignments = relationship("InspectorAssignment", back_populates="inspector", foreign_keys="InspectorAssignment.inspector_id")
    resource_availabilities = relationship("ResourceAvailability", back_populates="user")
    inspections = relationship("Inspection", back_populates="primary_inspector", foreign_keys="Inspection.primary_inspector_id")
    escalations_assigned = relationship("Escalation", back_populates="assigned_to", foreign_keys="Escalation.assigned_to_id")
    notifications = relationship("Notification", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")

    __table_args__ = (
        Index('idx_user_email', 'email'),
        Index('idx_user_role', 'role'),
        Index('idx_user_active', 'is_active'),
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', role='{self.role.value}')>"


class RefreshToken(Base, TimestampMixin):
    """
    Refresh token for JWT authentication.

    Stores refresh tokens to allow token renewal without re-authentication.
    """
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(500), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked = Column(Boolean, default=False, nullable=False)

    # Relationships
    user = relationship("User", back_populates="refresh_tokens")

    __table_args__ = (
        Index('idx_refresh_token_user', 'user_id'),
        Index('idx_refresh_token_expires', 'expires_at'),
        Index('idx_refresh_token_revoked', 'revoked'),
    )

    def __repr__(self) -> str:
        return f"<RefreshToken(id={self.id}, user_id={self.user_id}, revoked={self.revoked})>"


class UserSession(Base, TimestampMixin):
    """
    User session tracking for security and auditing.

    Tracks active user sessions with IP address and user agent information.
    """
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ip_address = Column(String(45), nullable=True)  # IPv6 max length
    user_agent = Column(String(500), nullable=True)
    last_activity = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="sessions")

    __table_args__ = (
        Index('idx_session_user', 'user_id'),
        Index('idx_session_last_activity', 'last_activity'),
    )

    def __repr__(self) -> str:
        return f"<UserSession(id={self.id}, user_id={self.user_id}, ip={self.ip_address})>"
