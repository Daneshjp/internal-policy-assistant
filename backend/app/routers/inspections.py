"""
Inspection execution API endpoints.

Module 5: Inspection Execution
"""
import logging
from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_user, RoleChecker
from app.models.user import User
from app.models.inspection import Inspection, SensorData
from app.schemas.inspection import (
    InspectionCreate,
    InspectionUpdate,
    InspectionResponse,
    InspectionListResponse,
    FindingCreate,
    FindingUpdate,
    FindingResponse,
    InspectionPhotoCreate,
    InspectionPhotoResponse,
    MeasurementCreate,
    MeasurementUpdate,
    MeasurementResponse,
    ChecklistResponse,
    ChecklistBulkUpdate,
    SensorDataCreate,
    AIAssessmentResponse,
    SensorDataResponse
)
from app.services import inspection_service, ai_prediction_service
from app.tasks.sensor_polling import trigger_sensor_poll_for_inspection

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/inspections", tags=["Inspections"])


@router.get("", response_model=List[InspectionListResponse])
async def list_inspections(
    asset_id: Optional[int] = Query(None, description="Filter by asset ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    date_from: Optional[date] = Query(None, description="Filter by date range start"),
    date_to: Optional[date] = Query(None, description="Filter by date range end"),
    inspector_id: Optional[int] = Query(None, description="Filter by inspector ID"),
    search: Optional[str] = Query(None, description="Search by asset name or number"),
    inspection_type: Optional[str] = Query(None, description="Filter by inspection type"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get list of inspections with optional filtering.

    Accessible by all authenticated users.
    """
    logger.info(f"User {current_user.id} listing inspections")

    inspections = inspection_service.get_inspections(
        db=db,
        asset_id=asset_id,
        status=status,
        date_from=date_from,
        date_to=date_to,
        inspector_id=inspector_id,
        search=search,
        inspection_type=inspection_type,
        skip=skip,
        limit=limit
    )

    return inspections


@router.post("", response_model=InspectionResponse, status_code=status.HTTP_201_CREATED)
async def create_inspection(
    data: InspectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["inspector", "team_leader", "admin"]))
):
    """
    Create a new inspection.

    Accessible by: inspector, team_leader, admin
    """
    logger.info(f"User {current_user.id} creating inspection for asset {data.asset_id}")

    inspection = inspection_service.create_inspection(
        db=db,
        data=data,
        user_id=current_user.id
    )

    return inspection


@router.get("/{inspection_id}", response_model=InspectionResponse)
async def get_inspection(
    inspection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed inspection information.

    Accessible by all authenticated users.
    """
    logger.info(f"User {current_user.id} retrieving inspection {inspection_id}")

    inspection = inspection_service.get_inspection(db=db, inspection_id=inspection_id)

    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection {inspection_id} not found"
        )

    return inspection


@router.put("/{inspection_id}", response_model=InspectionResponse)
async def update_inspection(
    inspection_id: int,
    data: InspectionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["inspector", "team_leader", "admin"]))
):
    """
    Update an inspection.

    Accessible by: inspector, team_leader, admin
    """
    logger.info(f"User {current_user.id} updating inspection {inspection_id}")

    inspection = inspection_service.update_inspection(
        db=db,
        inspection_id=inspection_id,
        data=data
    )

    return inspection


@router.post("/{inspection_id}/start", response_model=InspectionResponse)
async def start_inspection(
    inspection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["inspector", "team_leader", "admin"]))
):
    """
    Start an inspection.

    Accessible by: inspector, team_leader, admin
    """
    logger.info(f"User {current_user.id} starting inspection {inspection_id}")

    inspection = inspection_service.start_inspection(
        db=db,
        inspection_id=inspection_id,
        inspector_id=current_user.id
    )

    return inspection


@router.post("/{inspection_id}/complete", response_model=InspectionResponse)
async def complete_inspection(
    inspection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["inspector", "team_leader", "admin"]))
):
    """
    Complete an inspection.

    Accessible by: inspector, team_leader, admin
    """
    logger.info(f"User {current_user.id} completing inspection {inspection_id}")

    inspection = inspection_service.complete_inspection(
        db=db,
        inspection_id=inspection_id,
        inspector_id=current_user.id
    )

    return inspection


