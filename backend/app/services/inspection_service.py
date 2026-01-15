"""
Inspection service for business logic.

Module 5: Inspection Execution
"""
import logging
from typing import List, Optional
from datetime import date, datetime
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
from fastapi import HTTPException, status

from app.models.inspection import (
    Inspection,
    InspectionFinding,
    InspectionPhoto,
    InspectionMeasurement,
    InspectionChecklist,
    InspectionStatus,
    FindingType,
    FindingSeverity,
    ChecklistItemStatus
)
from app.schemas.inspection import (
    InspectionCreate,
    InspectionUpdate,
    FindingCreate,
    FindingUpdate,
    InspectionPhotoCreate,
    MeasurementCreate,
    MeasurementUpdate,
    ChecklistCreate,
    ChecklistUpdate
)

logger = logging.getLogger(__name__)


def create_inspection(db: Session, data: InspectionCreate, user_id: int) -> Inspection:
    """
    Create a new inspection.

    Args:
        db: Database session
        data: Inspection creation data
        user_id: ID of the user creating the inspection

    Returns:
        Created Inspection object

    Raises:
        HTTPException: If asset not found or validation fails
    """
    logger.info(f"Creating inspection for asset {data.asset_id} by user {user_id}")

    inspection = Inspection(
        asset_id=data.asset_id,
        planned_inspection_id=data.planned_inspection_id,
        inspection_type=data.inspection_type.value,
        inspection_date=data.inspection_date,
        primary_inspector_id=data.primary_inspector_id or user_id,
        weather_conditions=data.weather_conditions,
        ambient_temperature=data.ambient_temperature,
        status=InspectionStatus.not_started
    )

    db.add(inspection)
    db.commit()
    db.refresh(inspection)

    logger.info(f"Inspection {inspection.id} created successfully")
    return inspection


def get_inspections(
    db: Session,
    asset_id: Optional[int] = None,
    status: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    inspector_id: Optional[int] = None,
    search: Optional[str] = None,
    inspection_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Inspection]:
    """
    Get inspections with optional filtering.

    Args:
        db: Database session
        asset_id: Filter by asset ID
        status: Filter by status
        date_from: Filter by date range start
        date_to: Filter by date range end
        inspector_id: Filter by inspector ID
        search: Search by asset name or number
        inspection_type: Filter by inspection type
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List of Inspection objects
    """
    from app.models.asset import Asset

    query = db.query(Inspection).options(
        joinedload(Inspection.asset),
        joinedload(Inspection.primary_inspector)
    )

    # Apply filters
    if asset_id:
        query = query.filter(Inspection.asset_id == asset_id)
    if status:
        query = query.filter(Inspection.status == status)
    if date_from:
        query = query.filter(Inspection.inspection_date >= date_from)
    if date_to:
        query = query.filter(Inspection.inspection_date <= date_to)
    if inspector_id:
        query = query.filter(Inspection.primary_inspector_id == inspector_id)
    if inspection_type:
        query = query.filter(Inspection.inspection_type == inspection_type)
    if search:
        # Join with Asset table to search by asset name or code
        query = query.join(Asset).filter(
            or_(
                Asset.name.ilike(f"%{search}%"),
                Asset.asset_code.ilike(f"%{search}%")
            )
        )

    # Order by date descending
    query = query.order_by(Inspection.inspection_date.desc())

    return query.offset(skip).limit(limit).all()


def get_inspection(db: Session, inspection_id: int) -> Optional[Inspection]:
    """
    Get inspection by ID with all related data.

    Args:
        db: Database session
        inspection_id: ID of the inspection

    Returns:
        Inspection object or None if not found
    """
    return db.query(Inspection).options(
        joinedload(Inspection.findings),
        joinedload(Inspection.photos),
        joinedload(Inspection.measurements),
        joinedload(Inspection.checklist_items)
    ).filter(Inspection.id == inspection_id).first()


def update_inspection(
    db: Session,
    inspection_id: int,
    data: InspectionUpdate
) -> Inspection:
    """
    Update an inspection.

    Args:
        db: Database session
        inspection_id: ID of the inspection
        data: Update data

    Returns:
        Updated Inspection object

    Raises:
        HTTPException: If inspection not found
    """
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection {inspection_id} not found"
        )

    # Update fields if provided
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(inspection, field):
            setattr(inspection, field, value)

    db.commit()
    db.refresh(inspection)

    logger.info(f"Inspection {inspection_id} updated successfully")
    return inspection


def start_inspection(db: Session, inspection_id: int, inspector_id: int) -> Inspection:
    """
    Start an inspection.

    Args:
        db: Database session
        inspection_id: ID of the inspection
        inspector_id: ID of the inspector starting the inspection

    Returns:
        Updated Inspection object

    Raises:
        HTTPException: If inspection not found or already started
    """
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection {inspection_id} not found"
        )

    if inspection.status == InspectionStatus.in_progress:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inspection already in progress"
        )

    if inspection.status == InspectionStatus.completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inspection already completed"
        )

    inspection.status = InspectionStatus.in_progress
    inspection.start_time = datetime.now().time()

    db.commit()
    db.refresh(inspection)

    logger.info(f"Inspection {inspection_id} started by inspector {inspector_id}")
    return inspection


