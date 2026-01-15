"""
Inspection execution and data entry models.

Module 5: Inspection Execution & Data Entry
"""
import enum
from sqlalchemy import Column, Integer, String, Text, Enum, Date, Time, Numeric, Boolean, ForeignKey, Index, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from app.models.base import TimestampMixin


class InspectionStatus(enum.Enum):
    """Inspection status enumeration."""
    not_started = "not_started"
    in_progress = "in_progress"
    completed = "completed"
    on_hold = "on_hold"
    cancelled = "cancelled"


class FindingType(enum.Enum):
    """Finding type enumeration."""
    defect = "defect"
    observation = "observation"
    recommendation = "recommendation"
    ok = "ok"


class FindingSeverity(enum.Enum):
    """Finding severity enumeration."""
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class ChecklistItemStatus(enum.Enum):
    """Checklist item status enumeration."""
    pending = "pending"
    pass_ = "pass"
    fail = "fail"
    na = "na"


class Inspection(Base, TimestampMixin):
    """
    Inspection execution model.

    Records actual inspection activities and results.
    """
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    planned_inspection_id = Column(Integer, ForeignKey("planned_inspections.id", ondelete="SET NULL"), nullable=True)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False)
    inspection_type = Column(Enum('routine', 'statutory', 'rbi', 'shutdown', 'emergency', name='inspection_type_enum'), nullable=False)
    inspection_date = Column(Date, nullable=False, index=True)
    start_time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)
    duration_hours = Column(Numeric(5, 2), nullable=True)
    primary_inspector_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(Enum(InspectionStatus), default=InspectionStatus.not_started, nullable=False)
    weather_conditions = Column(String(200), nullable=True)
    ambient_temperature = Column(Numeric(5, 2), nullable=True)

    # Relationships
    planned_inspection = relationship("PlannedInspection", back_populates="inspections")
    asset = relationship("Asset", back_populates="inspections")
    primary_inspector = relationship("User", back_populates="inspections", foreign_keys=[primary_inspector_id])
    findings = relationship("InspectionFinding", back_populates="inspection", cascade="all, delete-orphan")
    photos = relationship("InspectionPhoto", back_populates="inspection", cascade="all, delete-orphan")
    measurements = relationship("InspectionMeasurement", back_populates="inspection", cascade="all, delete-orphan")
    checklist_items = relationship("InspectionChecklist", back_populates="inspection", cascade="all, delete-orphan")
    reports = relationship("InspectionReport", back_populates="inspection")
    sensor_data = relationship("SensorData", back_populates="inspection", cascade="all, delete-orphan")
    predictions = relationship("FailurePrediction", back_populates="inspection", cascade="all, delete-orphan")

    __table_args__ = (
        Index('idx_inspection_planned', 'planned_inspection_id'),
        Index('idx_inspection_asset', 'asset_id'),
        Index('idx_inspection_date', 'inspection_date'),
        Index('idx_inspection_status', 'status'),
        Index('idx_inspection_inspector', 'primary_inspector_id'),
        Index('idx_inspection_type', 'inspection_type'),
    )

    def __repr__(self) -> str:
        return f"<Inspection(id={self.id}, asset_id={self.asset_id}, date={self.inspection_date})>"


class InspectionFinding(Base, TimestampMixin):
    """
    Inspection finding model.

    Records defects, observations, and recommendations from inspections.
    """
    __tablename__ = "inspection_findings"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id", ondelete="CASCADE"), nullable=False)
    finding_type = Column(Enum(FindingType), nullable=False)
    severity = Column(Enum(FindingSeverity), nullable=False)
    description = Column(Text, nullable=False)
    location_on_asset = Column(String(200), nullable=True)
    measurement_value = Column(Numeric(10, 2), nullable=True)
    measurement_unit = Column(String(50), nullable=True)
    recommended_action = Column(Text, nullable=True)
    photos = Column(JSONB, nullable=True)  # Array of photo URLs

    # Relationships
    inspection = relationship("Inspection", back_populates="findings")
    photos_rel = relationship("InspectionPhoto", back_populates="finding", cascade="all, delete-orphan")
    work_requests = relationship("WorkRequest", back_populates="finding")

    __table_args__ = (
        Index('idx_finding_inspection', 'inspection_id'),
        Index('idx_finding_type', 'finding_type'),
        Index('idx_finding_severity', 'severity'),
    )

    def __repr__(self) -> str:
        return f"<InspectionFinding(id={self.id}, inspection_id={self.inspection_id}, severity={self.severity.value})>"


class InspectionPhoto(Base, TimestampMixin):
    """
    Inspection photo model.

    Stores references to photos taken during inspections.
    """
    __tablename__ = "inspection_photos"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id", ondelete="CASCADE"), nullable=False)
    finding_id = Column(Integer, ForeignKey("inspection_findings.id", ondelete="SET NULL"), nullable=True)
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    caption = Column(String(500), nullable=True)
    taken_at = Column(Date, nullable=True)
    uploaded_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    uploaded_at = Column(Date, nullable=False)

    # Relationships
    inspection = relationship("Inspection", back_populates="photos")
    finding = relationship("InspectionFinding", back_populates="photos_rel")
    uploaded_by = relationship("User")

    __table_args__ = (
        Index('idx_photo_inspection', 'inspection_id'),
        Index('idx_photo_finding', 'finding_id'),
        Index('idx_photo_uploaded', 'uploaded_at'),
    )

    def __repr__(self) -> str:
        return f"<InspectionPhoto(id={self.id}, inspection_id={self.inspection_id}, file_name='{self.file_name}')>"


