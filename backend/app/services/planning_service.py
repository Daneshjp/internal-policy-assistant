"""
Service layer for annual inspection planning.

Module 3: Annual Inspection Planning (AIP/QIP/MIP)
"""
import logging
from datetime import datetime, date, timedelta
from typing import List, Optional, Dict
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func

from app.models.annual_plan import (
    AnnualPlan,
    QuarterlyPlan,
    MonthlyPlan,
    PlannedInspection,
    PlanStatus,
    Quarter,
    PlannedInspectionStatus
)
from app.schemas.planning import (
    AnnualPlanCreate,
    AnnualPlanUpdate,
    QuarterlyPlanCreate,
    MonthlyPlanCreate,
    PlannedInspectionCreate,
    PlannedInspectionUpdate
)

logger = logging.getLogger(__name__)


# Annual Plan Operations
def create_annual_plan(
    db: Session,
    data: AnnualPlanCreate,
    user_id: int
) -> AnnualPlan:
    """
    Create a new annual inspection plan.

    Args:
        db: Database session
        data: Annual plan creation data
        user_id: ID of user creating the plan

    Returns:
        AnnualPlan: Created annual plan

    Raises:
        ValueError: If year already has an active plan
    """
    # Check if plan for year already exists
    existing = db.query(AnnualPlan).filter(
        and_(
            AnnualPlan.year == data.year,
            AnnualPlan.status != PlanStatus.cancelled
        )
    ).first()

    if existing:
        raise ValueError(f"An active plan for year {data.year} already exists")

    plan = AnnualPlan(
        **data.model_dump(),
        created_by_id=user_id,
        status=PlanStatus.draft
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)

    logger.info(f"Created annual plan {plan.id} for year {plan.year} by user {user_id}")
    return plan


def get_annual_plans(
    db: Session,
    year: Optional[int] = None,
    status: Optional[PlanStatus] = None,
    skip: int = 0,
    limit: int = 100
) -> List[AnnualPlan]:
    """
    Get list of annual plans with optional filters.

    Args:
        db: Database session
        year: Filter by year
        status: Filter by status
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List[AnnualPlan]: List of annual plans
    """
    query = db.query(AnnualPlan)

    if year:
        query = query.filter(AnnualPlan.year == year)
    if status:
        query = query.filter(AnnualPlan.status == status)

    query = query.order_by(AnnualPlan.year.desc())
    return query.offset(skip).limit(limit).all()


def get_annual_plan(db: Session, plan_id: int) -> Optional[AnnualPlan]:
    """
    Get annual plan by ID with related quarterly plans.

    Args:
        db: Database session
        plan_id: Annual plan ID

    Returns:
        Optional[AnnualPlan]: Annual plan if found
    """
    return db.query(AnnualPlan).options(
        joinedload(AnnualPlan.quarterly_plans)
    ).filter(AnnualPlan.id == plan_id).first()


def update_annual_plan(
    db: Session,
    plan_id: int,
    data: AnnualPlanUpdate
) -> Optional[AnnualPlan]:
    """
    Update an annual plan.

    Args:
        db: Database session
        plan_id: Annual plan ID
        data: Update data

    Returns:
        Optional[AnnualPlan]: Updated annual plan if found
    """
    plan = db.query(AnnualPlan).filter(AnnualPlan.id == plan_id).first()
    if not plan:
        return None

    # Only allow updates to draft or submitted plans
    if plan.status not in [PlanStatus.draft, PlanStatus.submitted]:
        raise ValueError("Cannot update approved or completed plans")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(plan, field, value)

    db.commit()
    db.refresh(plan)

    logger.info(f"Updated annual plan {plan_id}")
    return plan


def approve_annual_plan(
    db: Session,
    plan_id: int,
    approver_id: int
) -> Optional[AnnualPlan]:
    """
    Approve an annual plan.

    Args:
        db: Database session
        plan_id: Annual plan ID
        approver_id: ID of user approving the plan

    Returns:
        Optional[AnnualPlan]: Approved annual plan if found

    Raises:
        ValueError: If plan is not in submitted status
    """
    plan = db.query(AnnualPlan).filter(AnnualPlan.id == plan_id).first()
    if not plan:
        return None

    if plan.status != PlanStatus.submitted:
        raise ValueError("Only submitted plans can be approved")

    plan.status = PlanStatus.approved
    plan.approved_by_id = approver_id
    plan.approved_at = datetime.now()

    db.commit()
    db.refresh(plan)

    logger.info(f"Annual plan {plan_id} approved by user {approver_id}")
    return plan