def complete_inspection(
    db: Session,
    inspection_id: int,
    inspector_id: int
) -> Inspection:
    """
    Complete an inspection.

    Args:
        db: Database session
        inspection_id: ID of the inspection
        inspector_id: ID of the inspector completing the inspection

    Returns:
        Updated Inspection object

    Raises:
        HTTPException: If inspection not found or not in progress
    """
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection {inspection_id} not found"
        )

    if inspection.status != InspectionStatus.in_progress:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inspection must be in progress to complete"
        )

    inspection.status = InspectionStatus.completed
    inspection.end_time = datetime.now().time()

    # Calculate duration if start_time exists
    if inspection.start_time:
        start = datetime.combine(datetime.today(), inspection.start_time)
        end = datetime.combine(datetime.today(), inspection.end_time)
        duration = (end - start).total_seconds() / 3600
        inspection.duration_hours = round(duration, 2)

    db.commit()
    db.refresh(inspection)

    logger.info(f"Inspection {inspection_id} completed by inspector {inspector_id}")
    return inspection


def add_finding(
    db: Session,
    inspection_id: int,
    data: FindingCreate
) -> InspectionFinding:
    """
    Add a finding to an inspection.

    Args:
        db: Database session
        inspection_id: ID of the inspection
        data: Finding creation data

    Returns:
        Created InspectionFinding object

    Raises:
        HTTPException: If inspection not found
    """
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection {inspection_id} not found"
        )

    finding = InspectionFinding(
        inspection_id=inspection_id,
        finding_type=data.finding_type,
        severity=data.severity,
        description=data.description,
        location_on_asset=data.location_on_asset,
        measurement_value=data.measurement_value,
        measurement_unit=data.measurement_unit,
        recommended_action=data.recommended_action
    )

    db.add(finding)
    db.commit()
    db.refresh(finding)

    logger.info(f"Finding {finding.id} added to inspection {inspection_id}")
    return finding


def update_finding(
    db: Session,
    inspection_id: int,
    finding_id: int,
    data: FindingUpdate
) -> InspectionFinding:
    """
    Update an inspection finding.

    Args:
        db: Database session
        inspection_id: ID of the inspection
        finding_id: ID of the finding
        data: Update data

    Returns:
        Updated InspectionFinding object

    Raises:
        HTTPException: If finding not found
    """
    finding = db.query(InspectionFinding).filter(
        and_(
            InspectionFinding.id == finding_id,
            InspectionFinding.inspection_id == inspection_id
        )
    ).first()

    if not finding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Finding {finding_id} not found in inspection {inspection_id}"
        )

    # Update fields if provided
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(finding, field):
            setattr(finding, field, value)

    db.commit()
    db.refresh(finding)

    logger.info(f"Finding {finding_id} updated")
    return finding


def upload_photos(
    db: Session,
    inspection_id: int,
    photos: List[InspectionPhotoCreate],
    user_id: int
) -> List[InspectionPhoto]:
    """
    Upload photos for an inspection.

    Args:
        db: Database session
        inspection_id: ID of the inspection
        photos: List of photo data
        user_id: ID of the user uploading photos

    Returns:
        List of created InspectionPhoto objects

    Raises:
        HTTPException: If inspection not found
    """
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection {inspection_id} not found"
        )

    photo_objects = []
    for photo_data in photos:
        photo = InspectionPhoto(
            inspection_id=inspection_id,
            finding_id=photo_data.finding_id,
            file_name=photo_data.file_name,
            file_url=photo_data.file_url,
            caption=photo_data.caption,
            taken_at=photo_data.taken_at or date.today(),
            uploaded_by_id=user_id,
            uploaded_at=date.today()
        )
        db.add(photo)
        photo_objects.append(photo)

    db.commit()
    for photo in photo_objects:
        db.refresh(photo)

    logger.info(f"Uploaded {len(photo_objects)} photos to inspection {inspection_id}")
    return photo_objects


def add_measurement(
    db: Session,
    inspection_id: int,
    data: MeasurementCreate
) -> InspectionMeasurement:
    """
    Add a measurement to an inspection.

    Args:
        db: Database session
        inspection_id: ID of the inspection
        data: Measurement creation data

    Returns:
        Created InspectionMeasurement object

    Raises:
        HTTPException: If inspection not found
    """
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection {inspection_id} not found"
        )

    # Calculate if value is within range
    is_within_range = None
    if data.min_acceptable is not None and data.max_acceptable is not None:
        is_within_range = data.min_acceptable <= data.value <= data.max_acceptable

    measurement = InspectionMeasurement(
        inspection_id=inspection_id,
        parameter_name=data.parameter_name,
        value=data.value,
        unit=data.unit,
        min_acceptable=data.min_acceptable,
        max_acceptable=data.max_acceptable,
        is_within_range=is_within_range,
        notes=data.notes
    )

    db.add(measurement)
    db.commit()
    db.refresh(measurement)

    logger.info(f"Measurement {measurement.id} added to inspection {inspection_id}")
    return measurement


