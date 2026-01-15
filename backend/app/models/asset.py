"""
Asset and equipment management models.

Module 2: Asset & Equipment Management
"""
import enum
from sqlalchemy import Column, Integer, String, Text, Enum, Date, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin


class AssetType(enum.Enum):
    """Asset type enumeration."""
    pressure_vessel = "pressure_vessel"
    pipeline = "pipeline"
    tank = "tank"
    pump = "pump"
    heat_exchanger = "heat_exchanger"
    valve = "valve"
    compressor = "compressor"
    other = "other"


class AssetCriticality(enum.Enum):
    """Asset criticality enumeration."""
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class AssetStatus(enum.Enum):
    """Asset status enumeration."""
    active = "active"
    inactive = "inactive"
    maintenance = "maintenance"
    decommissioned = "decommissioned"


class DocumentType(enum.Enum):
    """Asset document type enumeration."""
    technical_drawing = "technical_drawing"
    specification = "specification"
    certificate = "certificate"
    manual = "manual"
    inspection_report = "inspection_report"
    other = "other"


class Asset(Base, TimestampMixin):
    """
    Asset/Equipment model.

    Represents physical assets subject to inspection.
    """
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    asset_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    asset_type = Column(Enum(AssetType), nullable=False)
    location = Column(String(200), nullable=True)
    facility = Column(String(200), nullable=True)
    unit = Column(String(100), nullable=True)
    criticality = Column(Enum(AssetCriticality), default=AssetCriticality.medium, nullable=False)
    manufacturer = Column(String(200), nullable=True)
    model = Column(String(200), nullable=True)
    serial_number = Column(String(100), nullable=True)
    installation_date = Column(Date, nullable=True)
    last_inspection_date = Column(Date, nullable=True)
    next_inspection_due = Column(Date, nullable=True)
    rbi_category = Column(String(50), nullable=True)
    status = Column(Enum(AssetStatus), default=AssetStatus.active, nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    created_by = relationship("User", back_populates="created_assets", foreign_keys=[created_by_id])
    documents = relationship("AssetDocument", back_populates="asset", cascade="all, delete-orphan")
    planned_inspections = relationship("PlannedInspection", back_populates="asset")
    inspections = relationship("Inspection", back_populates="asset")
    work_requests = relationship("WorkRequest", back_populates="asset")

    __table_args__ = (
        Index('idx_asset_code', 'asset_code'),
        Index('idx_asset_type', 'asset_type'),
        Index('idx_asset_criticality', 'criticality'),
        Index('idx_asset_status', 'status'),
        Index('idx_asset_location', 'location'),
        Index('idx_asset_facility', 'facility'),
        Index('idx_asset_next_inspection', 'next_inspection_due'),
    )

    def __repr__(self) -> str:
        return f"<Asset(id={self.id}, asset_code='{self.asset_code}', name='{self.name}')>"


class AssetDocument(Base, TimestampMixin):
    """
    Asset document/attachment model.

    Stores references to documents associated with assets.
    """
    __tablename__ = "asset_documents"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False)
    document_type = Column(Enum(DocumentType), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    uploaded_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    uploaded_at = Column(DateTime(timezone=True), nullable=False)

    # Relationships
    asset = relationship("Asset", back_populates="documents")
    uploaded_by = relationship("User")

    __table_args__ = (
        Index('idx_asset_doc_asset', 'asset_id'),
        Index('idx_asset_doc_type', 'document_type'),
        Index('idx_asset_doc_uploaded', 'uploaded_at'),
    )

    def __repr__(self) -> str:
        return f"<AssetDocument(id={self.id}, asset_id={self.asset_id}, file_name='{self.file_name}')>"
