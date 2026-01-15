"""
Approval workflow API endpoints.

Module 7: Multi-Stage Approval Workflow
"""
import logging
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_user, RoleChecker
from app.models.user import User
from app.schemas.approval import (
    ApprovalActionRequest,
    RejectionRequest,
    ApprovalWorkflowResponse,
    PendingApprovalsResponse,
)
from app.services.approval_service import ApprovalService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/approvals", tags=["Approvals"])


@router.get("", response_model=PendingApprovalsResponse)
async def list_pending_approvals(
    status: Optional[str] = Query(None, description="Filter by workflow status"),
    severity: Optional[str] = Query(None, description="Filter by finding severity (critical, high, medium, low)"),
    date_from: Optional[datetime] = Query(None, description="Filter by inspection date from"),
    date_to: Optional[datetime] = Query(None, description="Filter by inspection date to"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["team_leader", "admin", "inspector", "engineer", "rbi_auditor"]))
):
    """
    Get list of pending approvals.

    Returns inspection reports pending approval based on user's role:
    - Inspectors: See items at inspector stage
    - Engineers: See items at engineer stage
    - RBI Auditors: See items at rbi stage
    - Team Leaders: See items at team_leader stage
    - Admins: See all pending approvals

    Accessible by: inspector, engineer, rbi_auditor, team_leader, admin
    """
    logger.info(
        f"User {current_user.id} ({current_user.role.value}) listing pending approvals "
        f"(page={page}, page_size={page_size}, status={status}, severity={severity})"
    )

    try:
        approvals = ApprovalService.get_pending_approvals(
            db=db,
            user_id=current_user.id,
            user_role=current_user.role.value,
            status_filter=status,
            severity_filter=severity,
            date_from=date_from,
            date_to=date_to,
            page=page,
            page_size=page_size,
        )

        return approvals

    except Exception as e:
        logger.error(f"Error listing pending approvals: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve pending approvals: {str(e)}"
        )


@router.get("/{workflow_id}", response_model=ApprovalWorkflowResponse)
async def get_workflow(
    workflow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed approval workflow information.

    Returns workflow details including all stages, history, and comments.

    Accessible by all authenticated users.
    """
    logger.info(f"User {current_user.id} retrieving workflow {workflow_id}")

    workflow = ApprovalService.get_workflow(db=db, workflow_id=workflow_id)

    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workflow {workflow_id} not found"
        )

    return workflow


@router.post("/{workflow_id}/approve", response_model=ApprovalWorkflowResponse)
async def approve_workflow(
    workflow_id: int,
    data: ApprovalActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["team_leader", "admin", "inspector", "engineer", "rbi_auditor"]))
):
    """
    Approve an inspection report at the current approval stage.

    Action depends on user role:
    - Moves workflow to next stage if there are more stages
    - Marks workflow as approved if this is the final stage

    Optional comments can be provided with the approval.

    Accessible by: inspector, engineer, rbi_auditor, team_leader, admin
    """
    logger.info(
        f"User {current_user.id} ({current_user.role.value}) approving workflow {workflow_id}"
    )

    try:
        workflow = ApprovalService.approve_workflow(
            db=db,
            workflow_id=workflow_id,
            user_id=current_user.id,
            user_role=current_user.role.value,
            comments=data.comments,
        )

        logger.info(f"Workflow {workflow_id} approved successfully by user {current_user.id}")
        return workflow

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error approving workflow {workflow_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to approve workflow: {str(e)}"
        )


@router.post("/{workflow_id}/reject", response_model=ApprovalWorkflowResponse)
async def reject_workflow(
    workflow_id: int,
    data: RejectionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["team_leader", "admin", "inspector", "engineer", "rbi_auditor"]))
):
    """
    Reject an inspection report at the current approval stage.

    Rejection requires a reason/comment explaining why the report was rejected.
    The workflow will be marked as rejected and the report status updated accordingly.

    Accessible by: inspector, engineer, rbi_auditor, team_leader, admin
    """
    logger.info(
        f"User {current_user.id} ({current_user.role.value}) rejecting workflow {workflow_id}"
    )

    try:
        workflow = ApprovalService.reject_workflow(
            db=db,
            workflow_id=workflow_id,
            user_id=current_user.id,
            user_role=current_user.role.value,
            comments=data.comments,
        )

        logger.info(f"Workflow {workflow_id} rejected by user {current_user.id}")
        return workflow

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error rejecting workflow {workflow_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reject workflow: {str(e)}"
        )
