"""
Assets API router.

Module 2: Asset Management
"""
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.asset import Asset
from app.auth.dependencies import get_current_user
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/assets", tags=["Assets"])


@router.get(
    "",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Get all assets with filters and pagination"
)
async def get_assets(
    search: Optional[str] = Query(None, description="Search in name, asset_code, or description"),
    asset_type: Optional[str] = Query(None, description="Filter by asset type"),
    criticality: Optional[str] = Query(None, description="Filter by criticality"),
    status: Optional[str] = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get list of assets with optional filters and pagination.

    **Authentication required**

    **Query parameters:**
    - search: Search term for name, tag, or description
    - asset_type: Filter by asset type (vessel, piping, tank, etc.)
    - criticality: Filter by criticality (low, medium, high, critical)
    - status: Filter by status (active, inactive, maintenance, decommissioned)
    - page: Page number (default: 1)
    - page_size: Items per page (default: 20, max: 100)
    """
    query = db.query(Asset)

    # Apply filters
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Asset.name.ilike(search_filter)) |
            (Asset.asset_code.ilike(search_filter)) |
            (Asset.description.ilike(search_filter))
        )

    if asset_type:
        query = query.filter(Asset.asset_type == asset_type)

    if criticality:
        query = query.filter(Asset.criticality == criticality)

    if status:
        query = query.filter(Asset.status == status)

    # Get total count
    total = query.count()

    # Apply pagination
    offset = (page - 1) * page_size
    assets = query.offset(offset).limit(page_size).all()

    # Convert to dict format
    assets_data = []
    for asset in assets:
        assets_data.append({
            "id": asset.id,
            "name": asset.name,
            "asset_code": asset.asset_code,
            "asset_type": asset.asset_type.value if hasattr(asset.asset_type, 'value') else asset.asset_type,
            "criticality": asset.criticality.value if hasattr(asset.criticality, 'value') else asset.criticality,
            "status": asset.status.value if hasattr(asset.status, 'value') else asset.status,
            "location": asset.location,
            "description": asset.description,
            "manufacturer": asset.manufacturer,
            "model": asset.model,
            "serial_number": asset.serial_number,
            "installation_date": asset.installation_date.isoformat() if asset.installation_date else None,
            "last_inspection_date": asset.last_inspection_date.isoformat() if asset.last_inspection_date else None,
            "next_inspection_due": asset.next_inspection_due.isoformat() if asset.next_inspection_due else None,
            "created_at": asset.created_at.isoformat() if asset.created_at else None,
            "updated_at": asset.updated_at.isoformat() if asset.updated_at else None,
        })

    return {
        "items": assets_data,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get(
    "/{asset_id}",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Get asset by ID"
)
async def get_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a single asset by ID.

    **Authentication required**
    """
    asset = db.query(Asset).filter(Asset.id == asset_id).first()

    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found"
        )

    return {
        "id": asset.id,
        "name": asset.name,
        "asset_code": asset.asset_code,
        "asset_type": asset.asset_type.value if hasattr(asset.asset_type, 'value') else asset.asset_type,
        "criticality": asset.criticality.value if hasattr(asset.criticality, 'value') else asset.criticality,
        "status": asset.status.value if hasattr(asset.status, 'value') else asset.status,
        "location": asset.location,
        "description": asset.description,
        "manufacturer": asset.manufacturer,
        "model": asset.model,
        "serial_number": asset.serial_number,
        "installation_date": asset.installation_date.isoformat() if asset.installation_date else None,
        "last_inspection_date": asset.last_inspection_date.isoformat() if asset.last_inspection_date else None,
        "next_inspection_due": asset.next_inspection_due.isoformat() if asset.next_inspection_due else None,
        "created_at": asset.created_at.isoformat() if asset.created_at else None,
        "updated_at": asset.updated_at.isoformat() if asset.updated_at else None,
    }


@router.get(
    "/{asset_id}/history",
    response_model=list,
    status_code=status.HTTP_200_OK,
    summary="Get asset inspection history"
)
async def get_asset_history(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get inspection history for an asset.

    **Authentication required**
    """
    # For now, return empty list
    # Full implementation would query Inspection table
    return []


@router.get(
    "/{asset_id}/documents",
    response_model=list,
    status_code=status.HTTP_200_OK,
    summary="Get asset documents"
)
async def get_asset_documents(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get documents for an asset.

    **Authentication required**
    """
    # For now, return empty list
    # Full implementation would query AssetDocument table
    return []


@router.post(
    "",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Create new asset"
)
async def create_asset(
    asset_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new asset.

    **Authentication required**
    **Admin or Team Leader only**
    """
    # For now, return a simple response
    # Full implementation would create the asset
    return {"message": "Asset creation endpoint - to be implemented"}
