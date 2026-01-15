"""
Approval workflow service layer.

Module 7: Multi-Stage Approval Workflow
"""
import logging
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, case, desc
from fastapi import HTTPException, status

from app.models.approval import (
    ApprovalWorkflow,
    ApprovalStage,
    ApprovalComment,
    ApprovalHistory,
    WorkflowStatus,
    StageStatus,
    CommentType,
    ApprovalAction,
)
from app.models.report import InspectionReport, ReportStatus
from app.models.inspection import Inspection, InspectionFinding
from app.models.asset import Asset
from app.models.user import User
from app.schemas.approval import (
    PendingApprovalItem,
    PendingApprovalsResponse,
)

logger = logging.getLogger(__name__)


class ApprovalService:
    """Service for managing approval workflows."""

    @staticmethod
    def get_pending_approvals(
        db: Session,
        user_id: int,
        user_role: str,
        status_filter: Optional[str] = None,
        severity_filter: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PendingApprovalsResponse:
        """
        Get list of pending approvals for the current user.

        Filters based on user role and current approval stage.
        """
        # Build base query with joins
        query = (
            db.query(
                ApprovalWorkflow.id.label("workflow_id"),
                ApprovalWorkflow.report_id,
                ApprovalWorkflow.current_stage,
                ApprovalWorkflow.status.label("workflow_status"),
                ApprovalWorkflow.created_at,
                InspectionReport.report_number,
                InspectionReport.inspection_id,
                InspectionReport.submitted_at,
                Inspection.asset_id,
                Inspection.inspection_date,
                Inspection.inspection_type,
                Inspection.primary_inspector_id.label("inspector_id"),
                Asset.name.label("asset_name"),
                User.full_name.label("inspector_name"),
            )
            .join(InspectionReport, ApprovalWorkflow.report_id == InspectionReport.id)
            .join(Inspection, InspectionReport.inspection_id == Inspection.id)
            .join(Asset, Inspection.asset_id == Asset.id, isouter=True)
            .join(User, Inspection.primary_inspector_id == User.id, isouter=True)
        )

        # Filter by workflow status
        if status_filter:
            query = query.filter(ApprovalWorkflow.status == status_filter)
        else:
            # Default: only show pending and in_progress workflows
            query = query.filter(
                ApprovalWorkflow.status.in_([WorkflowStatus.pending, WorkflowStatus.in_progress])
            )

        # Filter by date range
        if date_from:
            query = query.filter(Inspection.inspection_date >= date_from)
        if date_to:
            query = query.filter(Inspection.inspection_date <= date_to)

        # Filter by user role - only show workflows at stages the user can approve
        role_stage_mapping = {
            "inspector": "inspector",
            "engineer": "engineer",
            "rbi_auditor": "rbi",
            "team_leader": "team_leader",
            "admin": None,  # Admin can see all
        }

        if user_role != "admin":
            stage_name = role_stage_mapping.get(user_role)
            if stage_name:
                query = query.filter(ApprovalWorkflow.current_stage == stage_name)

        # Get total count
        total = query.count()

        # Apply pagination
        query = query.order_by(desc(ApprovalWorkflow.created_at))
        query = query.offset((page - 1) * page_size).limit(page_size)

        # Execute query
        results = query.all()

        # Build response items with findings count
        items = []
        for row in results:
            # Get findings count and severity breakdown
            findings_query = db.query(
                func.count(InspectionFinding.id).label("total"),
                func.count(
                    case((InspectionFinding.severity == "critical", 1))
                ).label("critical"),
                func.count(
                    case((InspectionFinding.severity == "high", 1))
                ).label("high"),
                func.count(
                    case((InspectionFinding.severity == "medium", 1))
                ).label("medium"),
                func.count(
                    case((InspectionFinding.severity == "low", 1))
                ).label("low"),
            ).filter(InspectionFinding.inspection_id == row.inspection_id)

            findings = findings_query.first()

            # Apply severity filter if provided
            if severity_filter:
                severity_count = getattr(findings, severity_filter.lower(), 0)
                if severity_count == 0:
                    continue

            item = PendingApprovalItem(
                workflow_id=row.workflow_id,
                report_id=row.report_id,
                report_number=row.report_number,
                inspection_id=row.inspection_id,
                asset_id=row.asset_id,
                asset_name=row.asset_name or "Unknown Asset",
                inspection_date=row.inspection_date,
                inspection_type=row.inspection_type,
                inspector_id=row.inspector_id,
                inspector_name=row.inspector_name or "Unknown Inspector",
                findings_count=findings.total if findings else 0,
                critical_findings=findings.critical if findings else 0,
                high_findings=findings.high if findings else 0,
                medium_findings=findings.medium if findings else 0,
                low_findings=findings.low if findings else 0,
                current_stage=row.current_stage,
                workflow_status=row.workflow_status.value if isinstance(row.workflow_status, WorkflowStatus) else row.workflow_status,
                submitted_at=row.submitted_at,
                created_at=row.created_at,
            )
            items.append(item)

        return PendingApprovalsResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
        )

    @staticmethod
    def get_workflow(db: Session, workflow_id: int) -> Optional[ApprovalWorkflow]:
        """Get approval workflow by ID with all related data."""
        return (
            db.query(ApprovalWorkflow)
            .options(
                joinedload(ApprovalWorkflow.stages).joinedload(ApprovalStage.approval_comments),
                joinedload(ApprovalWorkflow.history),
                joinedload(ApprovalWorkflow.report),
            )
            .filter(ApprovalWorkflow.id == workflow_id)
            .first()
        )

    @staticmethod
    def approve_workflow(
        db: Session,
        workflow_id: int,
        user_id: int,
        user_role: str,
        comments: Optional[str] = None,
    ) -> ApprovalWorkflow:
        """
        Approve a workflow at the current stage.

        Moves to next stage or completes workflow if this was the final stage.
        """
        # Get workflow
        workflow = ApprovalService.get_workflow(db, workflow_id)
        if not workflow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workflow {workflow_id} not found",
            )

        # Check if workflow is in valid state
        if workflow.status not in [WorkflowStatus.pending, WorkflowStatus.in_progress]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot approve workflow in {workflow.status.value} status",
            )

        # Verify user has permission for current stage
        stage_role_mapping = {
            "inspector": "inspector",
            "engineer": "engineer",
            "rbi": "rbi_auditor",
            "team_leader": "team_leader",
        }

        if user_role != "admin":
            required_role = stage_role_mapping.get(workflow.current_stage.value if workflow.current_stage else "")
            if user_role != required_role:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"User role {user_role} cannot approve at stage {workflow.current_stage.value if workflow.current_stage else 'unknown'}",
                )

        # Update current stage
        current_stage = None
        for stage in workflow.stages:
            if stage.stage_name == (workflow.current_stage.value if workflow.current_stage else ""):
                current_stage = stage
                break

        if current_stage:
            current_stage.status = StageStatus.approved
            current_stage.reviewer_id = user_id
            current_stage.comments = comments
            current_stage.reviewed_at = datetime.now(timezone.utc)

            # Add comment if provided
            if comments:
                comment = ApprovalComment(
                    stage_id=current_stage.id,
                    reviewer_id=user_id,
                    comment=comments,
                    comment_type=CommentType.approval,
                )
                db.add(comment)

        # Record in history
        history = ApprovalHistory(
            workflow_id=workflow.id,
            action=ApprovalAction.approved,
            performed_by_id=user_id,
            stage_name=workflow.current_stage.value if workflow.current_stage else "",
            comments=comments,
        )
        db.add(history)

        # Move to next stage or complete
        next_stage = ApprovalService._get_next_stage(workflow)
        if next_stage:
            workflow.current_stage = next_stage
            workflow.status = WorkflowStatus.in_progress
        else:
            # All stages complete
            workflow.status = WorkflowStatus.approved
            workflow.current_stage = None

            # Update report status
            workflow.report.status = ReportStatus.approved

        db.commit()
        db.refresh(workflow)

        logger.info(
            f"User {user_id} approved workflow {workflow_id} at stage {current_stage.stage_name if current_stage else 'unknown'}"
        )

        return workflow

    @staticmethod
    def reject_workflow(
        db: Session,
        workflow_id: int,
        user_id: int,
        user_role: str,
        comments: str,
    ) -> ApprovalWorkflow:
        """
        Reject a workflow at the current stage.

        Returns workflow to draft status for revision.
        """
        # Get workflow
        workflow = ApprovalService.get_workflow(db, workflow_id)
        if not workflow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workflow {workflow_id} not found",
            )

        # Check if workflow is in valid state
        if workflow.status not in [WorkflowStatus.pending, WorkflowStatus.in_progress]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot reject workflow in {workflow.status.value} status",
            )

        # Verify user has permission for current stage
        stage_role_mapping = {
            "inspector": "inspector",
            "engineer": "engineer",
            "rbi": "rbi_auditor",
            "team_leader": "team_leader",
        }

        if user_role != "admin":
            required_role = stage_role_mapping.get(workflow.current_stage.value if workflow.current_stage else "")
            if user_role != required_role:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"User role {user_role} cannot reject at stage {workflow.current_stage.value if workflow.current_stage else 'unknown'}",
                )

        # Update current stage
        current_stage = None
        for stage in workflow.stages:
            if stage.stage_name == (workflow.current_stage.value if workflow.current_stage else ""):
                current_stage = stage
                break

        if current_stage:
            current_stage.status = StageStatus.rejected
            current_stage.reviewer_id = user_id
            current_stage.comments = comments
            current_stage.reviewed_at = datetime.now(timezone.utc)

            # Add comment
            comment = ApprovalComment(
                stage_id=current_stage.id,
                reviewer_id=user_id,
                comment=comments,
                comment_type=CommentType.rejection,
            )
            db.add(comment)

        # Record in history
        history = ApprovalHistory(
            workflow_id=workflow.id,
            action=ApprovalAction.rejected,
            performed_by_id=user_id,
            stage_name=workflow.current_stage.value if workflow.current_stage else "",
            comments=comments,
        )
        db.add(history)

        # Update workflow status
        workflow.status = WorkflowStatus.rejected

        # Update report status
        workflow.report.status = ReportStatus.qc_rejected

        db.commit()
        db.refresh(workflow)

        logger.info(
            f"User {user_id} rejected workflow {workflow_id} at stage {current_stage.stage_name if current_stage else 'unknown'}"
        )

        return workflow

    @staticmethod
    def _get_next_stage(workflow: ApprovalWorkflow) -> Optional[str]:
        """Get the next pending stage in the workflow."""
        if not workflow.current_stage:
            return None

        # Find current stage order
        current_order = None
        for stage in workflow.stages:
            if stage.stage_name == workflow.current_stage.value:
                current_order = stage.stage_order
                break

        if current_order is None:
            return None

        # Find next pending stage
        next_stages = [
            stage
            for stage in workflow.stages
            if stage.stage_order > current_order and stage.status == StageStatus.pending
        ]

        if next_stages:
            # Sort by order and return first
            next_stages.sort(key=lambda s: s.stage_order)
            # Return as enum value
            from app.models.approval import ApprovalStageEnum
            return getattr(ApprovalStageEnum, next_stages[0].stage_name)

        return None
