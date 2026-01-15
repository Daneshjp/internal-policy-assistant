"""
Inspection schemas for API validation and serialization.

Module 5: Inspection Execution
"""
from datetime import datetime, time
from datetime import date as date_type
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict
from enum import Enum


# Enums
class InspectionStatusEnum(str, Enum):
    """Inspection status enumeration."""
    not_started = "not_started"
    in_progress = "in_progress"
    completed = "completed"
    on_hold = "on_hold"
    cancelled = "cancelled"


class InspectionTypeEnum(str, Enum):
    """Inspection type enumeration."""
    routine = "routine"
    statutory = "statutory"
    rbi = "rbi"
    shutdown = "shutdown"
    emergency = "emergency"


class FindingTypeEnum(str, Enum):
    """Finding type enumeration."""
    defect = "defect"
    observation = "observation"
    recommendation = "recommendation"
    ok = "ok"


class FindingSeverityEnum(str, Enum):
    """Finding severity enumeration."""
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class ChecklistStatusEnum(str, Enum):
    """Checklist item status enumeration."""
    pending = "pending"
    pass_ = "pass"
    fail = "fail"
    na = "na"


# Inspection Schemas
class InspectionCreate(BaseModel):
    """Schema for creating a new inspection."""
    asset_id: int = Field(..., description="ID of the asset being inspected")
    planned_inspection_id: Optional[int] = Field(None, description="ID of the planned inspection")
    inspection_type: InspectionTypeEnum = Field(..., description="Type of inspection")
    inspection_date: date_type = Field(..., description="Date of inspection")
    primary_inspector_id: Optional[int] = Field(None, description="ID of primary inspector")
    weather_conditions: Optional[str] = Field(None, max_length=200, description="Weather conditions")
    ambient_temperature: Optional[Decimal] = Field(None, description="Ambient temperature")

    model_config = ConfigDict(from_attributes=True)


class InspectionUpdate(BaseModel):
    """Schema for updating an inspection."""
    status: Optional[InspectionStatusEnum] = None
    inspection_date: Optional[date_type] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    duration_hours: Optional[Decimal] = None
    weather_conditions: Optional[str] = Field(None, max_length=200)
    ambient_temperature: Optional[Decimal] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class InspectionPhotoResponse(BaseModel):
    """Schema for inspection photo response."""
    id: int
    inspection_id: int
    finding_id: Optional[int] = None
    file_name: str
    file_url: str
    caption: Optional[str] = None
    taken_at: Optional[date_type] = None
    uploaded_by_id: Optional[int] = None
    uploaded_at: date_type
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FindingResponse(BaseModel):
    """Schema for inspection finding response."""
    id: int
    inspection_id: int
    finding_type: FindingTypeEnum
    severity: FindingSeverityEnum
    description: str
    location_on_asset: Optional[str] = None
    measurement_value: Optional[Decimal] = None
    measurement_unit: Optional[str] = None
    recommended_action: Optional[str] = None
    photos: Optional[List[dict]] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MeasurementResponse(BaseModel):
    """Schema for inspection measurement response."""
    id: int
    inspection_id: int
    parameter_name: str
    value: Decimal
    unit: str
    min_acceptable: Optional[Decimal] = None
    max_acceptable: Optional[Decimal] = None
    is_within_range: Optional[bool] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChecklistResponse(BaseModel):
    """Schema for inspection checklist response."""
    id: int
    inspection_id: int
    checklist_item: str
    status: ChecklistStatusEnum
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InspectionResponse(BaseModel):
    """Schema for complete inspection response."""
    id: int
    planned_inspection_id: Optional[int] = None
    asset_id: int
    inspection_type: str
    inspection_date: date_type
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    duration_hours: Optional[Decimal] = None
    primary_inspector_id: Optional[int] = None
    status: str
    weather_conditions: Optional[str] = None
    ambient_temperature: Optional[Decimal] = None
    created_at: datetime
    updated_at: datetime
    findings: List[FindingResponse] = []
    photos: List[InspectionPhotoResponse] = []
    measurements: List[MeasurementResponse] = []
    checklist_items: List[ChecklistResponse] = []

    model_config = ConfigDict(from_attributes=True)


class AssetSummary(BaseModel):
    """Minimal asset info for inspection list."""
    asset_name: str = Field(alias='name', serialization_alias='asset_name')
    asset_number: str = Field(alias='asset_code', serialization_alias='asset_number')

    model_config = ConfigDict(from_attributes=True, populate_by_name=True, by_alias=False)


class InspectorSummary(BaseModel):
    """Minimal inspector info for inspection list."""
    full_name: str

    model_config = ConfigDict(from_attributes=True)


class InspectionListResponse(BaseModel):
    """Schema for inspection list item."""
    id: int
    asset_id: int
    inspection_type: str
    inspection_date: date_type
    primary_inspector_id: Optional[int] = None
    status: str
    asset: Optional[AssetSummary] = None
    primary_inspector: Optional[InspectorSummary] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Finding Schemas
