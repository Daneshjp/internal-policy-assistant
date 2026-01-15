"""
Admin panel and system configuration models.

Module 12: Admin Panel & System Configuration
"""
import enum
from sqlalchemy import Column, Integer, String, Boolean, Enum, ForeignKey, DateTime, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin


class SettingType(enum.Enum):
    """Setting type enumeration."""
    string = "string"
    number = "number"
    boolean = "boolean"
    json = "json"


class ServiceName(enum.Enum):
    """Service name enumeration."""
    api = "api"
    database = "database"
    redis = "redis"
    celery = "celery"
    s3 = "s3"
    email = "email"


class ServiceStatus(enum.Enum):
    """Service status enumeration."""
    healthy = "healthy"
    degraded = "degraded"
    down = "down"


class SystemSetting(Base, TimestampMixin):
    """
    System setting model.

    Configurable system settings for the application.
    """
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String(100), unique=True, index=True, nullable=False)
    setting_value = Column(String(500), nullable=True)
    setting_type = Column(Enum(SettingType), default=SettingType.string, nullable=False)
    description = Column(String(500), nullable=True)
    is_editable = Column(Boolean, default=True, nullable=False)
    updated_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    updated_by = relationship("User", foreign_keys=[updated_by_id])

    __table_args__ = (
        Index('idx_setting_key', 'setting_key'),
        Index('idx_setting_type', 'setting_type'),
        Index('idx_setting_editable', 'is_editable'),
    )

    def __repr__(self) -> str:
        return f"<SystemSetting(id={self.id}, setting_key='{self.setting_key}', setting_type={self.setting_type.value})>"


class AuditLog(Base, TimestampMixin):
    """
    Audit log model.

    Tracks all significant user actions for security and compliance.
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(200), nullable=False, index=True)
    entity_type = Column(String(100), nullable=True)
    entity_id = Column(Integer, nullable=True)
    old_value = Column(JSONB, nullable=True)
    new_value = Column(JSONB, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)

    # Relationships
    user = relationship("User", back_populates="audit_logs")

    __table_args__ = (
        Index('idx_audit_user', 'user_id'),
        Index('idx_audit_action', 'action'),
        Index('idx_audit_entity', 'entity_type', 'entity_id'),
        Index('idx_audit_created', 'created_at'),
    )

    def __repr__(self) -> str:
        return f"<AuditLog(id={self.id}, user_id={self.user_id}, action='{self.action}')>"


class SystemHealth(Base, TimestampMixin):
    """
    System health model.

    Monitors health status of system services.
    """
    __tablename__ = "system_health"

    id = Column(Integer, primary_key=True, index=True)
    service_name = Column(Enum(ServiceName), nullable=False, index=True)
    status = Column(Enum(ServiceStatus), default=ServiceStatus.healthy, nullable=False)
    response_time_ms = Column(Integer, nullable=True)
    last_check_at = Column(DateTime(timezone=True), nullable=False)
    error_message = Column(String(1000), nullable=True)

    __table_args__ = (
        Index('idx_health_service', 'service_name'),
        Index('idx_health_status', 'status'),
        Index('idx_health_last_check', 'last_check_at'),
    )

    def __repr__(self) -> str:
        return f"<SystemHealth(id={self.id}, service={self.service_name.value}, status={self.status.value})>"
