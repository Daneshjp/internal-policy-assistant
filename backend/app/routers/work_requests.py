"""
Work requests API router.

Module 8: Work Request Integration
"""
import logging
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, case

from app.database import get_db
from app.models.work_request import WorkRequest, WRDocument, WRStatus, WRPriority, SAPSyncStatus
from app.models.user import User
from app.models.asset import Asset
from app.auth.dependencies import get_current_user
from app.schemas.work_request import (
    WorkRequestCreate,
    WorkRequestUpdate,
    WorkRequestResponse,
    WorkRequestStatusUpdate,
    WorkRequestStats,
    WRDocumentCreate,
    WRDocumentResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/work-requests", tags=["Work Requests"])


def generate_wr_number(db: Session) -> str:
    """Generate unique work request number."""
    year = datetime.now().year
    # Get count of WRs this year
    count = db.query(WorkRequest).filter(
        func.extract('year', WorkRequest.created_at) == year
    ).count()

    return f"WR-{year}-{count + 1:05d}"


@router.get(
    "",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Get all work requests with filters and pagination"
)
async def get_work_requests(
    search: Optional[str] = Query(None, description="Search in WR number or title"),
    status_filter: Optional[str] = Query(None, description="Filter by status", alias="status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    wr_type: Optional[str] = Query(None, description="Filter by type"),
    asset_id: Optional[int] = Query(None, description="Filter by asset"),
    created_by_id: Optional[int] = Query(None, description="Filter by creator"),
    assigned_to_me: Optional[bool] = Query(False, description="Show only WRs assigned to me"),
    overdue: Optional[bool] = Query(False, description="Show only overdue WRs"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get list of work requests with optional filters and pagination.

    **Authentication required**
    **Roles:** engineer, team_leader, admin

    **Query parameters:**
    - search: Search term for WR number or title
    - status: Filter by status
    - priority: Filter by priority
    - wr_type: Filter by work request type
    - asset_id: Filter by asset
    - created_by_id: Filter by creator
    - assigned_to_me: Show only WRs assigned to current user
    - overdue: Show only overdue work requests
    - page: Page number (default: 1)
    - page_size: Items per page (default: 20, max: 100)
    """
    query = db.query(WorkRequest)

    # Apply filters
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                WorkRequest.wr_number.ilike(search_filter),
                WorkRequest.title.ilike(search_filter)
            )
        )

    if status_filter:
        query = query.filter(WorkRequest.status == status_filter)

    if priority:
        query = query.filter(WorkRequest.priority == priority)

    if wr_type:
        query = query.filter(WorkRequest.wr_type == wr_type)

    if asset_id:
        query = query.filter(WorkRequest.asset_id == asset_id)

    if created_by_id:
        query = query.filter(WorkRequest.created_by_id == created_by_id)

    # Note: assigned_to_me and overdue filters would need additional fields in the model
    # For now, we'll skip these filters as they're not in the current model

    # Get total count
    total = query.count()

    # Apply pagination
    offset = (page - 1) * page_size
    work_requests = query.order_by(WorkRequest.created_at.desc()).offset(offset).limit(page_size).all()

    # Convert to response format
    items = []
    for wr in work_requests:
        wr_dict = {
            "id": wr.id,
            "wr_number": wr.wr_number,
            "title": wr.title,
            "description": wr.description,
            "priority": wr.priority.value if hasattr(wr.priority, 'value') else wr.priority,
            "wr_type": wr.wr_type.value if hasattr(wr.wr_type, 'value') else wr.wr_type,
            "status": wr.status.value if hasattr(wr.status, 'value') else wr.status,
            "sap_sync_status": wr.sap_sync_status.value if hasattr(wr.sap_sync_status, 'value') else wr.sap_sync_status,
            "sap_sync_at": wr.sap_sync_at.isoformat() if wr.sap_sync_at else None,
            "estimated_cost": float(wr.estimated_cost) if wr.estimated_cost else None,
            "asset_id": wr.asset_id,
            "inspection_id": wr.inspection_id,
            "finding_id": wr.finding_id,
            "report_id": wr.report_id,
            "created_by_id": wr.created_by_id,
            "approved_by_id": wr.approved_by_id,
            "created_at": wr.created_at.isoformat() if wr.created_at else None,
            "updated_at": wr.updated_at.isoformat() if wr.updated_at else None,
        }

        # Add related data
        if wr.created_by:
            wr_dict["created_by"] = {
                "id": wr.created_by.id,
                "email": wr.created_by.email,
                "full_name": wr.created_by.full_name,
            }

        if wr.approved_by:
            wr_dict["approved_by"] = {
                "id": wr.approved_by.id,
                "email": wr.approved_by.email,
                "full_name": wr.approved_by.full_name,
            }

        if wr.asset:
            wr_dict["asset"] = {
                "id": wr.asset.id,
                "name": wr.asset.name,
                "asset_code": wr.asset.asset_code,
            }

        items.append(wr_dict)

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get(
    "/stats",
    response_model=WorkRequestStats,
    status_code=status.HTTP_200_OK,
    summary="Get work request statistics"
)
async def get_work_request_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get work request statistics.

    **Authentication required**
    **Roles:** engineer, team_leader, admin
    """
    total = db.query(WorkRequest).count()

    # Count by status
    status_counts = db.query(
        WorkRequest.status,
        func.count(WorkRequest.id)
    ).group_by(WorkRequest.status).all()
    by_status = {str(status.value): count for status, count in status_counts}

    # Count by priority
    priority_counts = db.query(
        WorkRequest.priority,
        func.count(WorkRequest.id)
    ).group_by(WorkRequest.priority).all()
    by_priority = {str(priority.value): count for priority, count in priority_counts}

    # Count by type
    type_counts = db.query(
        WorkRequest.wr_type,
        func.count(WorkRequest.id)
    ).group_by(WorkRequest.wr_type).all()
    by_type = {str(wr_type.value): count for wr_type, count in type_counts}

    # Pending approval
    pending_approval = db.query(WorkRequest).filter(
        WorkRequest.status == WRStatus.submitted
    ).count()

    # For overdue and avg resolution, we'd need due_date and completed_at fields
    # Setting defaults for now
    overdue = 0
    avg_resolution_days = None

    return WorkRequestStats(
        total=total,
        by_status=by_status,
        by_priority=by_priority,
        by_type=by_type,
        overdue=overdue,
        pending_approval=pending_approval,
        avg_resolution_days=avg_resolution_days,
    )


@router.get(
    "/{wr_id}",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Get work request by ID"
)
async def get_work_request(
    wr_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific work request by ID.

    **Authentication required**
    **Roles:** engineer, team_leader, admin
    """
    wr = db.query(WorkRequest).filter(WorkRequest.id == wr_id).first()

    if not wr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Work request with ID {wr_id} not found"
        )

    wr_dict = {
        "id": wr.id,
        "wr_number": wr.wr_number,
        "title": wr.title,
        "description": wr.description,
        "priority": wr.priority.value if hasattr(wr.priority, 'value') else wr.priority,
        "wr_type": wr.wr_type.value if hasattr(wr.wr_type, 'value') else wr.wr_type,
        "status": wr.status.value if hasattr(wr.status, 'value') else wr.status,
        "sap_sync_status": wr.sap_sync_status.value if hasattr(wr.sap_sync_status, 'value') else wr.sap_sync_status,
        "sap_sync_at": wr.sap_sync_at.isoformat() if wr.sap_sync_at else None,
        "sap_error_message": wr.sap_error_message,
        "estimated_cost": float(wr.estimated_cost) if wr.estimated_cost else None,
        "asset_id": wr.asset_id,
        "inspection_id": wr.inspection_id,
        "finding_id": wr.finding_id,
        "report_id": wr.report_id,
        "created_by_id": wr.created_by_id,
        "approved_by_id": wr.approved_by_id,
        "created_at": wr.created_at.isoformat() if wr.created_at else None,
        "updated_at": wr.updated_at.isoformat() if wr.updated_at else None,
    }

    # Add related data
    if wr.created_by:
        wr_dict["created_by"] = {
            "id": wr.created_by.id,
            "email": wr.created_by.email,
            "full_name": wr.created_by.full_name,
        }

    if wr.approved_by:
        wr_dict["approved_by"] = {
            "id": wr.approved_by.id,
            "email": wr.approved_by.email,
            "full_name": wr.approved_by.full_name,
        }

    if wr.asset:
        wr_dict["asset"] = {
            "id": wr.asset.id,
            "name": wr.asset.name,
            "asset_code": wr.asset.asset_code,
        }

    # Add documents
    wr_dict["documents"] = [
        {
            "id": doc.id,
            "document_type": doc.document_type.value if hasattr(doc.document_type, 'value') else doc.document_type,
            "file_name": doc.file_name,
            "file_url": doc.file_url,
            "uploaded_at": doc.uploaded_at.isoformat() if doc.uploaded_at else None,
        }
        for doc in wr.documents
    ]

    return wr_dict


@router.post(
    "",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new work request"
)
async def create_work_request(
    work_request: WorkRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new work request.

    **Authentication required**
    **Roles:** engineer, team_leader, admin
    """
    # Validate asset exists if provided
    if work_request.asset_id:
        asset = db.query(Asset).filter(Asset.id == work_request.asset_id).first()
        if not asset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Asset with ID {work_request.asset_id} not found"
            )

    # Generate WR number
    wr_number = generate_wr_number(db)

    # Create work request
    db_work_request = WorkRequest(
        wr_number=wr_number,
        title=work_request.title,
        description=work_request.description,
        priority=work_request.priority,
        wr_type=work_request.wr_type,
        asset_id=work_request.asset_id,
        estimated_cost=work_request.estimated_cost,
        inspection_id=work_request.inspection_id,
        finding_id=work_request.finding_id,
        report_id=work_request.report_id,
        created_by_id=current_user.id,
        status=WRStatus.draft,
        sap_sync_status=SAPSyncStatus.pending,
    )

    db.add(db_work_request)
    db.commit()
    db.refresh(db_work_request)

    logger.info(f"Work request {wr_number} created by user {current_user.id}")

    return {
        "id": db_work_request.id,
        "wr_number": db_work_request.wr_number,
        "title": db_work_request.title,
        "description": db_work_request.description,
        "priority": db_work_request.priority.value,
        "wr_type": db_work_request.wr_type.value,
        "status": db_work_request.status.value,
        "sap_sync_status": db_work_request.sap_sync_status.value,
        "estimated_cost": float(db_work_request.estimated_cost) if db_work_request.estimated_cost else None,
        "asset_id": db_work_request.asset_id,
        "inspection_id": db_work_request.inspection_id,
        "finding_id": db_work_request.finding_id,
        "report_id": db_work_request.report_id,
        "created_by_id": db_work_request.created_by_id,
        "created_at": db_work_request.created_at.isoformat(),
        "updated_at": db_work_request.updated_at.isoformat(),
    }


@router.put(
    "/{wr_id}",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Update a work request"
)
async def update_work_request(
    wr_id: int,
    work_request: WorkRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update an existing work request.

    **Authentication required**
    **Roles:** engineer, team_leader, admin
    """
    db_work_request = db.query(WorkRequest).filter(WorkRequest.id == wr_id).first()

    if not db_work_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Work request with ID {wr_id} not found"
        )

    # Update fields
    update_data = work_request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_work_request, field, value)

    db.commit()
    db.refresh(db_work_request)

    logger.info(f"Work request {db_work_request.wr_number} updated by user {current_user.id}")

    return {
        "id": db_work_request.id,
        "wr_number": db_work_request.wr_number,
        "title": db_work_request.title,
        "description": db_work_request.description,
        "priority": db_work_request.priority.value,
        "wr_type": db_work_request.wr_type.value,
        "status": db_work_request.status.value,
        "sap_sync_status": db_work_request.sap_sync_status.value,
        "estimated_cost": float(db_work_request.estimated_cost) if db_work_request.estimated_cost else None,
        "asset_id": db_work_request.asset_id,
        "inspection_id": db_work_request.inspection_id,
        "finding_id": db_work_request.finding_id,
        "report_id": db_work_request.report_id,
        "created_by_id": db_work_request.created_by_id,
        "approved_by_id": db_work_request.approved_by_id,
        "created_at": db_work_request.created_at.isoformat(),
        "updated_at": db_work_request.updated_at.isoformat(),
    }


@router.post(
    "/{wr_id}/submit",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Submit work request for approval"
)
async def submit_work_request(
    wr_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit a work request for approval.

    **Authentication required**
    **Roles:** engineer, team_leader, admin
    """
    db_work_request = db.query(WorkRequest).filter(WorkRequest.id == wr_id).first()

    if not db_work_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Work request with ID {wr_id} not found"
        )

    if db_work_request.status != WRStatus.draft:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only draft work requests can be submitted"
        )

    db_work_request.status = WRStatus.submitted
    db.commit()
    db.refresh(db_work_request)

    logger.info(f"Work request {db_work_request.wr_number} submitted by user {current_user.id}")

    return {
        "id": db_work_request.id,
        "wr_number": db_work_request.wr_number,
        "status": db_work_request.status.value,
        "message": "Work request submitted successfully"
    }


@router.post(
    "/{wr_id}/approve",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Approve a work request"
)
async def approve_work_request(
    wr_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Approve a work request.

    **Authentication required**
    **Roles:** team_leader, admin
    """
    if current_user.role not in ['team_leader', 'admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team leaders and admins can approve work requests"
        )

    db_work_request = db.query(WorkRequest).filter(WorkRequest.id == wr_id).first()

    if not db_work_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Work request with ID {wr_id} not found"
        )

    if db_work_request.status != WRStatus.submitted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only submitted work requests can be approved"
        )

    db_work_request.status = WRStatus.approved
    db_work_request.approved_by_id = current_user.id
    db.commit()
    db.refresh(db_work_request)

    logger.info(f"Work request {db_work_request.wr_number} approved by user {current_user.id}")

    return {
        "id": db_work_request.id,
        "wr_number": db_work_request.wr_number,
        "status": db_work_request.status.value,
        "approved_by_id": db_work_request.approved_by_id,
        "message": "Work request approved successfully"
    }


@router.post(
    "/{wr_id}/reject",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Reject a work request"
)
async def reject_work_request(
    wr_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Reject a work request.

    **Authentication required**
    **Roles:** team_leader, admin
    """
    if current_user.role not in ['team_leader', 'admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team leaders and admins can reject work requests"
        )

    db_work_request = db.query(WorkRequest).filter(WorkRequest.id == wr_id).first()

    if not db_work_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Work request with ID {wr_id} not found"
        )

    if db_work_request.status != WRStatus.submitted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only submitted work requests can be rejected"
        )

    db_work_request.status = WRStatus.rejected
    db.commit()
    db.refresh(db_work_request)

    logger.info(f"Work request {db_work_request.wr_number} rejected by user {current_user.id}")

    return {
        "id": db_work_request.id,
        "wr_number": db_work_request.wr_number,
        "status": db_work_request.status.value,
        "message": "Work request rejected"
    }


@router.delete(
    "/{wr_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a work request"
)
async def delete_work_request(
    wr_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a work request.

    **Authentication required**
    **Roles:** team_leader, admin
    """
    if current_user.role not in ['team_leader', 'admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team leaders and admins can delete work requests"
        )

    db_work_request = db.query(WorkRequest).filter(WorkRequest.id == wr_id).first()

    if not db_work_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Work request with ID {wr_id} not found"
        )

    db.delete(db_work_request)
    db.commit()

    logger.info(f"Work request {db_work_request.wr_number} deleted by user {current_user.id}")
