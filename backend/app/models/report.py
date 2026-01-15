"""
Inspection report models.

Module 6: Draft Report & Quality Control
"""
import enum
from sqlalchemy import Column, Integer, String, Text, Enum, ForeignKey, DateTime, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin


class ReportType(enum.Enum):
    """Report type enumeration."""
    routine_inspection = "routine_inspection"
    statutory_inspection = "statutory_inspection"
    rbi_inspection = "rbi_inspection"
    shutdown_inspection = "shutdown_inspection"
    emergency_inspection = "emergency_inspection"
    summary = "summary"


class ReportStatus(enum.Enum):
    """Report status enumeration."""
    draft = "draft"
    qc_pending = "qc_pending"
    qc_approved = "qc_approved"
    qc_rejected = "qc_rejected"
    submitted = "submitted"
    approved = "approved"
    rejected = "rejected"
    locked = "locked"


class InspectionReport(Base, TimestampMixin):
    """
    Inspection report model.

    Generated reports from inspections with QC workflow.
    """
    __tablename__ = "inspection_reports"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id", ondelete="CASCADE"), nullable=False)
    report_number = Column(String(100), unique=True, index=True, nullable=False)
    report_type = Column(Enum(ReportType), nullable=False)
    version = Column(Integer, default=1, nullable=False)
    status = Column(Enum(ReportStatus), default=ReportStatus.draft, nullable=False)
    executive_summary = Column(Text, nullable=True)
    detailed_findings = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    conclusions = Column(Text, nullable=True)
    generated_at = Column(DateTime(timezone=True), nullable=False)
    generated_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    qc_reviewed_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    qc_reviewed_at = Column(DateTime(timezone=True), nullable=True)
    qc_comments = Column(Text, nullable=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    inspection = relationship("Inspection", back_populates="reports")
    generated_by = relationship("User", foreign_keys=[generated_by_id])
    qc_reviewed_by = relationship("User", foreign_keys=[qc_reviewed_by_id])
    versions = relationship("ReportVersion", back_populates="report", cascade="all, delete-orphan")
    approval_workflow = relationship("ApprovalWorkflow", back_populates="report", uselist=False)
    work_requests = relationship("WorkRequest", back_populates="report")
    rbi_audit = relationship("RBIAudit", back_populates="report", uselist=False)
    rbi_exceptions = relationship("RBIException", back_populates="report")

    __table_args__ = (
        Index('idx_report_inspection', 'inspection_id'),
        Index('idx_report_number', 'report_number'),
        Index('idx_report_status', 'status'),
        Index('idx_report_type', 'report_type'),
        Index('idx_report_generated', 'generated_at'),
    )

    def __repr__(self) -> str:
        return f"<InspectionReport(id={self.id}, report_number='{self.report_number}', status={self.status.value})>"


class ReportTemplate(Base, TimestampMixin):
    """
    Report template model.

    Templates for generating standardized reports.
    """
    __tablename__ = "report_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    inspection_type = Column(Enum('routine', 'statutory', 'rbi', 'shutdown', 'emergency', name='template_inspection_type_enum'), nullable=True)
    template_html = Column(Text, nullable=False)
    variables = Column(JSONB, nullable=True)  # Template variables and their definitions
    is_active = Column(String(10), default='true', nullable=False)

    __table_args__ = (
        Index('idx_template_name', 'name'),
        Index('idx_template_type', 'inspection_type'),
        Index('idx_template_active', 'is_active'),
    )

    def __repr__(self) -> str:
        return f"<ReportTemplate(id={self.id}, name='{self.name}')>"


class ReportVersion(Base, TimestampMixin):
    """
    Report version model.

    Tracks version history of reports.
    """
    __tablename__ = "report_versions"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("inspection_reports.id", ondelete="CASCADE"), nullable=False)
    version_number = Column(Integer, nullable=False)
    content = Column(JSONB, nullable=False)  # Full report content snapshot
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    report = relationship("InspectionReport", back_populates="versions")
    created_by = relationship("User", foreign_keys=[created_by_id])

    __table_args__ = (
        Index('idx_version_report', 'report_id'),
        Index('idx_version_number', 'version_number'),
        Index('idx_version_created', 'created_at'),
    )

    def __repr__(self) -> str:
        return f"<ReportVersion(id={self.id}, report_id={self.report_id}, version={self.version_number})>"
