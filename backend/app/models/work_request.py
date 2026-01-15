"""
Work request models.

Module 8: Work Request Integration
"""
import enum
from sqlalchemy import Column, Integer, String, Text, Enum, Numeric, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin


class WRPriority(enum.Enum):
    """Work request priority enumeration."""
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class WRType(enum.Enum):
    """Work request type enumeration."""
    corrective = "corrective"
    preventive = "preventive"
    replacement = "replacement"
    investigation = "investigation"
    other = "other"


class WRStatus(enum.Enum):
    """Work request status enumeration."""
    draft = "draft"
    submitted = "submitted"
    approved = "approved"
    rejected = "rejected"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class SAPSyncStatus(enum.Enum):
    """SAP synchronization status enumeration."""
    pending = "pending"
    syncing = "syncing"
    synced = "synced"
    failed = "failed"
    not_applicable = "not_applicable"


class WRDocumentType(enum.Enum):
    """Work request document type enumeration."""
    attachment = "attachment"
    technical_drawing = "technical_drawing"
    approval_document = "approval_document"
    completion_certificate = "completion_certificate"
    other = "other"


class WorkRequest(Base, TimestampMixin):
    """
    Work request model.

    Generated from inspection findings requiring maintenance or repair.
    """
    __tablename__ = "work_requests"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id", ondelete="SET NULL"), nullable=True)
    finding_id = Column(Integer, ForeignKey("inspection_findings.id", ondelete="SET NULL"), nullable=True)
    report_id = Column(Integer, ForeignKey("inspection_reports.id", ondelete="SET NULL"), nullable=True)
    wr_number = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(Enum(WRPriority), nullable=False)
    wr_type = Column(Enum(WRType), nullable=False)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="SET NULL"), nullable=True)
    estimated_cost = Column(Numeric(12, 2), nullable=True)
    status = Column(Enum(WRStatus), default=WRStatus.draft, nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    sap_sync_status = Column(Enum(SAPSyncStatus), default=SAPSyncStatus.pending, nullable=False)
    sap_sync_at = Column(DateTime(timezone=True), nullable=True)
    sap_error_message = Column(Text, nullable=True)

    # Relationships
    inspection = relationship("Inspection")
    finding = relationship("InspectionFinding", back_populates="work_requests")
    report = relationship("InspectionReport", back_populates="work_requests")
    asset = relationship("Asset", back_populates="work_requests")
    created_by = relationship("User", foreign_keys=[created_by_id])
    approved_by = relationship("User", foreign_keys=[approved_by_id])
    documents = relationship("WRDocument", back_populates="work_request", cascade="all, delete-orphan")

    __table_args__ = (
        Index('idx_wr_number', 'wr_number'),
        Index('idx_wr_inspection', 'inspection_id'),
        Index('idx_wr_finding', 'finding_id'),
        Index('idx_wr_report', 'report_id'),
        Index('idx_wr_asset', 'asset_id'),
        Index('idx_wr_status', 'status'),
        Index('idx_wr_priority', 'priority'),
        Index('idx_wr_sap_status', 'sap_sync_status'),
        Index('idx_wr_created_by', 'created_by_id'),
    )

    def __repr__(self) -> str:
        return f"<WorkRequest(id={self.id}, wr_number='{self.wr_number}', status={self.status.value})>"


class WRDocument(Base, TimestampMixin):
    """
    Work request document model.

    Documents attached to work requests.
    """
    __tablename__ = "wr_documents"

    id = Column(Integer, primary_key=True, index=True)
    wr_id = Column(Integer, ForeignKey("work_requests.id", ondelete="CASCADE"), nullable=False)
    document_type = Column(Enum(WRDocumentType), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), nullable=False)

    # Relationships
    work_request = relationship("WorkRequest", back_populates="documents")

    __table_args__ = (
        Index('idx_wr_doc_wr', 'wr_id'),
        Index('idx_wr_doc_type', 'document_type'),
        Index('idx_wr_doc_uploaded', 'uploaded_at'),
    )

    def __repr__(self) -> str:
        return f"<WRDocument(id={self.id}, wr_id={self.wr_id}, file_name='{self.file_name}')>"