@router.post("/{inspection_id}/findings", response_model=FindingResponse, status_code=status.HTTP_201_CREATED)
async def add_finding(
    inspection_id: int,
    data: FindingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["inspector", "team_leader", "admin"]))
):
    """
    Add a finding to an inspection.

    Accessible by: inspector, team_leader, admin
    """
    logger.info(f"User {current_user.id} adding finding to inspection {inspection_id}")

    finding = inspection_service.add_finding(
        db=db,
        inspection_id=inspection_id,
        data=data
    )

    return finding


@router.put("/{inspection_id}/findings/{finding_id}", response_model=FindingResponse)
async def update_finding(
    inspection_id: int,
    finding_id: int,
    data: FindingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["inspector", "team_leader", "admin"]))
):
    """
    Update an inspection finding.

    Accessible by: inspector, team_leader, admin
    """
    logger.info(f"User {current_user.id} updating finding {finding_id} in inspection {inspection_id}")

    finding = inspection_service.update_finding(
        db=db,
        inspection_id=inspection_id,
        finding_id=finding_id,
        data=data
    )

    return finding


@router.delete("/{inspection_id}/findings/{finding_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_finding(
    inspection_id: int,
    finding_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["inspector", "team_leader", "admin"]))
):
    """
    Delete an inspection finding.

    Accessible by: inspector, team_leader, admin
    """
    logger.info(f"User {current_user.id} deleting finding {finding_id} from inspection {inspection_id}")

    inspection_service.delete_finding(
        db=db,
        inspection_id=inspection_id,
        finding_id=finding_id
    )

    return None


@router.post("/{inspection_id}/photos", response_model=List[InspectionPhotoResponse], status_code=status.HTTP_201_CREATED)
async def upload_photos(
    inspection_id: int,
    photos: List[InspectionPhotoCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["inspector", "team_leader", "admin"]))
):
    """
    Upload photos for an inspection.

    Accessible by: inspector, team_leader, admin

    Note: This endpoint expects photos to already be uploaded to S3/MinIO.
    The photos parameter should contain the file URLs and metadata.
    """
    logger.info(f"User {current_user.id} uploading {len(photos)} photos to inspection {inspection_id}")

    uploaded_photos = inspection_service.upload_photos(
        db=db,
        inspection_id=inspection_id,
        photos=photos,
        user_id=current_user.id
    )

    return uploaded_photos


@router.delete("/{inspection_id}/photos/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_photo(
    inspection_id: int,
    photo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["inspector", "team_leader", "admin"]))
):
    """
    Delete an inspection photo.

    Accessible by: inspector, team_leader, admin
    """
    logger.info(f"User {current_user.id} deleting photo {photo_id} from inspection {inspection_id}")

    inspection_service.delete_photo(
        db=db,
        inspection_id=inspection_id,
        photo_id=photo_id
    )

    return None


@router.post("/{inspection_id}/measurements", response_model=MeasurementResponse, status_code=status.HTTP_201_CREATED)
async def add_measurement(
    inspection_id: int,
    data: MeasurementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["inspector", "team_leader", "admin"]))
):
    """
    Add a measurement to an inspection.

    Accessible by: inspector, team_leader, admin
    """
    logger.info(f"User {current_user.id} adding measurement to inspection {inspection_id}")

    measurement = inspection_service.add_measurement(
        db=db,
        inspection_id=inspection_id,
        data=data
    )

    return measurement


@router.put("/{inspection_id}/measurements/{measurement_id}", response_model=MeasurementResponse)
async def update_measurement(
    inspection_id: int,
    measurement_id: int,
    data: MeasurementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["inspector", "team_leader", "admin"]))
):
    """
    Update an inspection measurement.

    Accessible by: inspector, team_leader, admin
    """
    logger.info(f"User {current_user.id} updating measurement {measurement_id} in inspection {inspection_id}")

    measurement = inspection_service.update_measurement(
        db=db,
        inspection_id=inspection_id,
        measurement_id=measurement_id,
        data=data
    )

    return measurement


