"""
Asset management service - business logic for asset operations.

Module 2: Asset & Equipment Management
"""
import logging
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from math import ceil

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.models.asset import Asset, AssetDocument, AssetType, AssetCriticality, AssetStatus, DocumentType
from app.schemas.asset import AssetCreate, AssetUpdate, AssetDocumentCreate

logger = logging.getLogger(__name__)


def get_assets(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    asset_type: Optional[str] = None,
    criticality: Optional[str] = None,
    location: Optional[str] = None,
    facility: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get list of assets with filtering and pagination.

    Args:
        db: Database session
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        asset_type: Filter by asset type
        criticality: Filter by criticality level
        location: Filter by location (partial match)
        facility: Filter by facility (partial match)
        status: Filter by status
        search: Search in asset_code, name, or description

    Returns:
        dict: Paginated asset list with metadata
    """
    query = db.query(Asset)

    # Apply filters
    if asset_type:
        try:
            query = query.filter(Asset.asset_type == AssetType[asset_type])
        except KeyError:
            logger.warning(f"Invalid asset type filter: {asset_type}")

    if criticality:
        try:
            query = query.filter(Asset.criticality == AssetCriticality[criticality])
        except KeyError:
            logger.warning(f"Invalid criticality filter: {criticality}")

    if location:
        query = query.filter(Asset.location.ilike(f"%{location}%"))

    if facility:
        query = query.filter(Asset.facility.ilike(f"%{facility}%"))

    if status:
        try:
            query = query.filter(Asset.status == AssetStatus[status])
        except KeyError:
            logger.warning(f"Invalid status filter: {status}")

    if search:
        search_filter = or_(
            Asset.asset_code.ilike(f"%{search}%"),
            Asset.name.ilike(f"%{search}%"),
            Asset.description.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)

    # Get total count
    total = query.count()

    # Apply pagination
    assets = query.order_by(Asset.created_at.desc()).offset(skip).limit(limit).all()

    # Calculate pagination metadata
    page = (skip // limit) + 1 if limit > 0 else 1
    pages = ceil(total / limit) if limit > 0 else 1

    logger.info(f"Retrieved {len(assets)} assets (page {page} of {pages}, total: {total})")

    return {
        "items": assets,
        "total": total,
        "page": page,
        "page_size": limit,
        "pages": pages
    }


def get_asset(db: Session, asset_id: int) -> Optional[Asset]:
    """
    Get asset by ID with documents.

    Args:
        db: Database session
        asset_id: Asset ID

    Returns:
        Asset: Asset object with documents, or None if not found
    """
    asset = db.query(Asset).filter(Asset.id == asset_id).first()

    if asset:
        logger.debug(f"Retrieved asset: {asset.asset_code} (ID: {asset.id})")
    else:
        logger.warning(f"Asset not found: ID {asset_id}")

    return asset


def get_asset_by_code(db: Session, asset_code: str) -> Optional[Asset]:
    """
    Get asset by asset code.

    Args:
        db: Database session
        asset_code: Asset code

    Returns:
        Asset: Asset object, or None if not found
    """
    return db.query(Asset).filter(Asset.asset_code == asset_code).first()


def create_asset(db: Session, data: AssetCreate, created_by_id: int) -> Asset:
    """
    Create a new asset.

    Args:
        db: Database session
        data: Asset creation data
        created_by_id: ID of user creating the asset

    Returns:
        Asset: Created asset object

    Raises:
        HTTPException: If asset code already exists
    """
    # Check if asset code already exists
    existing_asset = get_asset_by_code(db, data.asset_code)
    if existing_asset:
        logger.warning(f"Asset creation failed: Asset code already exists: {data.asset_code}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Asset code '{data.asset_code}' already exists"
        )

    # Create asset
    asset = Asset(
        asset_code=data.asset_code,
        name=data.name,
        description=data.description,
        asset_type=AssetType[data.asset_type],
        location=data.location,
        facility=data.facility,
        unit=data.unit,
        criticality=AssetCriticality[data.criticality],
        manufacturer=data.manufacturer,
        model=data.model,
        serial_number=data.serial_number,
        installation_date=data.installation_date,
        next_inspection_due=data.next_inspection_due,
        rbi_category=data.rbi_category,
        status=AssetStatus[data.status],
        created_by_id=created_by_id
    )

    db.add(asset)
    db.commit()
    db.refresh(asset)

    logger.info(f"Asset created: {asset.asset_code} (ID: {asset.id}) by user {created_by_id}")

    return asset


def update_asset(db: Session, asset_id: int, data: AssetUpdate) -> Asset:
    """
    Update an existing asset.

    Args:
        db: Database session
        asset_id: Asset ID
        data: Asset update data

    Returns:
        Asset: Updated asset object

    Raises:
        HTTPException: If asset not found
    """
    asset = get_asset(db, asset_id)

    if not asset:
        logger.warning(f"Asset update failed: Asset not found: ID {asset_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )

    # Update fields if provided
    if data.name is not None:
        asset.name = data.name

    if data.description is not None:
        asset.description = data.description

    if data.asset_type is not None:
        asset.asset_type = AssetType[data.asset_type]

    if data.location is not None:
        asset.location = data.location

    if data.facility is not None:
        asset.facility = data.facility

    if data.unit is not None:
        asset.unit = data.unit

    if data.criticality is not None:
        asset.criticality = AssetCriticality[data.criticality]

    if data.manufacturer is not None:
        asset.manufacturer = data.manufacturer

    if data.model is not None:
        asset.model = data.model

    if data.serial_number is not None:
        asset.serial_number = data.serial_number

    if data.installation_date is not None:
        asset.installation_date = data.installation_date

    if data.last_inspection_date is not None:
        asset.last_inspection_date = data.last_inspection_date

    if data.next_inspection_due is not None:
        asset.next_inspection_due = data.next_inspection_due

    if data.rbi_category is not None:
        asset.rbi_category = data.rbi_category

    if data.status is not None:
        asset.status = AssetStatus[data.status]

    db.commit()
    db.refresh(asset)

    logger.info(f"Asset updated: {asset.asset_code} (ID: {asset.id})")

    return asset


def delete_asset(db: Session, asset_id: int) -> bool:
    """
    Delete an asset.

    Args:
        db: Database session
        asset_id: Asset ID

    Returns:
        bool: True if deleted, False if not found

    Raises:
        HTTPException: If asset not found or has related inspections
    """
    asset = get_asset(db, asset_id)

    if not asset:
        logger.warning(f"Asset deletion failed: Asset not found: ID {asset_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )

    # Check if asset has related inspections
    if asset.inspections:
        logger.warning(f"Asset deletion failed: Asset has related inspections: {asset.asset_code}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete asset with existing inspections. Deactivate instead."
        )

    db.delete(asset)
    db.commit()

    logger.info(f"Asset deleted: {asset.asset_code} (ID: {asset.id})")

    return True


def add_document(
    db: Session,
    asset_id: int,
    data: AssetDocumentCreate,
    uploaded_by_id: int
) -> AssetDocument:
    """
    Add a document to an asset.

    Args:
        db: Database session
        asset_id: Asset ID
        data: Document data
        uploaded_by_id: ID of user uploading the document

    Returns:
        AssetDocument: Created document object

    Raises:
        HTTPException: If asset not found
    """
    # Verify asset exists
    asset = get_asset(db, asset_id)
    if not asset:
        logger.warning(f"Document upload failed: Asset not found: ID {asset_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )

    # Create document
    document = AssetDocument(
        asset_id=asset_id,
        document_type=DocumentType[data.document_type],
        file_name=data.file_name,
        file_url=data.file_url,
        uploaded_by_id=uploaded_by_id,
        uploaded_at=datetime.now(timezone.utc)
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    logger.info(f"Document added to asset {asset.asset_code}: {document.file_name} (ID: {document.id})")

    return document


def delete_document(db: Session, asset_id: int, document_id: int) -> bool:
    """
    Delete an asset document.

    Args:
        db: Database session
        asset_id: Asset ID
        document_id: Document ID

    Returns:
        bool: True if deleted

    Raises:
        HTTPException: If asset or document not found
    """
    # Verify asset exists
    asset = get_asset(db, asset_id)
    if not asset:
        logger.warning(f"Document deletion failed: Asset not found: ID {asset_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )

    # Find and delete document
    document = db.query(AssetDocument).filter(
        AssetDocument.id == document_id,
        AssetDocument.asset_id == asset_id
    ).first()

    if not document:
        logger.warning(f"Document deletion failed: Document not found: ID {document_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    db.delete(document)
    db.commit()

    logger.info(f"Document deleted: {document.file_name} (ID: {document.id}) from asset {asset.asset_code}")

    return True


def get_asset_inspection_history(db: Session, asset_id: int) -> List[Any]:
    """
    Get inspection history for an asset.

    Args:
        db: Database session
        asset_id: Asset ID

    Returns:
        list: List of inspections for the asset

    Raises:
        HTTPException: If asset not found
    """
    # Verify asset exists
    asset = get_asset(db, asset_id)
    if not asset:
        logger.warning(f"Inspection history query failed: Asset not found: ID {asset_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )

    # Get inspections (will be implemented in Module 5)
    inspections = asset.inspections

    logger.info(f"Retrieved {len(inspections)} inspections for asset {asset.asset_code}")

    return inspections
