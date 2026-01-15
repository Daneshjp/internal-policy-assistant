"""
Add annual plans to the database for demo purposes.
"""
import sys
import os
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import logging
from datetime import datetime, date
from decimal import Decimal

from sqlalchemy.orm import Session

# Import database
from app.database import SessionLocal
from app.models import (
    AnnualPlan, QuarterlyPlan, MonthlyPlan, PlannedInspection,
    PlanStatus, Quarter, InspectionType, InspectionPriority, PlannedInspectionStatus,
    User, Asset
)

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def create_annual_plans(db: Session):
    """Create annual plans for multiple years."""
    logger.info("Creating annual plans...")

    # Get admin user
    admin = db.query(User).filter_by(email="admin@adnoc.ae").first()
    if not admin:
        logger.error("Admin user not found")
        return

    # Get assets
    assets = db.query(Asset).all()
    if not assets:
        logger.error("No assets found")
        return

    plans_data = [
        {
            "year": 2024,
            "title": "2024 Annual Plan",
            "description": "Annual inspection plan for 2024 - Completed",
            "total_inspections": 380,
            "start_date": date(2024, 1, 1),
            "end_date": date(2024, 12, 31),
            "status": PlanStatus.completed,
            "approved_at": datetime(2023, 12, 15),
        },
        {
            "year": 2025,
            "title": "2025 Annual Plan",
            "description": "Annual inspection plan for 2025 covering all critical assets",
            "total_inspections": 420,
            "start_date": date(2025, 1, 1),
            "end_date": date(2025, 12, 31),
            "status": PlanStatus.in_progress,
            "approved_at": datetime(2024, 12, 10),
        },
        {
            "year": 2027,
            "title": "2027 Annual Plan",
            "description": "Annual inspection plan for 2027 - Draft",
            "total_inspections": 480,
            "start_date": date(2027, 1, 1),
            "end_date": date(2027, 12, 31),
            "status": PlanStatus.draft,
            "approved_at": None,
        },
    ]

    for plan_data in plans_data:
        # Check if plan already exists
        existing = db.query(AnnualPlan).filter_by(year=plan_data["year"]).first()
        if existing:
            logger.info(f"Annual plan for {plan_data['year']} already exists, skipping...")
            continue

        plan = AnnualPlan(
            year=plan_data["year"],
            title=plan_data["title"],
            description=plan_data["description"],
            total_inspections=plan_data["total_inspections"],
            start_date=plan_data["start_date"],
            end_date=plan_data["end_date"],
            status=plan_data["status"],
            approved_by_id=admin.id if plan_data["approved_at"] else None,
            approved_at=plan_data["approved_at"],
            created_by_id=admin.id,
        )
        db.add(plan)
        logger.info(f"Created annual plan for {plan_data['year']}")

    db.commit()

    # Print summary
    total_plans = db.query(AnnualPlan).count()
    logger.info(f"Total annual plans: {total_plans}")


def main():
    """Main function."""
    logger.info("=" * 60)
    logger.info("Adding Annual Plans to Database")
    logger.info("=" * 60)

    db = SessionLocal()

    try:
        create_annual_plans(db)

        logger.info("=" * 60)
        logger.info("Annual Plans Added Successfully!")
        logger.info("=" * 60)

    except Exception as e:
        logger.error(f"Error: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