# Quarterly Plan Operations
def create_quarterly_plan(
    db: Session,
    data: QuarterlyPlanCreate,
    user_id: int
) -> QuarterlyPlan:
    """
    Create a new quarterly plan.

    Args:
        db: Database session
        data: Quarterly plan creation data
        user_id: ID of user creating the plan

    Returns:
        QuarterlyPlan: Created quarterly plan

    Raises:
        ValueError: If annual plan doesn't exist or quarter already has a plan
    """
    # Check annual plan exists
    annual_plan = db.query(AnnualPlan).filter(AnnualPlan.id == data.annual_plan_id).first()
    if not annual_plan:
        raise ValueError(f"Annual plan {data.annual_plan_id} not found")

    # Check if quarter already has a plan
    existing = db.query(QuarterlyPlan).filter(
        and_(
            QuarterlyPlan.annual_plan_id == data.annual_plan_id,
            QuarterlyPlan.quarter == data.quarter
        )
    ).first()

    if existing:
        raise ValueError(f"Quarter {data.quarter.value} already has a plan for this annual plan")

    plan = QuarterlyPlan(
        **data.model_dump(),
        created_by_id=user_id,
        status=PlanStatus.draft
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)

    logger.info(f"Created quarterly plan {plan.id} for {data.quarter.value} by user {user_id}")
    return plan


def get_quarterly_plans(
    db: Session,
    annual_plan_id: Optional[int] = None,
    quarter: Optional[Quarter] = None,
    status: Optional[PlanStatus] = None
) -> List[QuarterlyPlan]:
    """
    Get list of quarterly plans with optional filters.

    Args:
        db: Database session
        annual_plan_id: Filter by annual plan
        quarter: Filter by quarter
        status: Filter by status

    Returns:
        List[QuarterlyPlan]: List of quarterly plans
    """
    query = db.query(QuarterlyPlan)

    if annual_plan_id:
        query = query.filter(QuarterlyPlan.annual_plan_id == annual_plan_id)
    if quarter:
        query = query.filter(QuarterlyPlan.quarter == quarter)
    if status:
        query = query.filter(QuarterlyPlan.status == status)

    return query.order_by(QuarterlyPlan.start_date).all()


def get_quarterly_plan(db: Session, plan_id: int) -> Optional[QuarterlyPlan]:
    """
    Get quarterly plan by ID with related monthly plans.

    Args:
        db: Database session
        plan_id: Quarterly plan ID

    Returns:
        Optional[QuarterlyPlan]: Quarterly plan if found
    """
    return db.query(QuarterlyPlan).options(
        joinedload(QuarterlyPlan.monthly_plans)
    ).filter(QuarterlyPlan.id == plan_id).first()


# Monthly Plan Operations
def create_monthly_plan(
    db: Session,
    data: MonthlyPlanCreate,
    user_id: int
) -> MonthlyPlan:
    """
    Create a new monthly plan.

    Args:
        db: Database session
        data: Monthly plan creation data
        user_id: ID of user creating the plan

    Returns:
        MonthlyPlan: Created monthly plan

    Raises:
        ValueError: If quarterly plan doesn't exist or month already has a plan
    """
    # Check quarterly plan exists
    quarterly_plan = db.query(QuarterlyPlan).filter(QuarterlyPlan.id == data.quarterly_plan_id).first()
    if not quarterly_plan:
        raise ValueError(f"Quarterly plan {data.quarterly_plan_id} not found")

    # Check if month already has a plan
    existing = db.query(MonthlyPlan).filter(
        and_(
            MonthlyPlan.quarterly_plan_id == data.quarterly_plan_id,
            MonthlyPlan.month == data.month
        )
    ).first()

    if existing:
        raise ValueError(f"Month {data.month} already has a plan for this quarterly plan")

    plan = MonthlyPlan(
        **data.model_dump(),
        created_by_id=user_id,
        status=PlanStatus.draft
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)

    logger.info(f"Created monthly plan {plan.id} for month {data.month} by user {user_id}")
    return plan


def get_monthly_plans(
    db: Session,
    quarterly_plan_id: Optional[int] = None,
    month: Optional[int] = None,
    status: Optional[PlanStatus] = None
) -> List[MonthlyPlan]:
    """
    Get list of monthly plans with optional filters.

    Args:
        db: Database session
        quarterly_plan_id: Filter by quarterly plan
        month: Filter by month
        status: Filter by status

    Returns:
        List[MonthlyPlan]: List of monthly plans
    """
    query = db.query(MonthlyPlan)

    if quarterly_plan_id:
        query = query.filter(MonthlyPlan.quarterly_plan_id == quarterly_plan_id)
    if month:
        query = query.filter(MonthlyPlan.month == month)
    if status:
        query = query.filter(MonthlyPlan.status == status)

    return query.order_by(MonthlyPlan.start_date).all()


