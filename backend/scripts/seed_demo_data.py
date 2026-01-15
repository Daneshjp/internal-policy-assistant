"""
Demo Data Seeder for InspectionAgent.

Creates comprehensive realistic demo data for ADNOC presentation.
Includes: users, assets, plans, inspections, reports, approvals, work requests.
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
from typing import List
from decimal import Decimal

from faker import Faker
from sqlalchemy.orm import Session

# Import database
from app.database import SessionLocal, engine, Base
from app.auth.password import hash_password as auth_hash_password
from app.models import (
    User, UserRole,
    Asset, AssetType, AssetCriticality, AssetStatus,
    AnnualPlan, QuarterlyPlan, MonthlyPlan, PlannedInspection,
    PlanStatus, Quarter, InspectionType, InspectionPriority, PlannedInspectionStatus,
    Team, TeamMember, InspectorAssignment, ResourceAvailability,
    RoleInTeam, AssignmentRole, AssignmentStatus, AvailabilityStatus,
    Inspection, InspectionFinding, InspectionMeasurement,
    InspectionStatus, FindingType, FindingSeverity,
    InspectionReport, ReportType, ReportStatus,
    ApprovalWorkflow, ApprovalStage, ApprovalHistory,
    WorkflowStatus, ApprovalStageEnum, StageStatus, ApprovalAction,
    WorkRequest, WRPriority, WRType, WRStatus, SAPSyncStatus,
)

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Faker
fake = Faker(['en_US', 'ar_SA'])

# ADNOC-specific data
ADNOC_LOCATIONS = [
    "Abu Dhabi Refinery",
    "Ruwais Refinery Complex",
    "Habshan Gas Processing Plant",
    "Jebel Dhanna Terminal",
    "Das Island Facilities",
    "Fujairah Refinery",
    "Al Yasat Offshore Platform",
    "ADNOC Offshore Operations",
    "Takreer Main Terminal",
    "Ghasha Sour Gas Development",
]

ADNOC_FACILITIES = [
    "Refining Unit A",
    "Processing Plant B",
    "Storage Terminal C",
    "Offshore Platform D",
    "Gas Treatment Unit E",
]

ASSET_TYPES_DISTRIBUTION = {
    AssetType.pressure_vessel: 30,
    AssetType.pipeline: 25,
    AssetType.tank: 20,
    AssetType.heat_exchanger: 15,
    AssetType.pump: 7,
    AssetType.valve: 3,
}

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


def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    return auth_hash_password(password)


def create_users(db: Session) -> List[User]:
    """Create demo users across all roles."""
    logger.info("Creating users...")
    users = []

    # Admin user
    admin = User(
        email="admin@adnoc.ae",
        full_name="Ahmed Al Mansouri",
        role=UserRole.admin,
        department="Operations Management",
        phone="+971-2-123-4567",
        hashed_password=hash_password("admin123"),
        is_active=True,
        is_verified=True,
        oauth_provider=None,
    )
    db.add(admin)
    users.append(admin)

    # Team Leaders (5)
    team_leader_names = [
        ("Khalid Al Mazrouei", "khalid.almazrouei@adnoc.ae", "Inspection Department"),
        ("Sultan Al Dhaheri", "sultan.aldhaheri@adnoc.ae", "Quality Control"),
        ("Mohammed Al Ketbi", "mohammed.alketbi@adnoc.ae", "RBI Compliance"),
        ("Rashid Al Suwaidi", "rashid.alsuwaidi@adnoc.ae", "Field Operations"),
        ("Ali Al Shamsi", "ali.alshamsi@adnoc.ae", "Maintenance Planning"),
    ]
    for full_name, email, dept in team_leader_names:
        user = User(
            email=email,
            full_name=full_name,
            role=UserRole.team_leader,
            department=dept,
            phone=f"+971-2-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
            hashed_password=hash_password("demo123"),
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        users.append(user)

    # Inspectors (12)
    for i in range(12):
        user = User(
            email=f"inspector{i+1}@adnoc.ae",
            full_name=fake.name(),
            role=UserRole.inspector,
            department=random.choice(["Inspection Department", "Field Operations", "Quality Control"]),
            phone=f"+971-2-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
            hashed_password=hash_password("demo123"),
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        users.append(user)

    # Engineers (6)
    for i in range(6):
        user = User(
            email=f"engineer{i+1}@adnoc.ae",
            full_name=fake.name(),
            role=UserRole.engineer,
            department=random.choice(["Engineering", "Technical Review", "Asset Integrity"]),
            phone=f"+971-2-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
            hashed_password=hash_password("demo123"),
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        users.append(user)

    # RBI Auditors (4)
    for i in range(4):
        user = User(
            email=f"rbi.auditor{i+1}@adnoc.ae",
            full_name=fake.name(),
            role=UserRole.rbi_auditor,
            department="RBI Compliance",
            phone=f"+971-2-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
            hashed_password=hash_password("demo123"),
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        users.append(user)

    db.commit()
    logger.info(f"Created {len(users)} users")
    return users


def create_assets(db: Session, admin_user: User) -> List[Asset]:
    """Create demo assets across ADNOC facilities."""
    logger.info("Creating assets...")
    assets = []

    for i in range(50):
        # Select asset type based on distribution
        asset_type = random.choices(
            list(ASSET_TYPES_DISTRIBUTION.keys()),
            weights=list(ASSET_TYPES_DISTRIBUTION.values())
        )[0]

        # Generate asset code
        type_prefix = asset_type.value[:2].upper()
        asset_code = f"ADNOC-{type_prefix}-{1000+i}"

        # Select criticality based on realistic distribution
        criticality = random.choices(
            [AssetCriticality.low, AssetCriticality.medium, AssetCriticality.high, AssetCriticality.critical],
            weights=[20, 40, 30, 10]
        )[0]

        # Installation date between 5-20 years ago
        install_days_ago = random.randint(365*5, 365*20)
        installation_date = datetime.now().date() - timedelta(days=install_days_ago)

        # Last inspection within past year
        last_inspection_date = datetime.now().date() - timedelta(days=random.randint(30, 365))

        # Next inspection due based on criticality
        if criticality == AssetCriticality.critical:
            next_due_days = random.randint(30, 90)
        elif criticality == AssetCriticality.high:
            next_due_days = random.randint(60, 180)
        else:
            next_due_days = random.randint(90, 365)
        next_inspection_due = datetime.now().date() + timedelta(days=next_due_days)

        asset = Asset(
            asset_code=asset_code,
            name=f"{asset_type.value.replace('_', ' ').title()} Unit {i+1:03d}",
            description=f"Critical {asset_type.value.replace('_', ' ')} asset at {random.choice(ADNOC_LOCATIONS)}",
            asset_type=asset_type,
            location=random.choice(ADNOC_LOCATIONS),
            facility=random.choice(ADNOC_FACILITIES),
            unit=f"Unit-{random.choice(['A', 'B', 'C', 'D'])}{random.randint(1, 9)}",
            criticality=criticality,
            manufacturer=random.choice(['Siemens', 'GE Oil & Gas', 'ABB', 'Honeywell', 'Emerson', 'Yokogawa']),
            model=f"MDL-{random.randint(1000, 9999)}-{chr(65+random.randint(0, 25))}",
            serial_number=f"SN-{random.randint(100000, 999999)}",
            installation_date=installation_date,
            last_inspection_date=last_inspection_date,
            next_inspection_due=next_inspection_due,
            rbi_category=random.choice(['Category-1', 'Category-2', 'Category-3']),
            status=AssetStatus.active,
            created_by_id=admin_user.id,
        )
        db.add(asset)
        assets.append(asset)

    db.commit()
    logger.info(f"Created {len(assets)} assets")
    return assets


def create_annual_plan(db: Session, admin_user: User) -> AnnualPlan:
    """Create annual inspection plan with breakdown."""
    logger.info("Creating annual plan...")

    # Create Annual Plan for 2025
    annual_plan = AnnualPlan(
        year=2025,
        title="ADNOC Annual Inspection Plan 2025",
        description="Comprehensive inspection plan covering all critical assets across ADNOC facilities",
        status=PlanStatus.in_progress,
        total_inspections=250,
        start_date=date(2025, 1, 1),
        end_date=date(2025, 12, 31),
        created_by_id=admin_user.id,
        approved_by_id=admin_user.id,
        approved_at=datetime(2025, 1, 1, 10, 0, 0),
    )
    db.add(annual_plan)
    db.flush()

    # Create Quarterly Plans
    quarterly_data = [
        (Quarter.Q1, "Q1 2025 Inspection Plan", 60, 50, date(2025, 1, 1), date(2025, 3, 31), PlanStatus.completed),
        (Quarter.Q2, "Q2 2025 Inspection Plan", 65, 55, date(2025, 4, 1), date(2025, 6, 30), PlanStatus.completed),
        (Quarter.Q3, "Q3 2025 Inspection Plan", 60, 40, date(2025, 7, 1), date(2025, 9, 30), PlanStatus.in_progress),
        (Quarter.Q4, "Q4 2025 Inspection Plan", 65, 35, date(2025, 10, 1), date(2025, 12, 31), PlanStatus.approved),
    ]

    for quarter, title, total, completed, start, end, status in quarterly_data:
        qplan = QuarterlyPlan(
            annual_plan_id=annual_plan.id,
            quarter=quarter,
            title=title,
            status=status,
            total_inspections=total,
            start_date=start,
            end_date=end,
            created_by_id=admin_user.id,
            approved_by_id=admin_user.id,
            approved_at=start - timedelta(days=5),
        )
        db.add(qplan)

    db.commit()
    logger.info("Created annual plan with quarterly breakdown")
    return annual_plan


def create_inspections(
    db: Session,
    assets: List[Asset],
    users: List[User],
    count: int = 200
) -> List[Inspection]:
    """Create demo inspections with findings and measurements."""
    logger.info("Creating inspections...")
    inspections = []
    inspectors = [u for u in users if u.role == UserRole.inspector]

    for i in range(count):
        asset = random.choice(assets)
        inspector = random.choice(inspectors)

        # Random date in past year
        days_ago = random.randint(0, 365)
        inspection_date = datetime.now().date() - timedelta(days=days_ago)

        # Status distribution: most completed, some in progress, few not started
        status = random.choices(
            [InspectionStatus.not_started, InspectionStatus.in_progress, InspectionStatus.completed,
             InspectionStatus.on_hold, InspectionStatus.cancelled],
            weights=[5, 10, 70, 10, 5]
        )[0]

        # Times for completed inspections
        start_time = None
        end_time = None
        duration_hours = None
        if status in [InspectionStatus.completed, InspectionStatus.in_progress]:
            start_hour = random.randint(7, 14)
            start_time = datetime.strptime(f"{start_hour}:00", "%H:%M").time()
            if status == InspectionStatus.completed:
                duration = random.uniform(2.0, 8.0)
                duration_hours = Decimal(str(round(duration, 2)))
                end_hour = start_hour + int(duration)
                end_minute = int((duration % 1) * 60)
                end_time = datetime.strptime(f"{end_hour}:{end_minute}", "%H:%M").time()

        inspection = Inspection(
            asset_id=asset.id,
            inspection_type=random.choice(['routine', 'statutory', 'rbi', 'shutdown']),
            inspection_date=inspection_date,
            start_time=start_time,
            end_time=end_time,
            duration_hours=duration_hours,
            primary_inspector_id=inspector.id,
            status=status,
            weather_conditions=random.choice(["Clear", "Cloudy", "Hot & Humid", "Windy", "Moderate"]),
            ambient_temperature=Decimal(str(round(random.uniform(25.0, 45.0), 1))),
        )
        db.add(inspection)
        db.flush()

        # Add findings for completed inspections (70% have findings)
        if status == InspectionStatus.completed and random.random() < 0.7:
            finding_count = random.randint(1, 4)
            for _ in range(finding_count):
                desc, severity, ftype, rec = random.choice(INSPECTION_FINDINGS_DATA)

                finding = InspectionFinding(
                    inspection_id=inspection.id,
                    finding_type=ftype,
                    severity=severity,
                    description=desc,
                    location_on_asset=random.choice([
                        'Top flange connection',
                        'Bottom section',
                        'Side panel',
                        'Inlet valve',
                        'Outlet pipe',
                        'Support structure',
                        'External coating',
                        'Internal lining'
                    ]),
                    recommended_action=rec,
                )
                db.add(finding)

        # Add measurements for completed inspections
        if status == InspectionStatus.completed:
            # Pressure measurement
            pressure_value = Decimal(str(round(random.uniform(5.0, 150.0), 2)))
            pressure_measure = InspectionMeasurement(
                inspection_id=inspection.id,
                parameter_name="Operating Pressure",
                value=pressure_value,
                unit="bar",
                min_acceptable=Decimal("10.0"),
                max_acceptable=Decimal("140.0"),
                is_within_range=10.0 <= float(pressure_value) <= 140.0,
                notes="Pressure reading stable" if 10.0 <= float(pressure_value) <= 140.0 else "Pressure outside normal range",
            )
            db.add(pressure_measure)

            # Temperature measurement
            temp_value = Decimal(str(round(random.uniform(20.0, 350.0), 1)))
            temp_measure = InspectionMeasurement(
                inspection_id=inspection.id,
                parameter_name="Operating Temperature",
                value=temp_value,
                unit="°C",
                min_acceptable=Decimal("50.0"),
                max_acceptable=Decimal("300.0"),
                is_within_range=50.0 <= float(temp_value) <= 300.0,
            )
            db.add(temp_measure)

        inspections.append(inspection)

    db.commit()
    logger.info(f"Created {len(inspections)} inspections")
    return inspections


def create_reports(
    db: Session,
    inspections: List[Inspection],
    users: List[User],
    count: int = 150
) -> List[InspectionReport]:
    """Create inspection reports."""
    logger.info("Creating reports...")
    reports = []
    completed = [i for i in inspections if i.status == InspectionStatus.completed][:count]

    for idx, inspection in enumerate(completed):
        # Status distribution
        status = random.choices(
            [ReportStatus.draft, ReportStatus.submitted, ReportStatus.approved],
            weights=[20, 30, 50]
        )[0]

        report = InspectionReport(
            inspection_id=inspection.id,
            report_number=f"RPT-2025-{(idx+1):05d}",
            report_type=ReportType.routine_inspection,
            version=1,
            status=status,
            executive_summary=f"Inspection of {inspection.asset.name} completed on {inspection.inspection_date}. Overall condition assessed as satisfactory with minor observations noted.",
            detailed_findings="Detailed inspection findings documented. All critical parameters within acceptable limits.",
            recommendations="Continue routine monitoring. Schedule next inspection as per RBI plan.",
            conclusions="Asset is fit for continued operation. No immediate corrective actions required.",
            generated_at=datetime.combine(inspection.inspection_date, datetime.min.time()) + timedelta(hours=16),
            generated_by_id=inspection.primary_inspector_id,
        )
        db.add(report)
        db.flush()
        reports.append(report)

    db.commit()
    logger.info(f"Created {len(reports)} reports")
    return reports


def create_approval_workflows(
    db: Session,
    reports: List[InspectionReport],
    users: List[User],
    count: int = 100
) -> None:
    """Create approval workflows for reports."""
    logger.info("Creating approval workflows...")

    submitted_reports = [r for r in reports if r.status in [ReportStatus.submitted, ReportStatus.approved]][:count]

    inspectors = [u for u in users if u.role == UserRole.inspector]
    engineers = [u for u in users if u.role == UserRole.engineer]
    rbi_auditors = [u for u in users if u.role == UserRole.rbi_auditor]
    team_leaders = [u for u in users if u.role == UserRole.team_leader]

    for report in submitted_reports:
        # Determine workflow status
        is_approved = report.status == ReportStatus.approved
        current_stage_num = 4 if is_approved else random.randint(1, 3)

        workflow = ApprovalWorkflow(
            report_id=report.id,
            current_stage=ApprovalStageEnum.team_leader if is_approved else random.choice(list(ApprovalStageEnum)),
            status=WorkflowStatus.approved if is_approved else WorkflowStatus.in_progress,
        )
        db.add(workflow)
        db.flush()

        # Create 4 stages
        stages_data = [
            (1, "Inspector Review", ApprovalStageEnum.inspector, random.choice(inspectors)),
            (2, "Engineering Review", ApprovalStageEnum.engineer, random.choice(engineers)),
            (3, "RBI Audit", ApprovalStageEnum.rbi, random.choice(rbi_auditors)),
            (4, "Team Leader Approval", ApprovalStageEnum.team_leader, random.choice(team_leaders)),
        ]

        for order, name, stage_enum, reviewer in stages_data:
            if order < current_stage_num:
                stage_status = StageStatus.approved
                reviewed_at = report.generated_at + timedelta(days=order)
            elif order == current_stage_num:
                stage_status = StageStatus.in_review
                reviewed_at = None
            else:
                stage_status = StageStatus.pending
                reviewed_at = None

            stage = ApprovalStage(
                workflow_id=workflow.id,
                stage_name=name,
                stage_order=order,
                reviewer_id=reviewer.id,
                status=stage_status,
                comments=f"Approved - {name}" if stage_status == StageStatus.approved else None,
                reviewed_at=reviewed_at,
            )
            db.add(stage)

            # Add history entry for approved stages
            if stage_status == StageStatus.approved:
                history = ApprovalHistory(
                    workflow_id=workflow.id,
                    action=ApprovalAction.approved,
                    performed_by_id=reviewer.id,
                    stage_name=name,
                    comments=f"Approved at {name} stage",
                )
                db.add(history)

    db.commit()
    logger.info(f"Created {count} approval workflows")


def create_work_requests(
    db: Session,
    inspections: List[Inspection],
    users: List[User],
    count: int = 50
) -> None:
    """Create work requests from inspection findings."""
    logger.info("Creating work requests...")

    engineers = [u for u in users if u.role == UserRole.engineer]
    team_leaders = [u for u in users if u.role == UserRole.team_leader]

    # Get inspections with critical/high severity findings
    inspections_with_findings = []
    for inspection in inspections:
        if inspection.findings:
            for finding in inspection.findings:
                if finding.severity in [FindingSeverity.critical, FindingSeverity.high, FindingSeverity.medium]:
                    inspections_with_findings.append((inspection, finding))

    # Create work requests
    for idx, (inspection, finding) in enumerate(random.sample(inspections_with_findings, min(count, len(inspections_with_findings)))):
        engineer = random.choice(engineers)

        # Status distribution
        status = random.choices(
            [WRStatus.draft, WRStatus.submitted, WRStatus.approved, WRStatus.in_progress, WRStatus.completed],
            weights=[10, 20, 30, 25, 15]
        )[0]

        # Priority matches finding severity
        if finding.severity == FindingSeverity.critical:
            priority = WRPriority.critical
        elif finding.severity == FindingSeverity.high:
            priority = WRPriority.high
        else:
            priority = WRPriority.medium

        # SAP sync status
        if status in [WRStatus.submitted, WRStatus.approved, WRStatus.in_progress, WRStatus.completed]:
            sap_status = SAPSyncStatus.synced
            sap_sync_at = datetime.now() - timedelta(days=random.randint(1, 30))
        else:
            sap_status = SAPSyncStatus.pending
            sap_sync_at = None

        wr = WorkRequest(
            inspection_id=inspection.id,
            finding_id=finding.id,
            report_id=inspection.reports[0].id if inspection.reports else None,
            wr_number=f"WR-2025-{(idx+1):05d}",
            title=f"Corrective Action: {finding.description[:50]}",
            description=f"Work request generated from inspection finding. Location: {finding.location_on_asset}. Action required: {finding.recommended_action}",
            priority=priority,
            wr_type=WRType.corrective,
            asset_id=inspection.asset_id,
            estimated_cost=Decimal(str(random.randint(5000, 500000))),
            status=status,
            created_by_id=engineer.id,
            approved_by_id=random.choice(team_leaders).id if status != WRStatus.draft else None,
            sap_sync_status=sap_status,
            sap_sync_at=sap_sync_at,
        )
        db.add(wr)

    db.commit()
    logger.info(f"Created {min(count, len(inspections_with_findings))} work requests")


def main():
    """Main seeding function."""
    logger.info("=" * 80)
    logger.info("Starting ADNOC InspectionAgent Demo Data Seed")
    logger.info("=" * 80)

    # Create database session
    db = SessionLocal()

    try:
        # Create all tables
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)

        # Create demo data
        users = create_users(db)
        admin_user = users[0]

        assets = create_assets(db, admin_user)
        annual_plan = create_annual_plan(db, admin_user)
        inspections = create_inspections(db, assets, users, 200)
        reports = create_reports(db, inspections, users, 150)
        create_approval_workflows(db, reports, users, 100)
        create_work_requests(db, inspections, users, 50)

        # Print statistics
        logger.info("=" * 80)
        logger.info("Demo Data Seeding Complete!")
        logger.info("=" * 80)
        logger.info(f"Users created: {len(users)}")
        logger.info(f"  - Admins: {len([u for u in users if u.role == UserRole.admin])}")
        logger.info(f"  - Team Leaders: {len([u for u in users if u.role == UserRole.team_leader])}")
        logger.info(f"  - Inspectors: {len([u for u in users if u.role == UserRole.inspector])}")
        logger.info(f"  - Engineers: {len([u for u in users if u.role == UserRole.engineer])}")
        logger.info(f"  - RBI Auditors: {len([u for u in users if u.role == UserRole.rbi_auditor])}")
        logger.info(f"Assets created: {len(assets)}")
        logger.info(f"Inspections created: {len(inspections)}")
        logger.info(f"  - Completed: {len([i for i in inspections if i.status == InspectionStatus.completed])}")
        logger.info(f"  - In Progress: {len([i for i in inspections if i.status == InspectionStatus.in_progress])}")
        logger.info(f"Reports created: {len(reports)}")
        logger.info(f"Approval workflows: 100")
        logger.info(f"Work requests: {db.query(WorkRequest).count()}")
        logger.info("")
        logger.info("=" * 80)
        logger.info("Login Credentials:")
        logger.info("=" * 80)
        logger.info("Admin:")
        logger.info("  Email: admin@adnoc.ae")
        logger.info("  Password: admin123")
        logger.info("")
        logger.info("Team Leader:")
        logger.info("  Email: khalid.almazrouei@adnoc.ae")
        logger.info("  Password: demo123")
        logger.info("")
        logger.info("Inspector:")
        logger.info("  Email: inspector1@adnoc.ae")
        logger.info("  Password: demo123")
        logger.info("")
        logger.info("Engineer:")
        logger.info("  Email: engineer1@adnoc.ae")
        logger.info("  Password: demo123")
        logger.info("")
        logger.info("RBI Auditor:")
        logger.info("  Email: rbi.auditor1@adnoc.ae")
        logger.info("  Password: demo123")
        logger.info("=" * 80)

    except Exception as e:
        logger.error(f"Error during seeding: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