class FindingCreate(BaseModel):
    """Schema for creating an inspection finding."""
    finding_type: FindingTypeEnum = Field(..., description="Type of finding")
    severity: FindingSeverityEnum = Field(..., description="Severity level")
    description: str = Field(..., description="Description of the finding")
    location_on_asset: Optional[str] = Field(None, max_length=200, description="Location on asset")
    measurement_value: Optional[Decimal] = Field(None, description="Measurement value if applicable")
    measurement_unit: Optional[str] = Field(None, max_length=50, description="Unit of measurement")
    recommended_action: Optional[str] = Field(None, description="Recommended corrective action")

    model_config = ConfigDict(from_attributes=True)


class FindingUpdate(BaseModel):
    """Schema for updating an inspection finding."""
    finding_type: Optional[FindingTypeEnum] = None
    severity: Optional[FindingSeverityEnum] = None
    description: Optional[str] = None
    location_on_asset: Optional[str] = Field(None, max_length=200)
    measurement_value: Optional[Decimal] = None
    measurement_unit: Optional[str] = Field(None, max_length=50)
    recommended_action: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# Photo Schemas
class InspectionPhotoCreate(BaseModel):
    """Schema for creating an inspection photo."""
    file_name: str = Field(..., description="Name of the file")
    file_url: str = Field(..., description="URL where the file is stored")
    caption: Optional[str] = Field(None, max_length=500, description="Photo caption")
    taken_at: Optional[date_type] = Field(None, description="Date photo was taken")
    finding_id: Optional[int] = Field(None, description="Associated finding ID")

    model_config = ConfigDict(from_attributes=True)


# Measurement Schemas
class MeasurementCreate(BaseModel):
    """Schema for creating an inspection measurement."""
    parameter_name: str = Field(..., max_length=200, description="Name of the parameter")
    value: Decimal = Field(..., description="Measured value")
    unit: str = Field(..., max_length=50, description="Unit of measurement")
    min_acceptable: Optional[Decimal] = Field(None, description="Minimum acceptable value")
    max_acceptable: Optional[Decimal] = Field(None, description="Maximum acceptable value")
    notes: Optional[str] = Field(None, description="Additional notes")

    model_config = ConfigDict(from_attributes=True)


class MeasurementUpdate(BaseModel):
    """Schema for updating an inspection measurement."""
    parameter_name: Optional[str] = Field(None, max_length=200)
    value: Optional[Decimal] = None
    unit: Optional[str] = Field(None, max_length=50)
    min_acceptable: Optional[Decimal] = None
    max_acceptable: Optional[Decimal] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# Checklist Schemas
class ChecklistCreate(BaseModel):
    """Schema for creating a checklist item."""
    checklist_item: str = Field(..., max_length=500, description="Description of checklist item")
    status: ChecklistStatusEnum = Field(ChecklistStatusEnum.pending, description="Status of item")
    notes: Optional[str] = Field(None, description="Completion notes")

    model_config = ConfigDict(from_attributes=True)


class ChecklistUpdate(BaseModel):
    """Schema for updating a checklist item."""
    status: Optional[ChecklistStatusEnum] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ChecklistBulkUpdate(BaseModel):
    """Schema for bulk updating checklist items."""
    items: List[dict] = Field(..., description="List of checklist items to update")

    model_config = ConfigDict(from_attributes=True)


# AI Prediction Enums
class ConsequenceLevelEnum(str, Enum):
    """Consequence of failure enumeration."""
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class PriorityLevelEnum(str, Enum):
    """Priority level enumeration."""
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


# Sensor Data Schemas
class SensorDataCreate(BaseModel):
    """Schema for creating sensor data."""
    pressure: Optional[Decimal] = Field(None, description="Pressure in bar")
    temperature: Optional[Decimal] = Field(None, description="Temperature in Celsius")
    wall_thickness: Optional[Decimal] = Field(None, description="Wall thickness in mm")
    corrosion_rate: Optional[Decimal] = Field(None, description="Corrosion rate in mm/year")
    vibration: Optional[Decimal] = Field(None, description="Vibration in mm/s")
    flow_rate: Optional[Decimal] = Field(None, description="Flow rate in m³/h")
    notes: Optional[str] = Field(None, description="Additional notes")

    model_config = ConfigDict(from_attributes=True)


class SensorDataResponse(BaseModel):
    """Schema for sensor data response."""
    id: int
    inspection_id: int
    pressure: Optional[Decimal] = None
    temperature: Optional[Decimal] = None
    wall_thickness: Optional[Decimal] = None
    corrosion_rate: Optional[Decimal] = None
    vibration: Optional[Decimal] = None
    flow_rate: Optional[Decimal] = None
    notes: Optional[str] = None
    recorded_at: datetime
    recorded_by_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Failure Prediction Schemas
class FailurePredictionResponse(BaseModel):
    """Schema for failure prediction response."""
    id: int
    sensor_data_id: int
    inspection_id: int
    probability_of_failure: Decimal
    consequence_of_failure: ConsequenceLevelEnum
    confidence_score: Decimal
    risk_score: Decimal
    recommended_action: Optional[str] = None
    priority: PriorityLevelEnum
    model_version: str
    prediction_timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


# Combined Response for Real-time Prediction
class AIAssessmentResponse(BaseModel):
    """Schema for combined sensor data and prediction response."""
    sensor_data: SensorDataResponse
    prediction: FailurePredictionResponse

    model_config = ConfigDict(from_attributes=True)