def get_monthly_plan(db: Session, plan_id: int) -> Optional[MonthlyPlan]:
    """
    Get monthly plan by ID.

    Args:
        db: Database session
        plan_id: Monthly plan ID

    Returns:
        Optional[MonthlyPlan]: Monthly plan if found
    """
    return db.query(MonthlyPlan).filter(MonthlyPlan.id == plan_id).first()


# Automatic Breakdown Functions
def auto_breakdown_to_quarterly(
    db: Session,
    annual_plan_id: int,
    user_id: int,
    distribute_evenly: bool = True
) -> List[QuarterlyPlan]:
    """
    Automatically break down annual plan into quarterly plans.

    Args:
        db: Database session
        annual_plan_id: Annual plan ID
        user_id: ID of user performing breakdown
        distribute_evenly: Whether to distribute inspections evenly

    Returns:
        List[QuarterlyPlan]: Created quarterly plans

    Raises:
        ValueError: If annual plan not found or already has quarterly plans
    """
    annual_plan = db.query(AnnualPlan).filter(AnnualPlan.id == annual_plan_id).first()
    if not annual_plan:
        raise ValueError(f"Annual plan {annual_plan_id} not found")

    # Check if quarterly plans already exist
    existing = db.query(QuarterlyPlan).filter(
        QuarterlyPlan.annual_plan_id == annual_plan_id
    ).count()

    if existing > 0:
        raise ValueError("Quarterly plans already exist for this annual plan")

    # Calculate quarter dates and inspection distribution
    quarters = [Quarter.Q1, Quarter.Q2, Quarter.Q3, Quarter.Q4]
    quarter_data = []

    for i, quarter in enumerate(quarters):
        # Calculate quarter dates
        quarter_start = date(annual_plan.year, i * 3 + 1, 1)
        if i == 3:  # Q4
            quarter_end = date(annual_plan.year, 12, 31)
        else:
            next_quarter_start = date(annual_plan.year, (i + 1) * 3 + 1, 1)
            quarter_end = next_quarter_start - timedelta(days=1)

        # Calculate inspection count
        if distribute_evenly:
            inspections = annual_plan.total_inspections // 4
            if i < annual_plan.total_inspections % 4:
                inspections += 1
        else:
            inspections = 0

        quarter_data.append({
            'quarter': quarter,
            'start_date': quarter_start,
            'end_date': quarter_end,
            'total_inspections': inspections
        })

    # Create quarterly plans
    created_plans = []
    for data in quarter_data:
        plan = QuarterlyPlan(
            annual_plan_id=annual_plan_id,
            quarter=data['quarter'],
            title=f"{annual_plan.title} - {data['quarter'].value}",
            status=PlanStatus.draft,
            total_inspections=data['total_inspections'],
            start_date=data['start_date'],
            end_date=data['end_date'],
            created_by_id=user_id
        )
        db.add(plan)
        created_plans.append(plan)

    db.commit()

    logger.info(f"Auto-generated 4 quarterly plans for annual plan {annual_plan_id}")
    return created_plans


def auto_breakdown_to_monthly(
    db: Session,
    quarterly_plan_id: int,
    user_id: int,
    distribute_evenly: bool = True
) -> List[MonthlyPlan]:
    """
    Automatically break down quarterly plan into monthly plans.

    Args:
        db: Database session
        quarterly_plan_id: Quarterly plan ID
        user_id: ID of user performing breakdown
        distribute_evenly: Whether to distribute inspections evenly

    Returns:
        List[MonthlyPlan]: Created monthly plans

    Raises:
        ValueError: If quarterly plan not found or already has monthly plans
    """
    quarterly_plan = db.query(QuarterlyPlan).filter(QuarterlyPlan.id == quarterly_plan_id).first()
    if not quarterly_plan:
        raise ValueError(f"Quarterly plan {quarterly_plan_id} not found")

    # Check if monthly plans already exist
    existing = db.query(MonthlyPlan).filter(
        MonthlyPlan.quarterly_plan_id == quarterly_plan_id
    ).count()

    if existing > 0:
        raise ValueError("Monthly plans already exist for this quarterly plan")

    # Determine months based on quarter
    quarter_to_months = {
        Quarter.Q1: [1, 2, 3],
        Quarter.Q2: [4, 5, 6],
        Quarter.Q3: [7, 8, 9],
        Quarter.Q4: [10, 11, 12]
    }
    months = quarter_to_months[quarterly_plan.quarter]

    # Create monthly plans
    created_plans = []
    for i, month in enumerate(months):
        # Calculate month dates
        year = quarterly_plan.start_date.year
        month_start = date(year, month, 1)
        if month == 12:
            month_end = date(year, 12, 31)
        else:
            next_month_start = date(year, month + 1, 1)
            month_end = next_month_start - timedelta(days=1)

        # Calculate inspection count
        if distribute_evenly:
            inspections = quarterly_plan.total_inspections // 3
            if i < quarterly_plan.total_inspections % 3:
                inspections += 1
        else:
            inspections = 0

        plan = MonthlyPlan(
            quarterly_plan_id=quarterly_plan_id,
            month=month,
            title=f"{quarterly_plan.title} - Month {month}",
            status=PlanStatus.draft,
            total_inspections=inspections,
            start_date=month_start,
            end_date=month_end,
            created_by_id=user_id
        )
        db.add(plan)
        created_plans.append(plan)

    db.commit()

    logger.info(f"Auto-generated 3 monthly plans for quarterly plan {quarterly_plan_id}")
    return created_plans