@router.get("/{inspection_id}/checklist", response_model=List[ChecklistResponse])
async def get_checklist(
    inspection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get checklist items for an inspection.

    Accessible by all authenticated users.
    """
    logger.info(f"User {current_user.id} retrieving checklist for inspection {inspection_id}")

    checklist_items = inspection_service.get_checklist(
        db=db,
        inspection_id=inspection_id
    )

    return checklist_items


@router.put("/{inspection_id}/checklist", response_model=List[ChecklistResponse])
async def update_checklist(
    inspection_id: int,
    data: ChecklistBulkUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["inspector", "team_leader", "admin"]))
):
    """
    Update checklist items for an inspection (bulk update).

    Accessible by: inspector, team_leader, admin
    """
    logger.info(f"User {current_user.id} updating checklist for inspection {inspection_id}")

    updated_items = inspection_service.update_checklist(
        db=db,
        inspection_id=inspection_id,
        checklist_items=data.items
    )

    return updated_items


@router.post("/{inspection_id}/ai-assessment", response_model=AIAssessmentResponse, status_code=status.HTTP_201_CREATED)
async def generate_ai_assessment(
    inspection_id: int,
    data: SensorDataCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["inspector", "team_leader", "engineer", "admin"]))
):
    """
    Generate AI-powered failure prediction from sensor data.

    Real-time prediction endpoint for in-progress inspections.

    Accessible by: inspector, team_leader, engineer, admin
    """
    logger.info(f"User {current_user.id} generating AI assessment for inspection {inspection_id}")

    sensor_data, prediction = ai_prediction_service.generate_ai_assessment(
        db=db,
        inspection_id=inspection_id,
        sensor_data=data,
        user_id=current_user.id
    )

    return AIAssessmentResponse(sensor_data=sensor_data, prediction=prediction)


@router.get("/{inspection_id}/ai-assessment/latest", response_model=AIAssessmentResponse)
async def get_latest_ai_assessment(
    inspection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get latest AI assessment for an inspection.

    Accessible by all authenticated users.
    """
    logger.info(f"User {current_user.id} retrieving latest AI assessment for inspection {inspection_id}")

    result = ai_prediction_service.get_latest_assessment(db=db, inspection_id=inspection_id)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No AI assessment found for this inspection"
        )

    sensor_data, prediction = result
    return AIAssessmentResponse(sensor_data=sensor_data, prediction=prediction)


@router.post("/{inspection_id}/poll-sensors", response_model=AIAssessmentResponse)
async def poll_sensors_for_inspection(
    inspection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["inspector", "team_leader", "engineer", "admin"]))
):
    """
    Manually trigger sensor polling and AI prediction for an inspection.

    This endpoint simulates automatic sensor data collection and generates
    a prediction. Useful for testing or on-demand predictions.

    Accessible by: inspector, team_leader, engineer, admin
    """
    logger.info(f"User {current_user.id} manually triggering sensor poll for inspection {inspection_id}")

    # Verify inspection exists and is in progress
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection {inspection_id} not found"
        )

    if inspection.status != 'in_progress':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Inspection must be in progress to poll sensors (current status: {inspection.status})"
        )

    # Trigger sensor polling
    result = trigger_sensor_poll_for_inspection(inspection_id)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to poll sensors and generate prediction"
        )

    return AIAssessmentResponse(
        sensor_data=result['sensor_data'],
        prediction=result['prediction']
    )


@router.get("/{inspection_id}/sensor-history", response_model=List[AIAssessmentResponse])
async def get_sensor_history(
    inspection_id: int,
    limit: int = Query(20, ge=1, le=100, description="Maximum number of records"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get sensor reading history for an inspection.

    Returns all sensor readings and their associated predictions,
    ordered by most recent first.

    Accessible by all authenticated users.
    """
    logger.info(f"User {current_user.id} retrieving sensor history for inspection {inspection_id}")

    # Verify inspection exists
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection {inspection_id} not found"
        )

    # Get sensor data with predictions
    sensor_readings = db.query(SensorData).filter(
        SensorData.inspection_id == inspection_id
    ).order_by(
        SensorData.recorded_at.desc()
    ).limit(limit).all()

    # Build response with predictions
    history = []
    for sensor in sensor_readings:
        if sensor.prediction:
            history.append(AIAssessmentResponse(
                sensor_data=sensor,
                prediction=sensor.prediction
            ))

    return history
