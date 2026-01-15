"""
RBI (Risk-Based Inspection) compliance and audit models.

Module 9: RBI Compliance & Audit
"""
import enum
from sqlalchemy import Column, Integer, String, Text, Enum, Date, Numeric, ForeignKey, DateTime, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin


class RBICategory(enum.Enum):
    """RBI category enumeration."""
    high_risk = "high_risk"
    medium_risk = "medium_risk"
    low_risk = "low_risk"


class RBIAuditStatus(enum.Enum):
    """RBI audit status enumeration."""
    pending = "pending"
    in_progress = "in_progress"
    passed = "passed"
    failed = "failed"
    pending_exception = "pending_exception"


class RBIChecklistStatus(enum.Enum):
    """RBI checklist item status enumeration."""
    pending = "pending"
    pass_ = "pass"
    fail = "fail"
    na = "na"


class RBIGuideline(Base, TimestampMixin):
    """
    RBI guideline model.

    Risk-based inspection guidelines and requirements.
    """
    __tablename__ = "rbi_guidelines"

    id = Column(Integer, primary_key=True, index=True)
    guideline_code = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(Enum(RBICategory), nullable=False)
    inspection_frequency = Column(String(100), nullable=True)
    applicable_asset_types = Column(JSONB, nullable=True)  # Array of asset types
    checklist_items = Column(JSONB, nullable=True)  # Array of checklist items
    is_active = Column(String(10), default='true', nullable=False)

    # Relationships
    checklist_items_rel = relationship("RBIChecklistItem", back_populates="guideline")
    exceptions = relationship("RBIException", back_populates="guideline")

    __table_args__ = (
        Index('idx_rbi_guideline_code', 'guideline_code'),
        Index('idx_rbi_guideline_category', 'category'),
        Index('idx_rbi_guideline_active', 'is_active'),
    )

    def __repr__(self) -> str:
        return f"<RBIGuideline(id={self.id}, guideline_code='{self.guideline_code}', category={self.category.value})>"


class RBIAudit(Base, TimestampMixin):
    """
    RBI audit model.

    Audit of inspection reports for RBI compliance.
    """
    __tablename__ = "rbi_audits"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("inspection_reports.id", ondelete="CASCADE"), nullable=False, unique=True)
    auditor_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    audit_date = Column(Date, nullable=False)
    status = Column(Enum(RBIAuditStatus), default=RBIAuditStatus.pending, nullable=False)
    overall_score = Column(Integer, nullable=True)  # 0-100
    compliance_percentage = Column(Numeric(5, 2), nullable=True)  # 0.00-100.00
    audit_notes = Column(Text, nullable=True)
    locked_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    report = relationship("InspectionReport", back_populates="rbi_audit")
    auditor = relationship("User", foreign_keys=[auditor_id])
    checklist_items = relationship("RBIChecklistItem", back_populates="audit", cascade="all, delete-orphan")

    __table_args__ = (
        Index('idx_rbi_audit_report', 'report_id'),
        Index('idx_rbi_audit_auditor', 'auditor_id'),
        Index('idx_rbi_audit_status', 'status'),
        Index('idx_rbi_audit_date', 'audit_date'),
    )

    def __repr__(self) -> str:
        return f"<RBIAudit(id={self.id}, report_id={self.report_id}, status={self.status.value})>"


class RBIChecklistItem(Base, TimestampMixin):
    """
    RBI checklist item model.

    Individual items checked during RBI audit.
    """
    __tablename__ = "rbi_checklist_items"

    id = Column(Integer, primary_key=True, index=True)
    audit_id = Column(Integer, ForeignKey("rbi_audits.id", ondelete="CASCADE"), nullable=False)
    guideline_id = Column(Integer, ForeignKey("rbi_guidelines.id", ondelete="SET NULL"), nullable=True)
    item_name = Column(String(300), nullable=False)
    status = Column(Enum(RBIChecklistStatus), default=RBIChecklistStatus.pending, nullable=False)
    evidence = Column(Text, nullable=True)
    auditor_comments = Column(Text, nullable=True)

    # Relationships
    audit = relationship("RBIAudit", back_populates="checklist_items")
    guideline = relationship("RBIGuideline", back_populates="checklist_items_rel")

    __table_args__ = (
        Index('idx_rbi_checklist_audit', 'audit_id'),
        Index('idx_rbi_checklist_guideline', 'guideline_id'),
        Index('idx_rbi_checklist_status', 'status'),
    )

    def __repr__(self) -> str:
        return f"<RBIChecklistItem(id={self.id}, audit_id={self.audit_id}, status={self.status.value})>"


class RBIException(Base, TimestampMixin):
    """
    RBI exception model.

    Approved exceptions to RBI guidelines.
    """
    __tablename__ = "rbi_exceptions"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("inspection_reports.id", ondelete="CASCADE"), nullable=False)
    guideline_id = Column(Integer, ForeignKey("rbi_guidelines.id", ondelete="SET NULL"), nullable=True)
    exception_reason = Column(Text, nullable=False)
    approved_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    report = relationship("InspectionReport", back_populates="rbi_exceptions")
    guideline = relationship("RBIGuideline", back_populates="exceptions")
    approved_by = relationship("User", foreign_keys=[approved_by_id])

    __table_args__ = (
        Index('idx_rbi_exception_report', 'report_id'),
        Index('idx_rbi_exception_guideline', 'guideline_id'),
        Index('idx_rbi_exception_approved_by', 'approved_by_id'),
        Index('idx_rbi_exception_approved_at', 'approved_at'),
    )

    def __repr__(self) -> str:
        return f"<RBIException(id={self.id}, report_id={self.report_id}, guideline_id={self.guideline_id})>"
