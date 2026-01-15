"""
Add demo data to existing database for InspectionAgent.
This script adds data without duplicating existing records.
"""
import sys
import os
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import logging
import random
from datetime import datetime, timedelta, date
from decimal import Decimal

from faker import Faker
from sqlalchemy.orm import Session

# Import database
from app.database import SessionLocal
from app.models import (
    User, UserRole,
    Asset, AssetType, AssetCriticality, AssetStatus,
    Inspection, InspectionFinding, InspectionMeasurement,
    InspectionStatus, FindingType, FindingSeverity,
    InspectionReport, ReportType, ReportStatus,
    ApprovalWorkflow, ApprovalStage, ApprovalHistory,
    WorkflowStatus, ApprovalStageEnum, StageStatus, ApprovalAction,
    WorkRequest, WRPriority, WRType, WRStatus, SAPSyncStatus,
)

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Faker
fake = Faker(['en_US', 'ar_SA'])

INSPECTION_FINDINGS_DATA = [
    ("Corrosion detected on external surface", FindingSeverity.medium, FindingType.defect, "Apply protective coating within 30 days"),
    ("Minor weld defects observed", FindingSeverity.low, FindingType.observation, "Monitor in next scheduled inspection"),
    ("Insulation damage on piping section", FindingSeverity.low, FindingType.observation, "Replace damaged insulation"),
    ("Pressure gauge reading inconsistent", FindingSeverity.medium, FindingType.defect, "Calibrate or replace gauge immediately"),
    ("Vibration levels elevated beyond normal", FindingSeverity.high, FindingType.defect, "Check alignment and bearings urgently"),
    ("Leak detected at flange connection", FindingSeverity.critical, FindingType.defect, "Immediate repair required - safety hazard"),
    ("All parameters within acceptable range", FindingSeverity.low, FindingType.ok, "Continue routine monitoring"),
    ("Erosion on pipe elbow joint", FindingSeverity.medium, FindingType.defect, "Schedule replacement during next shutdown"),
    ("Bolt tightness insufficient", FindingSeverity.medium, FindingType.defect, "Re-torque all bolts to specification"),
    ("Paint degradation noted", FindingSeverity.low, FindingType.observation, "Schedule repainting during maintenance window"),
]


def create_inspections(db: Session, count: int = 50):
    """Create inspections with findings."""
    logger.info(f"Creating {count} inspections...")

    assets = db.query(Asset).all()
    inspectors = db.query(User).filter(User.role == UserRole.inspector).all()

    if not assets or not inspectors:
        logger.warning("No assets or inspectors found. Skipping inspections.")
        return []

    inspections = []
    for i in range(count):
        asset = random.choice(assets)
        inspector = random.choice(inspectors)

        # Random date in past 6 months
        days_ago = random.randint(1, 180)
        inspection_date = datetime.now() - timedelta(days=days_ago)

        # Status distribution: 70% completed, 20% in_progress, 10% others
        status_choice = random.random()
        if status_choice < 0.7:
            status = InspectionStatus.completed
            end_time = inspection_date + timedelta(hours=random.randint(2, 8))
        elif status_choice < 0.9:
            status = InspectionStatus.in_progress
            end_time = None
        else:
            status = random.choice([InspectionStatus.not_started, InspectionStatus.on_hold])
            end_time = None

        inspection = Inspection(
            asset_id=asset.id,
            inspection_type=random.choice(["routine", "statutory", "rbi", "shutdown"]),
            inspection_date=inspection_date,
            start_time=inspection_date,
            end_time=end_time,
            primary_inspector_id=inspector.id,
            status=status,
            weather_conditions=random.choice(["Clear", "Sunny", "Cloudy", "Windy"]),
            ambient_temperature=Decimal(str(random.randint(25, 45))),
        )
        db.add(inspection)
        inspections.append(inspection)

        # Add findings for completed inspections (60% chance of having findings)
        if status == InspectionStatus.completed and random.random() < 0.6:
            num_findings = random.randint(1, 3)
            for _ in range(num_findings):
                finding_data = random.choice(INSPECTION_FINDINGS_DATA)
                finding = InspectionFinding(
                    inspection=inspection,
                    finding_type=finding_data[2],
                    severity=finding_data[1],
                    description=finding_data[0],
                    location_on_asset=f"Section {random.choice(['A', 'B', 'C', 'D'])}-{random.randint(1, 10)}",
                    recommended_action=finding_data[3],
                )
                db.add(finding)

        # Add measurements
        num_measurements = random.randint(2, 5)
        for _ in range(num_measurements):
            measurement = InspectionMeasurement(
                inspection=inspection,
                parameter_name=random.choice(["Pressure", "Temperature", "Thickness", "Vibration"]),
                value=Decimal(str(random.uniform(10, 100))),
                unit=random.choice(["bar", "°C", "mm", "mm/s"]),
                is_within_range=random.choice([True, True, True, False]),
            )
            db.add(measurement)

    db.commit()
    logger.info(f"Created {len(inspections)} inspections")
    return inspections


