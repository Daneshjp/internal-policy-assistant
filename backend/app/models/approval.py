"""
Approval workflow models.

Module 7: Multi-Stage Approval Workflow
"""
import enum
from sqlalchemy import Column, Integer, String, Text, Enum, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin


class WorkflowStatus(enum.Enum):
    """Workflow status enumeration."""
    pending = "pending"
    in_progress = "in_progress"
    approved = "approved"
    rejected = "rejected"
    cancelled = "cancelled"


class ApprovalStageEnum(enum.Enum):
    """Approval stage enumeration."""
    inspector = "inspector"
    engineer = "engineer"
    rbi = "rbi"
    team_leader = "team_leader"


class StageStatus(enum.Enum):
    """Stage status enumeration."""
    pending = "pending"
    in_review = "in_review"
    approved = "approved"
    rejected = "rejected"
    skipped = "skipped"


class CommentType(enum.Enum):
    """Comment type enumeration."""
    approval = "approval"
    rejection = "rejection"
    request_changes = "request_changes"
    general = "general"


class ApprovalAction(enum.Enum):
    """Approval action enumeration."""
    created = "created"
    submitted = "submitted"
    approved = "approved"
    rejected = "rejected"
    returned = "returned"
    cancelled = "cancelled"


class ApprovalWorkflow(Base, TimestampMixin):
    """
    Approval workflow model.

    Manages multi-stage approval process for inspection reports.
    """
    __tablename__ = "approval_workflows"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("inspection_reports.id", ondelete="CASCADE"), nullable=False, unique=True)
    current_stage = Column(Enum(ApprovalStageEnum), nullable=True)
    status = Column(Enum(WorkflowStatus), default=WorkflowStatus.pending, nullable=False)

    # Relationships
    report = relationship("InspectionReport", back_populates="approval_workflow")
    stages = relationship("ApprovalStage", back_populates="workflow", cascade="all, delete-orphan", order_by="ApprovalStage.stage_order")
    history = relationship("ApprovalHistory", back_populates="workflow", cascade="all, delete-orphan", order_by="ApprovalHistory.created_at")

    __table_args__ = (
        Index('idx_workflow_report', 'report_id'),
        Index('idx_workflow_status', 'status'),
        Index('idx_workflow_stage', 'current_stage'),
    )

    def __repr__(self) -> str:
        return f"<ApprovalWorkflow(id={self.id}, report_id={self.report_id}, status={self.status.value})>"


class ApprovalStage(Base, TimestampMixin):
    """
    Approval stage model.

    Individual stages in the approval workflow.
    """
    __tablename__ = "approval_stages"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("approval_workflows.id", ondelete="CASCADE"), nullable=False)
    stage_name = Column(String(100), nullable=False)
    stage_order = Column(Integer, nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(Enum(StageStatus), default=StageStatus.pending, nullable=False)
    comments = Column(Text, nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    workflow = relationship("ApprovalWorkflow", back_populates="stages")
    reviewer = relationship("User", foreign_keys=[reviewer_id])
    approval_comments = relationship("ApprovalComment", back_populates="stage", cascade="all, delete-orphan")

    __table_args__ = (
        Index('idx_stage_workflow', 'workflow_id'),
        Index('idx_stage_order', 'stage_order'),
        Index('idx_stage_reviewer', 'reviewer_id'),
        Index('idx_stage_status', 'status'),
    )

    def __repr__(self) -> str:
        return f"<ApprovalStage(id={self.id}, stage_name='{self.stage_name}', status={self.status.value})>"


class ApprovalComment(Base, TimestampMixin):
    """
    Approval comment model.

    Comments and feedback during approval process.
    """
    __tablename__ = "approval_comments"

    id = Column(Integer, primary_key=True, index=True)
    stage_id = Column(Integer, ForeignKey("approval_stages.id", ondelete="CASCADE"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    comment = Column(Text, nullable=False)
    comment_type = Column(Enum(CommentType), default=CommentType.general, nullable=False)

    # Relationships
    stage = relationship("ApprovalStage", back_populates="approval_comments")
    reviewer = relationship("User", foreign_keys=[reviewer_id])

    __table_args__ = (
        Index('idx_comment_stage', 'stage_id'),
        Index('idx_comment_reviewer', 'reviewer_id'),
        Index('idx_comment_type', 'comment_type'),
        Index('idx_comment_created', 'created_at'),
    )

    def __repr__(self) -> str:
        return f"<ApprovalComment(id={self.id}, stage_id={self.stage_id}, type={self.comment_type.value})>"


class ApprovalHistory(Base, TimestampMixin):
    """
    Approval history model.

    Audit trail for approval workflow actions.
    """
    __tablename__ = "approval_history"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("approval_workflows.id", ondelete="CASCADE"), nullable=False)
    action = Column(Enum(ApprovalAction), nullable=False)
    performed_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    stage_name = Column(String(100), nullable=True)
    comments = Column(Text, nullable=True)

    # Relationships
    workflow = relationship("ApprovalWorkflow", back_populates="history")
    performed_by = relationship("User", foreign_keys=[performed_by_id])

    __table_args__ = (
        Index('idx_history_workflow', 'workflow_id'),
        Index('idx_history_action', 'action'),
        Index('idx_history_performed_by', 'performed_by_id'),
        Index('idx_history_created', 'created_at'),
    )

    def __repr__(self) -> str:
        return f"<ApprovalHistory(id={self.id}, workflow_id={self.workflow_id}, action={self.action.value})>"