class InspectionMeasurement(Base, TimestampMixin):
    """
    Inspection measurement model.

    Records quantitative measurements taken during inspections.
    """
    __tablename__ = "inspection_measurements"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id", ondelete="CASCADE"), nullable=False)
    parameter_name = Column(String(200), nullable=False)
    value = Column(Numeric(10, 2), nullable=False)
    unit = Column(String(50), nullable=False)
    min_acceptable = Column(Numeric(10, 2), nullable=True)
    max_acceptable = Column(Numeric(10, 2), nullable=True)
    is_within_range = Column(Boolean, nullable=True)
    notes = Column(Text, nullable=True)

    # Relationships
    inspection = relationship("Inspection", back_populates="measurements")

    __table_args__ = (
        Index('idx_measurement_inspection', 'inspection_id'),
        Index('idx_measurement_parameter', 'parameter_name'),
        Index('idx_measurement_range', 'is_within_range'),
    )

    def __repr__(self) -> str:
        return f"<InspectionMeasurement(id={self.id}, parameter='{self.parameter_name}', value={self.value})>"


class InspectionChecklist(Base, TimestampMixin):
    """
    Inspection checklist model.

    Tracks checklist items for standardized inspections.
    """
    __tablename__ = "inspection_checklists"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id", ondelete="CASCADE"), nullable=False)
    checklist_item = Column(String(500), nullable=False)
    status = Column(Enum(ChecklistItemStatus), default=ChecklistItemStatus.pending, nullable=False)
    notes = Column(Text, nullable=True)

    # Relationships
    inspection = relationship("Inspection", back_populates="checklist_items")

    __table_args__ = (
        Index('idx_checklist_inspection', 'inspection_id'),
        Index('idx_checklist_status', 'status'),
    )

    def __repr__(self) -> str:
        return f"<InspectionChecklist(id={self.id}, inspection_id={self.inspection_id}, status={self.status.value})>"


class ConsequenceLevel(enum.Enum):
    """Consequence of failure level enumeration."""
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class PriorityLevel(enum.Enum):
    """Priority level enumeration."""
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class SensorData(Base, TimestampMixin):
    """
    Sensor data model for AI-powered failure prediction.

    Stores real-time sensor readings during inspections.
    """
    __tablename__ = "sensor_data"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id", ondelete="CASCADE"), nullable=False)

    # Sensor Parameters (6 key metrics)
    pressure = Column(Numeric(10, 2), nullable=True)  # bar
    temperature = Column(Numeric(10, 2), nullable=True)  # Celsius
    wall_thickness = Column(Numeric(10, 2), nullable=True)  # mm
    corrosion_rate = Column(Numeric(10, 4), nullable=True)  # mm/year
    vibration = Column(Numeric(10, 2), nullable=True)  # mm/s
    flow_rate = Column(Numeric(10, 2), nullable=True)  # m³/h

    # Metadata
    recorded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    recorded_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    notes = Column(Text, nullable=True)

    # Relationships
    inspection = relationship("Inspection", back_populates="sensor_data")
    prediction = relationship("FailurePrediction", back_populates="sensor_data", uselist=False, cascade="all, delete-orphan")
    recorded_by = relationship("User")

    __table_args__ = (
        Index('idx_sensor_inspection', 'inspection_id'),
        Index('idx_sensor_recorded', 'recorded_at'),
    )

    def __repr__(self) -> str:
        return f"<SensorData(id={self.id}, inspection_id={self.inspection_id})>"


class FailurePrediction(Base, TimestampMixin):
    """
    AI-powered failure prediction model.

    Stores prediction results from the mock AI engine.
    """
    __tablename__ = "failure_predictions"

    id = Column(Integer, primary_key=True, index=True)
    sensor_data_id = Column(Integer, ForeignKey("sensor_data.id", ondelete="CASCADE"), nullable=False, unique=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id", ondelete="CASCADE"), nullable=False)

    # Prediction Outputs
    probability_of_failure = Column(Numeric(5, 2), nullable=False)  # 0-100%
    consequence_of_failure = Column(Enum(ConsequenceLevel), nullable=False)
    confidence_score = Column(Numeric(5, 2), nullable=False)  # 0-100%

    # Risk Score (calculated)
    risk_score = Column(Numeric(10, 2), nullable=False)  # PoF * CoF

    # Recommendations
    recommended_action = Column(Text, nullable=True)
    priority = Column(Enum(PriorityLevel), nullable=False)

    # Model metadata (for future ML integration)
    model_version = Column(String(50), default="mock_v1.0", nullable=False)
    prediction_timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    sensor_data = relationship("SensorData", back_populates="prediction")
    inspection = relationship("Inspection", back_populates="predictions")

    __table_args__ = (
        Index('idx_prediction_inspection', 'inspection_id'),
        Index('idx_prediction_consequence', 'consequence_of_failure'),
        Index('idx_prediction_priority', 'priority'),
        Index('idx_prediction_risk', 'risk_score'),
    )

    def __repr__(self) -> str:
        return f"<FailurePrediction(id={self.id}, pof={self.probability_of_failure}%, cof={self.consequence_of_failure.value})>"
