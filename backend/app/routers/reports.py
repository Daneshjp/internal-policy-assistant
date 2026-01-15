"""
Report management API endpoints.

Module 6: Report Management
"""
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_user, RoleChecker
from app.models.user import User
from app.schemas.report import (
    ReportTemplateCreate,
    ReportTemplateUpdate,
    ReportTemplateResponse,
    InspectionReportCreate,
    InspectionReportUpdate,
    InspectionReportResponse,
    InspectionReportListResponse,
    ReportVersionResponse,
    ReportGenerateRequest,
    QCApprovalRequest,
    QCRejectionRequest,
    ReportExportFormat
)
from app.services import report_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reports", tags=["Reports"])


# Report Template Endpoints
@router.get("/templates", response_model=List[ReportTemplateResponse])
async def list_templates(
    inspection_type: Optional[str] = Query(None, description="Filter by inspection type"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get list of report templates.

    Accessible by all authenticated users.
    """
    logger.info(f"User {current_user.id} listing report templates")

    templates = report_service.get_templates(db=db, inspection_type=inspection_type)

    return templates


@router.post("/templates", response_model=ReportTemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_template(
    data: ReportTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["team_leader", "admin"]))
):
    """
    Create a new report template.

    Accessible by: team_leader, admin
    """
    logger.info(f"User {current_user.id} creating report template '{data.name}'")

    template = report_service.create_template(
        db=db,
        data=data,
        user_id=current_user.id
    )

    return template


@router.get("/templates/{template_id}", response_model=ReportTemplateResponse)
async def get_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific report template.

    Accessible by all authenticated users.
    """
    logger.info(f"User {current_user.id} retrieving template {template_id}")

    template = report_service.get_template(db=db, template_id=template_id)

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template {template_id} not found"
        )

    return template


@router.put("/templates/{template_id}", response_model=ReportTemplateResponse)
async def update_template(
    template_id: int,
    data: ReportTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["team_leader", "admin"]))
):
    """
    Update a report template.

    Accessible by: team_leader, admin
    """
    logger.info(f"User {current_user.id} updating template {template_id}")

    template = report_service.update_template(
        db=db,
        template_id=template_id,
        data=data
    )

    return template


# Report Generation
@router.post("/generate", response_model=InspectionReportResponse, status_code=status.HTTP_201_CREATED)
async def generate_report(
    data: ReportGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["inspector", "team_leader", "admin"]))
):
    """
    Generate a report from an inspection.

    Accessible by: inspector, team_leader, admin
    """
    logger.info(f"User {current_user.id} generating report for inspection {data.inspection_id}")

    report = report_service.generate_report(
        db=db,
        inspection_id=data.inspection_id,
        template_id=data.template_id,
        user_id=current_user.id
    )

    return report


# Report CRUD
@router.get("", response_model=List[InspectionReportListResponse])
async def list_reports(
    inspection_id: Optional[int] = Query(None, description="Filter by inspection ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    report_type: Optional[str] = Query(None, description="Filter by report type"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get list of reports with optional filtering.

    Accessible by all authenticated users.
    """
    logger.info(f"User {current_user.id} listing reports")

    reports = report_service.get_reports(
        db=db,
        inspection_id=inspection_id,
        status=status,
        report_type=report_type,
        skip=skip,
        limit=limit
    )

    return reports


@router.get("/{report_id}", response_model=InspectionReportResponse)
async def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed report information.

    Accessible by all authenticated users.
    """
    logger.info(f"User {current_user.id} retrieving report {report_id}")

    report = report_service.get_report(db=db, report_id=report_id)

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report {report_id} not found"
        )

    return report


@router.put("/{report_id}", response_model=InspectionReportResponse)
async def update_report(
    report_id: int,
    data: InspectionReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["inspector", "team_leader", "admin"]))
):
    """
    Update a report.

    Accessible by: inspector, team_leader, admin
    Only draft reports can be updated.
    """
    logger.info(f"User {current_user.id} updating report {report_id}")

    report = report_service.update_report(
        db=db,
        report_id=report_id,
        data=data,
        user_id=current_user.id
    )

    return report


# QC Workflow
@router.post("/{report_id}/submit", response_model=InspectionReportResponse)
async def submit_for_review(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["inspector", "team_leader", "admin"]))
):
    """
    Submit a report for QC review.

    Accessible by: inspector, team_leader, admin
    """
    logger.info(f"User {current_user.id} submitting report {report_id} for QC review")

    report = report_service.submit_for_review(
        db=db,
        report_id=report_id,
        user_id=current_user.id
    )

    return report


@router.post("/{report_id}/qc-approve", response_model=InspectionReportResponse)
async def qc_approve(
    report_id: int,
    data: QCApprovalRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["team_leader", "admin"]))
):
    """
    QC approve a report.

    Accessible by: team_leader, admin
    """
    logger.info(f"User {current_user.id} QC approving report {report_id}")

    report = report_service.qc_approve(
        db=db,
        report_id=report_id,
        reviewer_id=current_user.id,
        comments=data.comments
    )

    return report


@router.post("/{report_id}/qc-reject", response_model=InspectionReportResponse)
async def qc_reject(
    report_id: int,
    data: QCRejectionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["team_leader", "admin"]))
):
    """
    QC reject a report.

    Accessible by: team_leader, admin
    """
    logger.info(f"User {current_user.id} QC rejecting report {report_id}")

    report = report_service.qc_reject(
        db=db,
        report_id=report_id,
        reviewer_id=current_user.id,
        comments=data.comments
    )

    return report


# Version History
@router.get("/{report_id}/versions", response_model=List[ReportVersionResponse])
async def get_report_versions(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get version history for a report.

    Accessible by all authenticated users.
    """
    logger.info(f"User {current_user.id} retrieving versions for report {report_id}")

    versions = report_service.get_versions(db=db, report_id=report_id)

    return versions


# Report Export
@router.get("/{report_id}/export")
async def export_report(
    report_id: int,
    format: ReportExportFormat = Query(..., description="Export format (pdf or docx)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Export report to PDF or DOCX format.

    Accessible by all authenticated users.

    Note: This is a placeholder. PDF/DOCX generation should be implemented
    as a Celery background task in production.
    """
    logger.info(f"User {current_user.id} exporting report {report_id} as {format.value}")

    try:
        file_bytes = report_service.export_report(
            db=db,
            report_id=report_id,
            format=format.value
        )

        media_type = "application/pdf" if format == ReportExportFormat.pdf else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        filename = f"report_{report_id}.{format.value}"

        return StreamingResponse(
            iter([file_bytes]),
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except NotImplementedError:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=f"Export to {format.value} format is not yet implemented. This feature requires PDF/DOCX generation library integration."
        )
