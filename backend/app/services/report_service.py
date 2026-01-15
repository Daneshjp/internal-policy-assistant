"""
Report service for business logic.

Module 6: Report Management
"""
import logging
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
from fastapi import HTTPException, status

from app.models.report import (
    InspectionReport,
    ReportTemplate,
    ReportVersion,
    ReportType,
    ReportStatus
)
from app.models.inspection import Inspection
from app.schemas.report import (
    ReportTemplateCreate,
    ReportTemplateUpdate,
    InspectionReportCreate,
    InspectionReportUpdate,
    ReportVersionCreate
)

logger = logging.getLogger(__name__)


def create_template(db: Session, data: ReportTemplateCreate, user_id: int) -> ReportTemplate:
    """
    Create a new report template.

    Args:
        db: Database session
        data: Template creation data
        user_id: ID of the user creating the template

    Returns:
        Created ReportTemplate object
    """
    logger.info(f"Creating report template '{data.name}' by user {user_id}")

    template = ReportTemplate(
        name=data.name,
        inspection_type=data.inspection_type.value if data.inspection_type else None,
        template_html=data.template_html,
        variables=data.variables,
        is_active='true'
    )

    db.add(template)
    db.commit()
    db.refresh(template)

    logger.info(f"Report template {template.id} created successfully")
    return template


def get_templates(db: Session, inspection_type: Optional[str] = None) -> List[ReportTemplate]:
    """
    Get all report templates.

    Args:
        db: Database session
        inspection_type: Optional filter by inspection type

    Returns:
        List of ReportTemplate objects
    """
    query = db.query(ReportTemplate).filter(ReportTemplate.is_active == 'true')

    if inspection_type:
        query = query.filter(ReportTemplate.inspection_type == inspection_type)

    return query.order_by(ReportTemplate.name).all()


def get_template(db: Session, template_id: int) -> Optional[ReportTemplate]:
    """
    Get a report template by ID.

    Args:
        db: Database session
        template_id: ID of the template

    Returns:
        ReportTemplate object or None if not found
    """
    return db.query(ReportTemplate).filter(ReportTemplate.id == template_id).first()


def update_template(
    db: Session,
    template_id: int,
    data: ReportTemplateUpdate
) -> ReportTemplate:
    """
    Update a report template.

    Args:
        db: Database session
        template_id: ID of the template
        data: Update data

    Returns:
        Updated ReportTemplate object

    Raises:
        HTTPException: If template not found
    """
    template = db.query(ReportTemplate).filter(ReportTemplate.id == template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template {template_id} not found"
        )

    # Update fields if provided
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(template, field):
            if field == "inspection_type" and value:
                setattr(template, field, value.value)
            else:
                setattr(template, field, value)

    db.commit()
    db.refresh(template)

    logger.info(f"Template {template_id} updated successfully")
    return template


