"""
Escalation and notification models.

Module 11: Error Handling & Escalation
"""
import enum
from sqlalchemy import Column, Integer, String, Text, Enum, Boolean, ForeignKey, DateTime, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin


class EntityType(enum.Enum):
    """Entity type enumeration."""
    inspection = "inspection"
    report = "report"
    approval = "approval"
    work_request = "work_request"
    finding = "finding"


class EscalationLevel(enum.Enum):
    """Escalation level enumeration."""
    level_1 = "level_1"
    level_2 = "level_2"
    level_3 = "level_3"
    critical = "critical"


class EscalationReason(enum.Enum):
    """Escalation reason enumeration."""
    overdue = "overdue"
    critical_finding = "critical_finding"
    approval_stuck = "approval_stuck"
    rbi_failure = "rbi_failure"
    manual = "manual"


class EscalationStatus(enum.Enum):
    """Escalation status enumeration."""
    open = "open"
    acknowledged = "acknowledged"
    in_progress = "in_progress"
    resolved = "resolved"
    cancelled = "cancelled"


class NotificationType(enum.Enum):
    """Notification type enumeration."""
    info = "info"
    warning = "warning"
    error = "error"
    success = "success"
    escalation = "escalation"


class ErrorType(enum.Enum):
    """Error type enumeration."""
    validation = "validation"
    database = "database"
    external_api = "external_api"
    permission = "permission"
    business_logic = "business_logic"
    system = "system"


class ErrorSeverity(enum.Enum):
    """Error severity enumeration."""
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class Escalation(Base, TimestampMixin):
    """
    Escalation model.

    Tracks escalated issues requiring management attention.
    """
    __tablename__ = "escalations"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(Enum(EntityType), nullable=False)
    entity_id = Column(Integer, nullable=False)
    escalation_level = Column(Enum(EscalationLevel), nullable=False)
    reason = Column(Enum(EscalationReason), nullable=False)
    assigned_to_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    escalated_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(Enum(EscalationStatus), default=EscalationStatus.open, nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    assigned_to = relationship("User", back_populates="escalations_assigned", foreign_keys=[assigned_to_id])
    escalated_by = relationship("User", foreign_keys=[escalated_by_id])

    __table_args__ = (
        Index('idx_escalation_entity', 'entity_type', 'entity_id'),
        Index('idx_escalation_level', 'escalation_level'),
        Index('idx_escalation_reason', 'reason'),
        Index('idx_escalation_status', 'status'),
        Index('idx_escalation_assigned_to', 'assigned_to_id'),
        Index('idx_escalation_created', 'created_at'),
    )

    def __repr__(self) -> str:
        return f"<Escalation(id={self.id}, entity_type={self.entity_type.value}, level={self.escalation_level.value})>"


class EscalationRule(Base, TimestampMixin):
    """
    Escalation rule model.

    Automated escalation rules and conditions.
    """
    __tablename__ = "escalation_rules"

    id = Column(Integer, primary_key=True, index=True)
    rule_name = Column(String(200), nullable=False, index=True)
    entity_type = Column(Enum(EntityType), nullable=False)
    condition = Column(JSONB, nullable=False)  # Rule condition configuration
    escalation_level = Column(Enum(EscalationLevel), nullable=False)
    notify_roles = Column(JSONB, nullable=True)  # Array of roles to notify
    is_active = Column(String(10), default='true', nullable=False)

    __table_args__ = (
        Index('idx_escalation_rule_name', 'rule_name'),
        Index('idx_escalation_rule_entity', 'entity_type'),
        Index('idx_escalation_rule_active', 'is_active'),
    )

    def __repr__(self) -> str:
        return f"<EscalationRule(id={self.id}, rule_name='{self.rule_name}', entity_type={self.entity_type.value})>"


class Notification(Base, TimestampMixin):
    """
    Notification model.

    User notifications and alerts.
    """
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(Enum(NotificationType), default=NotificationType.info, nullable=False)
    entity_type = Column(String(50), nullable=True)
    entity_id = Column(Integer, nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    read_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="notifications")

    __table_args__ = (
        Index('idx_notification_user', 'user_id'),
        Index('idx_notification_type', 'notification_type'),
        Index('idx_notification_read', 'is_read'),
        Index('idx_notification_created', 'created_at'),
        Index('idx_notification_entity', 'entity_type', 'entity_id'),
    )

    def __repr__(self) -> str:
        return f"<Notification(id={self.id}, user_id={self.user_id}, type={self.notification_type.value})>"


class SystemError(Base, TimestampMixin):
    """
    System error model.

    Tracks system errors for monitoring and debugging.
    """
    __tablename__ = "system_errors"

    id = Column(Integer, primary_key=True, index=True)
    error_code = Column(String(100), nullable=True, index=True)
    error_message = Column(Text, nullable=False)
    error_type = Column(Enum(ErrorType), nullable=False)
    severity = Column(Enum(ErrorSeverity), nullable=False)
    context = Column(JSONB, nullable=True)  # Error context (stack trace, request info, etc.)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    resolved = Column(Boolean, default=False, nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User")

    __table_args__ = (
        Index('idx_error_code', 'error_code'),
        Index('idx_error_type', 'error_type'),
        Index('idx_error_severity', 'severity'),
        Index('idx_error_resolved', 'resolved'),
        Index('idx_error_created', 'created_at'),
        Index('idx_error_user', 'user_id'),
    )

    def __repr__(self) -> str:
        return f"<SystemError(id={self.id}, error_type={self.error_type.value}, severity={self.severity.value})>"