def create_reports(db: Session, count: int = 40):
    """Create inspection reports."""
    logger.info(f"Creating {count} reports...")

    completed_inspections = db.query(Inspection).filter(
        Inspection.status == InspectionStatus.completed
    ).all()

    if not completed_inspections:
        logger.warning("No completed inspections found. Skipping reports.")
        return []

    users = db.query(User).all()
    reports = []

    for i in range(min(count, len(completed_inspections))):
        inspection = completed_inspections[i]

        # Status distribution
        status_choice = random.random()
        if status_choice < 0.5:
            status = ReportStatus.approved
            submitted_at = inspection.inspection_date + timedelta(days=random.randint(1, 3))
        elif status_choice < 0.8:
            status = ReportStatus.submitted
            submitted_at = inspection.inspection_date + timedelta(days=1)
        else:
            status = ReportStatus.draft
            submitted_at = None

        # Calculate generated_at as datetime
        if inspection.end_time and isinstance(inspection.inspection_date, datetime):
            generated_at = datetime.combine(inspection.inspection_date.date(), inspection.end_time)
        elif inspection.end_time and isinstance(inspection.inspection_date, date):
            generated_at = datetime.combine(inspection.inspection_date, inspection.end_time)
        else:
            generated_at = inspection.inspection_date if isinstance(inspection.inspection_date, datetime) else datetime.combine(inspection.inspection_date, datetime.min.time())

        report = InspectionReport(
            inspection_id=inspection.id,
            report_number=f"RPT-2025-{1000 + i}",
            report_type=ReportType.routine_inspection,
            version=1,
            status=status,
            executive_summary=f"Inspection completed on {inspection.inspection_date.strftime('%Y-%m-%d')}. {fake.text(max_nb_chars=200)}",
            detailed_findings=fake.text(max_nb_chars=500),
            recommendations=fake.text(max_nb_chars=300),
            conclusions="Asset condition assessed. Follow-up actions recommended as per findings.",
            generated_at=generated_at,
            generated_by_id=inspection.primary_inspector_id,
            submitted_at=submitted_at,
        )

        if status in [ReportStatus.submitted, ReportStatus.approved]:
            report.qc_reviewed_by_id = random.choice(users).id
            if inspection.end_time and isinstance(inspection.inspection_date, datetime):
                report.qc_reviewed_at = datetime.combine(inspection.inspection_date.date(), inspection.end_time) + timedelta(hours=random.randint(1, 24))
            elif inspection.end_time and isinstance(inspection.inspection_date, date):
                report.qc_reviewed_at = datetime.combine(inspection.inspection_date, inspection.end_time) + timedelta(hours=random.randint(1, 24))
            else:
                base_date = inspection.inspection_date if isinstance(inspection.inspection_date, datetime) else datetime.combine(inspection.inspection_date, datetime.min.time())
                report.qc_reviewed_at = base_date + timedelta(hours=random.randint(24, 48))
            report.qc_comments = "QC review completed. Minor corrections applied."

        db.add(report)
        reports.append(report)

    db.commit()
    logger.info(f"Created {len(reports)} reports")
    return reports