# Planned Inspection Operations
def get_planned_inspections(
    db: Session,
    annual_plan_id: Optional[int] = None,
    quarterly_plan_id: Optional[int] = None,
    monthly_plan_id: Optional[int] = None,
    asset_id: Optional[int] = None,
    status: Optional[PlannedInspectionStatus] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    skip: int = 0,
    limit: int = 100
) -> List[PlannedInspection]:
    """
    Get list of planned inspections with filters.

    Args:
        db: Database session
        annual_plan_id: Filter by annual plan
        quarterly_plan_id: Filter by quarterly plan
        monthly_plan_id: Filter by monthly plan
        asset_id: Filter by asset
        status: Filter by status
        date_from: Filter by scheduled date from
        date_to: Filter by scheduled date to
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List[PlannedInspection]: List of planned inspections
    """
    query = db.query(PlannedInspection)

    if annual_plan_id:
        query = query.filter(PlannedInspection.annual_plan_id == annual_plan_id)
    if quarterly_plan_id:
        query = query.filter(PlannedInspection.quarterly_plan_id == quarterly_plan_id)
    if monthly_plan_id:
        query = query.filter(PlannedInspection.monthly_plan_id == monthly_plan_id)
    if asset_id:
        query = query.filter(PlannedInspection.asset_id == asset_id)
    if status:
        query = query.filter(PlannedInspection.status == status)
    if date_from:
        query = query.filter(PlannedInspection.scheduled_date >= date_from)
    if date_to:
        query = query.filter(PlannedInspection.scheduled_date <= date_to)

    query = query.order_by(PlannedInspection.scheduled_date)
    return query.offset(skip).limit(limit).all()


def get_planned_inspection(db: Session, inspection_id: int) -> Optional[PlannedInspection]:
    """
    Get planned inspection by ID.

    Args:
        db: Database session
        inspection_id: Planned inspection ID

    Returns:
        Optional[PlannedInspection]: Planned inspection if found
    """
    return db.query(PlannedInspection).filter(PlannedInspection.id == inspection_id).first()


def create_planned_inspection(
    db: Session,
    data: PlannedInspectionCreate
) -> PlannedInspection:
    """
    Create a new planned inspection.

    Args:
        db: Database session
        data: Planned inspection creation data

    Returns:
        PlannedInspection: Created planned inspection

    Raises:
        ValueError: If referenced plans or asset don't exist
    """
    # Validate references exist
    if data.annual_plan_id:
        plan = db.query(AnnualPlan).filter(AnnualPlan.id == data.annual_plan_id).first()
        if not plan:
            raise ValueError(f"Annual plan {data.annual_plan_id} not found")

    if data.quarterly_plan_id:
        plan = db.query(QuarterlyPlan).filter(QuarterlyPlan.id == data.quarterly_plan_id).first()
        if not plan:
            raise ValueError(f"Quarterly plan {data.quarterly_plan_id} not found")

    if data.monthly_plan_id:
        plan = db.query(MonthlyPlan).filter(MonthlyPlan.id == data.monthly_plan_id).first()
        if not plan:
            raise ValueError(f"Monthly plan {data.monthly_plan_id} not found")

    inspection = PlannedInspection(
        **data.model_dump(),
        status=PlannedInspectionStatus.scheduled
    )
    db.add(inspection)
    db.commit()
    db.refresh(inspection)

    logger.info(f"Created planned inspection {inspection.id} for asset {data.asset_id}")
    return inspection


def update_planned_inspection(
    db: Session,
    inspection_id: int,
    data: PlannedInspectionUpdate
) -> Optional[PlannedInspection]:
    """
    Update a planned inspection.

    Args:
        db: Database session
        inspection_id: Planned inspection ID
        data: Update data

    Returns:
        Optional[PlannedInspection]: Updated planned inspection if found
    """
    inspection = db.query(PlannedInspection).filter(PlannedInspection.id == inspection_id).first()
    if not inspection:
        return None

    # Prevent updates to completed inspections
    if inspection.status == PlannedInspectionStatus.completed:
        raise ValueError("Cannot update completed inspections")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(inspection, field, value)

    db.commit()
    db.refresh(inspection)

    logger.info(f"Updated planned inspection {inspection_id}")
    return inspection