def generate_report(
    db: Session,
    inspection_id: int,
    template_id: Optional[int],
    user_id: int
) -> InspectionReport:
    """
    Generate a report from an inspection.

    Args:
        db: Database session
        inspection_id: ID of the inspection
        template_id: Optional template ID to use
        user_id: ID of the user generating the report

    Returns:
        Created InspectionReport object

    Raises:
        HTTPException: If inspection not found or already has a report
    """
    # Get inspection with related data
    inspection = db.query(Inspection).options(
        joinedload(Inspection.findings),
        joinedload(Inspection.photos),
        joinedload(Inspection.measurements),
        joinedload(Inspection.asset)
    ).filter(Inspection.id == inspection_id).first()

    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection {inspection_id} not found"
        )

    # Check if report already exists
    existing_report = db.query(InspectionReport).filter(
        InspectionReport.inspection_id == inspection_id
    ).first()

    if existing_report:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Report already exists for inspection {inspection_id}"
        )

    # Generate report number
    year = datetime.now().year
    last_report = db.query(InspectionReport).filter(
        InspectionReport.report_number.like(f"RPT-{year}-%")
    ).order_by(InspectionReport.id.desc()).first()

    if last_report:
        last_seq = int(last_report.report_number.split("-")[-1])
        sequence = last_seq + 1
    else:
        sequence = 1

    report_number = f"RPT-{year}-{sequence:05d}"

    # Determine report type based on inspection type
    report_type_map = {
        'routine': ReportType.routine_inspection,
        'statutory': ReportType.statutory_inspection,
        'rbi': ReportType.rbi_inspection,
        'shutdown': ReportType.shutdown_inspection,
        'emergency': ReportType.emergency_inspection
    }
    report_type = report_type_map.get(inspection.inspection_type, ReportType.routine_inspection)

    # Auto-generate basic content
    executive_summary = f"Inspection of {inspection.asset.asset_name if hasattr(inspection, 'asset') else 'asset'} on {inspection.inspection_date}."

    findings_summary = f"Total findings: {len(inspection.findings)}. "
    if inspection.findings:
        critical = sum(1 for f in inspection.findings if f.severity.value == 'critical')
        high = sum(1 for f in inspection.findings if f.severity.value == 'high')
        if critical > 0:
            findings_summary += f"Critical: {critical}. "
        if high > 0:
            findings_summary += f"High: {high}."

    detailed_findings = findings_summary

    # Create report
    report = InspectionReport(
        inspection_id=inspection_id,
        report_number=report_number,
        report_type=report_type,
        version=1,
        status=ReportStatus.draft,
        executive_summary=executive_summary,
        detailed_findings=detailed_findings,
        recommendations="Recommendations to be added by inspector.",
        conclusions="Conclusions to be added after review.",
        generated_at=datetime.now(),
        generated_by_id=user_id
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    # Create initial version
    version = ReportVersion(
        report_id=report.id,
        version_number=1,
        content={
            "executive_summary": report.executive_summary,
            "detailed_findings": report.detailed_findings,
            "recommendations": report.recommendations,
            "conclusions": report.conclusions
        },
        created_by_id=user_id
    )
    db.add(version)
    db.commit()

    logger.info(f"Report {report.id} ({report_number}) generated for inspection {inspection_id}")
    return report


def get_reports(
    db: Session,
    inspection_id: Optional[int] = None,
    status: Optional[str] = None,
    report_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[InspectionReport]:
    """
    Get reports with optional filtering.

    Args:
        db: Database session
        inspection_id: Filter by inspection ID
        status: Filter by status
        report_type: Filter by report type
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List of InspectionReport objects
    """
    query = db.query(InspectionReport)

    if inspection_id:
        query = query.filter(InspectionReport.inspection_id == inspection_id)
    if status:
        query = query.filter(InspectionReport.status == status)
    if report_type:
        query = query.filter(InspectionReport.report_type == report_type)

    query = query.order_by(InspectionReport.generated_at.desc())

    return query.offset(skip).limit(limit).all()


def get_report(db: Session, report_id: int) -> Optional[InspectionReport]:
    """
    Get a report by ID.

    Args:
        db: Database session
        report_id: ID of the report

    Returns:
        InspectionReport object or None if not found
    """
    return db.query(InspectionReport).filter(InspectionReport.id == report_id).first()


def update_report(
    db: Session,
    report_id: int,
    data: InspectionReportUpdate,
    user_id: int
) -> InspectionReport:
    """
    Update a report.

    Args:
        db: Database session
        report_id: ID of the report
        data: Update data
        user_id: ID of the user updating the report

    Returns:
        Updated InspectionReport object

    Raises:
        HTTPException: If report not found or not editable
    """
    report = db.query(InspectionReport).filter(InspectionReport.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report {report_id} not found"
        )

    # Check if report is editable
    if report.status in [ReportStatus.locked, ReportStatus.approved]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot edit a locked or approved report"
        )

    # Track if content changed
    content_changed = False
    old_content = {
        "executive_summary": report.executive_summary,
        "detailed_findings": report.detailed_findings,
        "recommendations": report.recommendations,
        "conclusions": report.conclusions
    }

    # Update fields if provided
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(report, field):
            if field in old_content and value != getattr(report, field):
                content_changed = True
            setattr(report, field, value)

    # Create new version if content changed
    if content_changed:
        report.version += 1
        version = ReportVersion(
            report_id=report.id,
            version_number=report.version,
            content={
                "executive_summary": report.executive_summary,
                "detailed_findings": report.detailed_findings,
                "recommendations": report.recommendations,
                "conclusions": report.conclusions
            },
            created_by_id=user_id
        )
        db.add(version)

    db.commit()
    db.refresh(report)

    logger.info(f"Report {report_id} updated successfully")
    return report


def submit_for_review(db: Session, report_id: int, user_id: int) -> InspectionReport:
    """
    Submit a report for QC review.

    Args:
        db: Database session
        report_id: ID of the report
        user_id: ID of the user submitting

    Returns:
        Updated InspectionReport object

    Raises:
        HTTPException: If report not found or not in draft status
    """
    report = db.query(InspectionReport).filter(InspectionReport.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report {report_id} not found"
        )

    if report.status != ReportStatus.draft:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only draft reports can be submitted for review"
        )

    report.status = ReportStatus.qc_pending
    report.submitted_at = datetime.now()

    db.commit()
    db.refresh(report)

    logger.info(f"Report {report_id} submitted for QC review by user {user_id}")
    return report