def create_approval_workflows(db: Session, count: int = 30):
    """Create approval workflows."""
    logger.info(f"Creating {count} approval workflows...")

    reports = db.query(InspectionReport).filter(
        InspectionReport.status.in_([ReportStatus.submitted, ReportStatus.approved])
    ).all()

    if not reports:
        logger.warning("No submitted reports found. Skipping approval workflows.")
        return

    users_by_role = {
        UserRole.inspector: db.query(User).filter(User.role == UserRole.inspector).all(),
        UserRole.engineer: db.query(User).filter(User.role == UserRole.engineer).all(),
        UserRole.rbi_auditor: db.query(User).filter(User.role == UserRole.rbi_auditor).all(),
        UserRole.team_leader: db.query(User).filter(User.role == UserRole.team_leader).all(),
    }

    for i in range(min(count, len(reports))):
        report = reports[i]

        # Determine workflow completion
        progress = random.random()
        if progress < 0.3:
            current_stage = ApprovalStageEnum.inspector
            workflow_status = WorkflowStatus.pending
        elif progress < 0.6:
            current_stage = ApprovalStageEnum.engineer
            workflow_status = WorkflowStatus.in_review
        elif progress < 0.9:
            current_stage = ApprovalStageEnum.rbi
            workflow_status = WorkflowStatus.in_review
        else:
            current_stage = ApprovalStageEnum.team_leader
            workflow_status = WorkflowStatus.approved

        workflow = ApprovalWorkflow(
            report_id=report.id,
            current_stage=current_stage,
            status=workflow_status,
        )
        db.add(workflow)
        db.flush()

        # Create stages
        stages = [
            (ApprovalStageEnum.inspector, users_by_role[UserRole.inspector]),
            (ApprovalStageEnum.engineer, users_by_role[UserRole.engineer]),
            (ApprovalStageEnum.rbi, users_by_role[UserRole.rbi_auditor]),
            (ApprovalStageEnum.team_leader, users_by_role[UserRole.team_leader]),
        ]

        for stage_enum, possible_users in stages:
            if possible_users:
                stage_status = StageStatus.pending
                reviewed_at = None

                # Mark earlier stages as approved
                if stage_enum.value < current_stage.value:
                    stage_status = StageStatus.approved
                    reviewed_at = report.submitted_at + timedelta(days=stage_enum.value)
                elif stage_enum == current_stage and workflow_status == WorkflowStatus.approved:
                    stage_status = StageStatus.approved
                    reviewed_at = report.submitted_at + timedelta(days=stage_enum.value)

                stage = ApprovalStage(
                    workflow_id=workflow.id,
                    stage_name=stage_enum.value,
                    stage_order=list(ApprovalStageEnum).index(stage_enum) + 1,
                    reviewer_id=random.choice(possible_users).id,
                    status=stage_status,
                    reviewed_at=reviewed_at,
                )
                db.add(stage)

    db.commit()
    logger.info(f"Created {count} approval workflows")


def create_work_requests(db: Session, count: int = 20):
    """Create work requests."""
    logger.info(f"Creating {count} work requests...")

    # Get inspections with high/critical findings
    inspections_with_findings = db.query(Inspection).join(InspectionFinding).filter(
        InspectionFinding.severity.in_([FindingSeverity.high, FindingSeverity.critical])
    ).distinct().all()

    if not inspections_with_findings:
        logger.warning("No inspections with critical findings. Skipping work requests.")
        return

    engineers = db.query(User).filter(User.role == UserRole.engineer).all()
    if not engineers:
        logger.warning("No engineers found. Skipping work requests.")
        return

    for i in range(min(count, len(inspections_with_findings))):
        inspection = inspections_with_findings[i]
        engineer = random.choice(engineers)

        wr = WorkRequest(
            wr_number=f"WR-2025-{2000 + i}",
            inspection_id=inspection.id,
            created_by_id=engineer.id,
            priority=random.choice([WRPriority.high, WRPriority.critical, WRPriority.medium]),
            wr_type=random.choice([WRType.corrective, WRType.preventive]),
            description=fake.text(max_nb_chars=300),
            estimated_cost=Decimal(str(random.randint(5000, 100000))),
            estimated_duration_days=random.randint(1, 30),
            status=random.choice([WRStatus.draft, WRStatus.submitted, WRStatus.approved, WRStatus.in_progress]),
            sap_sync_status=random.choice([SAPSyncStatus.pending, SAPSyncStatus.synced]),
        )
        db.add(wr)

    db.commit()
    logger.info(f"Created work requests")


def main():
    """Main function."""
    logger.info("="  * 60)
    logger.info("Adding Demo Data to InspectionAgent Database")
    logger.info("=" * 60)

    db = SessionLocal()

    try:
        # Create data
        inspections = create_inspections(db, 50)
        reports = create_reports(db, 40)
        create_approval_workflows(db, 30)
        create_work_requests(db, 20)

        # Print statistics
        logger.info("=" * 60)
        logger.info("Demo Data Added Successfully!")
        logger.info("=" * 60)
        logger.info(f"Total Users: {db.query(User).count()}")
        logger.info(f"Total Assets: {db.query(Asset).count()}")
        logger.info(f"Total Inspections: {db.query(Inspection).count()}")
        logger.info(f"  - Completed: {db.query(Inspection).filter(Inspection.status == InspectionStatus.completed).count()}")
        logger.info(f"  - In Progress: {db.query(Inspection).filter(Inspection.status == InspectionStatus.in_progress).count()}")
        logger.info(f"Total Reports: {db.query(InspectionReport).count()}")
        logger.info(f"Total Findings: {db.query(InspectionFinding).count()}")
        logger.info(f"Total Approval Workflows: {db.query(ApprovalWorkflow).count()}")
        logger.info(f"Total Work Requests: {db.query(WorkRequest).count()}")
        logger.info("=" * 60)

    except Exception as e:
        logger.error(f"Error: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
