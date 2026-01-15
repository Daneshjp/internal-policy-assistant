"""
API endpoints for annual inspection planning.

Module 3: Annual Inspection Planning (AIP/QIP/MIP)
"""
import logging
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_user, RoleChecker
from app.models.user import User, UserRole
from app.models.annual_plan import PlanStatus, Quarter, PlannedInspectionStatus
from app.schemas.planning import (
    AnnualPlanCreate,
    AnnualPlanUpdate,
    AnnualPlanResponse,
    AnnualPlanWithDetails,
    QuarterlyPlanCreate,
    QuarterlyPlanUpdate,
    QuarterlyPlanResponse,
    QuarterlyPlanWithDetails,
    MonthlyPlanCreate,
    MonthlyPlanUpdate,
    MonthlyPlanResponse,
    PlannedInspectionCreate,
    PlannedInspectionUpdate,
    PlannedInspectionResponse,
    BreakdownRequest,
    ApprovalRequest
)
from app.services.planning_service import (
    create_annual_plan,
    get_annual_plans,
    get_annual_plan,
    update_annual_plan,
    approve_annual_plan,
    auto_breakdown_to_quarterly,
    create_quarterly_plan,
    get_quarterly_plans,
    get_quarterly_plan,
    auto_breakdown_to_monthly,
    create_monthly_plan,
    get_monthly_plans,
    get_monthly_plan,
    get_planned_inspections,
    get_planned_inspection,
    create_planned_inspection,
    update_planned_inspection
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/plans", tags=["Planning"])


# Role checker dependency - using RoleChecker from auth.dependencies
require_team_leader_or_admin = RoleChecker(["team_leader", "admin"])


# Annual Plan Endpoints
@router.get("/annual", response_model=List[AnnualPlanResponse])
async def list_annual_plans(
    year: Optional[int] = Query(None, description="Filter by year"),
    plan_status: Optional[PlanStatus] = Query(None, alias="status", description="Filter by status"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[AnnualPlanResponse]:
    """
    Get list of annual plans.

    Returns list of annual inspection plans with optional filters.
    """
    plans = get_annual_plans(
        db=db,
        year=year,
        status=plan_status,
        skip=skip,
        limit=limit
    )
    return plans


@router.post("/annual", response_model=AnnualPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_annual_plan(
    data: AnnualPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_team_leader_or_admin)
) -> AnnualPlanResponse:
    """
    Create a new annual plan.

    Requires team_leader or admin role.
    """
    try:
        plan = create_annual_plan(db=db, data=data, user_id=current_user.id)
        return plan
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/annual/{plan_id}", response_model=AnnualPlanWithDetails)
async def get_annual_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> AnnualPlanWithDetails:
    """
    Get annual plan details.

    Returns annual plan with related quarterly plans.
    """
    plan = get_annual_plan(db=db, plan_id=plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Annual plan {plan_id} not found"
        )
    return plan


@router.put("/annual/{plan_id}", response_model=AnnualPlanResponse)
async def update_annual_plan(
    plan_id: int,
    data: AnnualPlanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_team_leader_or_admin)
) -> AnnualPlanResponse:
    """
    Update an annual plan.

    Requires team_leader or admin role.
    """
    try:
        plan = update_annual_plan(db=db, plan_id=plan_id, data=data)
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Annual plan {plan_id} not found"
            )
        return plan
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/annual/{plan_id}/approve", response_model=AnnualPlanResponse)
async def approve_annual_plan(
    plan_id: int,
    approval: ApprovalRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_team_leader_or_admin)
) -> AnnualPlanResponse:
    """
    Approve an annual plan.

    Requires team_leader or admin role.
    """
    try:
        plan = approve_annual_plan(db=db, plan_id=plan_id, approver_id=current_user.id)
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Annual plan {plan_id} not found"
            )
        logger.info(f"Annual plan {plan_id} approved by user {current_user.id}")
        return plan
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/annual/{plan_id}/breakdown", response_model=List[QuarterlyPlanResponse])
async def breakdown_annual_to_quarterly(
    plan_id: int,
    breakdown: BreakdownRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_team_leader_or_admin)
) -> List[QuarterlyPlanResponse]:
    """
    Auto-generate quarterly plans from annual plan.

    Automatically breaks down the annual plan into 4 quarterly plans.
    Requires team_leader or admin role.
    """
    try:
        plans = auto_breakdown_to_quarterly(
            db=db,
            annual_plan_id=plan_id,
            user_id=current_user.id,
            distribute_evenly=breakdown.distribute_evenly
        )
        logger.info(f"Created {len(plans)} quarterly plans for annual plan {plan_id}")
        return plans
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# Quarterly Plan Endpoints
@router.get("/quarterly", response_model=List[QuarterlyPlanResponse])
async def list_quarterly_plans(
    annual_plan_id: Optional[int] = Query(None, description="Filter by annual plan"),
    quarter: Optional[Quarter] = Query(None, description="Filter by quarter"),
    plan_status: Optional[PlanStatus] = Query(None, alias="status", description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[QuarterlyPlanResponse]:
    """
    Get list of quarterly plans.

    Returns list of quarterly plans with optional filters.
    """
    plans = get_quarterly_plans(
        db=db,
        annual_plan_id=annual_plan_id,
        quarter=quarter,
        status=plan_status
    )
    return plans


@router.post("/quarterly", response_model=QuarterlyPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_quarterly_plan(
    data: QuarterlyPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_team_leader_or_admin)
) -> QuarterlyPlanResponse:
    """
    Create a new quarterly plan.

    Requires team_leader or admin role.
    """
    try:
        plan = create_quarterly_plan(db=db, data=data, user_id=current_user.id)
        return plan
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/quarterly/{plan_id}", response_model=QuarterlyPlanWithDetails)
async def get_quarterly_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> QuarterlyPlanWithDetails:
    """
    Get quarterly plan details.

    Returns quarterly plan with related monthly plans.
    """
    plan = get_quarterly_plan(db=db, plan_id=plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quarterly plan {plan_id} not found"
        )
    return plan


@router.post("/quarterly/{plan_id}/breakdown", response_model=List[MonthlyPlanResponse])
async def breakdown_quarterly_to_monthly(
    plan_id: int,
    breakdown: BreakdownRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_team_leader_or_admin)
) -> List[MonthlyPlanResponse]:
    """
    Auto-generate monthly plans from quarterly plan.

    Automatically breaks down the quarterly plan into 3 monthly plans.
    Requires team_leader or admin role.
    """
    try:
        plans = auto_breakdown_to_monthly(
            db=db,
            quarterly_plan_id=plan_id,
            user_id=current_user.id,
            distribute_evenly=breakdown.distribute_evenly
        )
        logger.info(f"Created {len(plans)} monthly plans for quarterly plan {plan_id}")
        return plans
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# Monthly Plan Endpoints
@router.get("/monthly", response_model=List[MonthlyPlanResponse])
async def list_monthly_plans(
    quarterly_plan_id: Optional[int] = Query(None, description="Filter by quarterly plan"),
    month: Optional[int] = Query(None, ge=1, le=12, description="Filter by month"),
    plan_status: Optional[PlanStatus] = Query(None, alias="status", description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[MonthlyPlanResponse]:
    """
    Get list of monthly plans.

    Returns list of monthly plans with optional filters.
    """
    plans = get_monthly_plans(
        db=db,
        quarterly_plan_id=quarterly_plan_id,
        month=month,
        status=plan_status
    )
    return plans


@router.post("/monthly", response_model=MonthlyPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_monthly_plan(
    data: MonthlyPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_team_leader_or_admin)
) -> MonthlyPlanResponse:
    """
    Create a new monthly plan.

    Requires team_leader or admin role.
    """
    try:
        plan = create_monthly_plan(db=db, data=data, user_id=current_user.id)
        return plan
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/monthly/{plan_id}", response_model=MonthlyPlanResponse)
async def get_monthly_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> MonthlyPlanResponse:
    """
    Get monthly plan details.

    Returns monthly plan information.
    """
    plan = get_monthly_plan(db=db, plan_id=plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Monthly plan {plan_id} not found"
        )
    return plan


# Planned Inspection Endpoints
@router.get("/inspections", response_model=List[PlannedInspectionResponse])
async def list_planned_inspections(
    annual_plan_id: Optional[int] = Query(None, description="Filter by annual plan"),
    quarterly_plan_id: Optional[int] = Query(None, description="Filter by quarterly plan"),
    monthly_plan_id: Optional[int] = Query(None, description="Filter by monthly plan"),
    asset_id: Optional[int] = Query(None, description="Filter by asset"),
    inspection_status: Optional[PlannedInspectionStatus] = Query(None, alias="status", description="Filter by status"),
    date_from: Optional[date] = Query(None, description="Filter by scheduled date from"),
    date_to: Optional[date] = Query(None, description="Filter by scheduled date to"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[PlannedInspectionResponse]:
    """
    Get list of planned inspections.

    Returns list of planned inspections with optional filters.
    """
    inspections = get_planned_inspections(
        db=db,
        annual_plan_id=annual_plan_id,
        quarterly_plan_id=quarterly_plan_id,
        monthly_plan_id=monthly_plan_id,
        asset_id=asset_id,
        status=inspection_status,
        date_from=date_from,
        date_to=date_to,
        skip=skip,
        limit=limit
    )
    return inspections


@router.get("/inspections/{inspection_id}", response_model=PlannedInspectionResponse)
async def get_planned_inspection(
    inspection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> PlannedInspectionResponse:
    """
    Get planned inspection details.

    Returns planned inspection information.
    """
    inspection = get_planned_inspection(db=db, inspection_id=inspection_id)
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Planned inspection {inspection_id} not found"
        )
    return inspection


@router.post("/inspections", response_model=PlannedInspectionResponse, status_code=status.HTTP_201_CREATED)
async def create_planned_inspection(
    data: PlannedInspectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_team_leader_or_admin)
) -> PlannedInspectionResponse:
    """
    Create a new planned inspection.

    Requires team_leader or admin role.
    """
    try:
        inspection = create_planned_inspection(db=db, data=data)
        logger.info(f"Created planned inspection {inspection.id} for asset {data.asset_id}")
        return inspection
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/inspections/{inspection_id}", response_model=PlannedInspectionResponse)
async def update_planned_inspection(
    inspection_id: int,
    data: PlannedInspectionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_team_leader_or_admin)
) -> PlannedInspectionResponse:
    """
    Update a planned inspection.

    Requires team_leader or admin role.
    """
    try:
        inspection = update_planned_inspection(db=db, inspection_id=inspection_id, data=data)
        if not inspection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Planned inspection {inspection_id} not found"
            )
        logger.info(f"Updated planned inspection {inspection_id}")
        return inspection
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