def qc_approve(db: Session, report_id: int, reviewer_id: int, comments: Optional[str]) -> InspectionReport:
    """
    QC approve a report.

    Args:
        db: Database session
        report_id: ID of the report
        reviewer_id: ID of the QC reviewer
        comments: Optional approval comments

    Returns:
        Updated InspectionReport object

    Raises:
        HTTPException: If report not found or not pending QC
    """
    report = db.query(InspectionReport).filter(InspectionReport.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report {report_id} not found"
        )

    if report.status != ReportStatus.qc_pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Report must be pending QC review"
        )

    report.status = ReportStatus.qc_approved
    report.qc_reviewed_by_id = reviewer_id
    report.qc_reviewed_at = datetime.now()
    report.qc_comments = comments

    db.commit()
    db.refresh(report)

    logger.info(f"Report {report_id} QC approved by user {reviewer_id}")
    return report


def qc_reject(db: Session, report_id: int, reviewer_id: int, comments: str) -> InspectionReport:
    """
    QC reject a report.

    Args:
        db: Database session
        report_id: ID of the report
        reviewer_id: ID of the QC reviewer
        comments: Rejection comments (required)

    Returns:
        Updated InspectionReport object

    Raises:
        HTTPException: If report not found or not pending QC
    """
    report = db.query(InspectionReport).filter(InspectionReport.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report {report_id} not found"
        )

    if report.status != ReportStatus.qc_pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Report must be pending QC review"
        )

    report.status = ReportStatus.qc_rejected
    report.qc_reviewed_by_id = reviewer_id
    report.qc_reviewed_at = datetime.now()
    report.qc_comments = comments

    db.commit()
    db.refresh(report)

    logger.info(f"Report {report_id} QC rejected by user {reviewer_id}")
    return report


def create_version(
    db: Session,
    report_id: int,
    changes: str,
    user_id: int
) -> ReportVersion:
    """
    Create a new version of a report.

    Args:
        db: Database session
        report_id: ID of the report
        changes: Description of changes
        user_id: ID of the user creating version

    Returns:
        Created ReportVersion object

    Raises:
        HTTPException: If report not found
    """
    report = db.query(InspectionReport).filter(InspectionReport.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report {report_id} not found"
        )

    version_number = report.version + 1

    version = ReportVersion(
        report_id=report_id,
        version_number=version_number,
        content={
            "executive_summary": report.executive_summary,
            "detailed_findings": report.detailed_findings,
            "recommendations": report.recommendations,
            "conclusions": report.conclusions,
            "changes": changes
        },
        created_by_id=user_id
    )

    db.add(version)
    report.version = version_number
    db.commit()
    db.refresh(version)

    logger.info(f"Version {version_number} created for report {report_id}")
    return version


def get_versions(db: Session, report_id: int) -> List[ReportVersion]:
    """
    Get all versions of a report.

    Args:
        db: Database session
        report_id: ID of the report

    Returns:
        List of ReportVersion objects

    Raises:
        HTTPException: If report not found
    """
    report = db.query(InspectionReport).filter(InspectionReport.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report {report_id} not found"
        )

    return db.query(ReportVersion).filter(
        ReportVersion.report_id == report_id
    ).order_by(ReportVersion.version_number.desc()).all()


def export_report(db: Session, report_id: int, format: str) -> bytes:
    """
    Export report to PDF or DOCX format.

    Args:
        db: Database session
        report_id: ID of the report
        format: Export format ('pdf' or 'docx')

    Returns:
        Bytes of the exported file

    Raises:
        HTTPException: If report not found or format not supported
        NotImplementedError: PDF/DOCX generation not yet implemented
    """
    report = db.query(InspectionReport).filter(InspectionReport.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report {report_id} not found"
        )

    if format not in ['pdf', 'docx']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format must be 'pdf' or 'docx'"
        )

    # TODO: Implement PDF/DOCX generation using reportlab, weasyprint, or python-docx
    # This should be a Celery background task in production
    logger.warning(f"Export to {format} not yet implemented for report {report_id}")
    raise NotImplementedError(f"Export to {format} format is not yet implemented")