def update_measurement(
    db: Session,
    inspection_id: int,
    measurement_id: int,
    data: MeasurementUpdate
) -> InspectionMeasurement:
    """
    Update an inspection measurement.

    Args:
        db: Database session
        inspection_id: ID of the inspection
        measurement_id: ID of the measurement
        data: Update data

    Returns:
        Updated InspectionMeasurement object

    Raises:
        HTTPException: If measurement not found
    """
    measurement = db.query(InspectionMeasurement).filter(
        and_(
            InspectionMeasurement.id == measurement_id,
            InspectionMeasurement.inspection_id == inspection_id
        )
    ).first()

    if not measurement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Measurement {measurement_id} not found in inspection {inspection_id}"
        )

    # Update fields if provided
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(measurement, field):
            setattr(measurement, field, value)

    # Recalculate is_within_range if needed
    if measurement.min_acceptable is not None and measurement.max_acceptable is not None:
        measurement.is_within_range = (
            measurement.min_acceptable <= measurement.value <= measurement.max_acceptable
        )

    db.commit()
    db.refresh(measurement)

    logger.info(f"Measurement {measurement_id} updated")
    return measurement


def update_checklist(
    db: Session,
    inspection_id: int,
    checklist_items: List[dict]
) -> List[InspectionChecklist]:
    """
    Update checklist items for an inspection.

    Args:
        db: Database session
        inspection_id: ID of the inspection
        checklist_items: List of checklist item updates

    Returns:
        List of updated InspectionChecklist objects

    Raises:
        HTTPException: If inspection not found
    """
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection {inspection_id} not found"
        )

    updated_items = []
    for item_data in checklist_items:
        item_id = item_data.get("id")
        if item_id:
            # Update existing item
            item = db.query(InspectionChecklist).filter(
                and_(
                    InspectionChecklist.id == item_id,
                    InspectionChecklist.inspection_id == inspection_id
                )
            ).first()

            if item:
                if "status" in item_data:
                    item.status = item_data["status"]
                if "notes" in item_data:
                    item.notes = item_data["notes"]
                updated_items.append(item)
        else:
            # Create new item
            item = InspectionChecklist(
                inspection_id=inspection_id,
                checklist_item=item_data.get("checklist_item", ""),
                status=item_data.get("status", ChecklistItemStatus.pending),
                notes=item_data.get("notes")
            )
            db.add(item)
            updated_items.append(item)

    db.commit()
    for item in updated_items:
        db.refresh(item)

    logger.info(f"Updated {len(updated_items)} checklist items for inspection {inspection_id}")
    return updated_items


def get_checklist(db: Session, inspection_id: int) -> List[InspectionChecklist]:
    """
    Get checklist items for an inspection.

    Args:
        db: Database session
        inspection_id: ID of the inspection

    Returns:
        List of InspectionChecklist objects

    Raises:
        HTTPException: If inspection not found
    """
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection {inspection_id} not found"
        )

    return db.query(InspectionChecklist).filter(
        InspectionChecklist.inspection_id == inspection_id
    ).all()


def delete_finding(db: Session, inspection_id: int, finding_id: int) -> None:
    """
    Delete an inspection finding.

    Args:
        db: Database session
        inspection_id: ID of the inspection
        finding_id: ID of the finding

    Raises:
        HTTPException: If finding not found
    """
    finding = db.query(InspectionFinding).filter(
        and_(
            InspectionFinding.id == finding_id,
            InspectionFinding.inspection_id == inspection_id
        )
    ).first()

    if not finding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Finding {finding_id} not found in inspection {inspection_id}"
        )

    db.delete(finding)
    db.commit()

    logger.info(f"Finding {finding_id} deleted from inspection {inspection_id}")


def delete_photo(db: Session, inspection_id: int, photo_id: int) -> None:
    """
    Delete an inspection photo.

    Args:
        db: Database session
        inspection_id: ID of the inspection
        photo_id: ID of the photo

    Raises:
        HTTPException: If photo not found
    """
    photo = db.query(InspectionPhoto).filter(
        and_(
            InspectionPhoto.id == photo_id,
            InspectionPhoto.inspection_id == inspection_id
        )
    ).first()

    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Photo {photo_id} not found in inspection {inspection_id}"
        )

    db.delete(photo)
    db.commit()

    logger.info(f"Photo {photo_id} deleted from inspection {inspection_id}")
