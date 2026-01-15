"""
Annual inspection planning models.

Module 3: Annual Inspection Planning
"""
import enum
from sqlalchemy import Column, Integer, String, Text, Enum, Date, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin


class PlanStatus(enum.Enum):
    """Plan status enumeration."""
    draft = "draft"
    submitted = "submitted"
    approved = "approved"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class Quarter(enum.Enum):
    """Quarter enumeration."""
    Q1 = "Q1"
    Q2 = "Q2"
    Q3 = "Q3"
    Q4 = "Q4"


class InspectionType(enum.Enum):
    """Inspection type enumeration."""
    routine = "routine"
    statutory = "statutory"
    rbi = "rbi"
    shutdown = "shutdown"
    emergency = "emergency"


class InspectionPriority(enum.Enum):
    """Inspection priority enumeration."""
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class PlannedInspectionStatus(enum.Enum):
    """Planned inspection status enumeration."""
    scheduled = "scheduled"
    assigned = "assigned"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"
    rescheduled = "rescheduled"


class AnnualPlan(Base, TimestampMixin):
    """
    Annual inspection plan model.

    Top-level planning document for yearly inspection activities.
    """
    __tablename__ = "annual_plans"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(PlanStatus), default=PlanStatus.draft, nullable=False)
    total_inspections = Column(Integer, default=0, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    created_by = relationship("User", foreign_keys=[created_by_id])
    approved_by = relationship("User", foreign_keys=[approved_by_id])
    quarterly_plans = relationship("QuarterlyPlan", back_populates="annual_plan", cascade="all, delete-orphan")
    planned_inspections = relationship("PlannedInspection", back_populates="annual_plan")

    __table_args__ = (
        Index('idx_annual_plan_year', 'year'),
        Index('idx_annual_plan_status', 'status'),
        Index('idx_annual_plan_dates', 'start_date', 'end_date'),
    )

    def __repr__(self) -> str:
        return f"<AnnualPlan(id={self.id}, year={self.year}, title='{self.title}')>"


class QuarterlyPlan(Base, TimestampMixin):
    """
    Quarterly inspection plan model.

    Breaks down annual plan into quarterly segments.
    """
    __tablename__ = "quarterly_plans"

    id = Column(Integer, primary_key=True, index=True)
    annual_plan_id = Column(Integer, ForeignKey("annual_plans.id", ondelete="CASCADE"), nullable=False)
    quarter = Column(Enum(Quarter), nullable=False)
    title = Column(String(200), nullable=False)
    status = Column(Enum(PlanStatus), default=PlanStatus.draft, nullable=False)
    total_inspections = Column(Integer, default=0, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    annual_plan = relationship("AnnualPlan", back_populates="quarterly_plans")
    created_by = relationship("User", foreign_keys=[created_by_id])
    approved_by = relationship("User", foreign_keys=[approved_by_id])
    monthly_plans = relationship("MonthlyPlan", back_populates="quarterly_plan", cascade="all, delete-orphan")
    planned_inspections = relationship("PlannedInspection", back_populates="quarterly_plan")

    __table_args__ = (
        Index('idx_quarterly_plan_annual', 'annual_plan_id'),
        Index('idx_quarterly_plan_quarter', 'quarter'),
        Index('idx_quarterly_plan_status', 'status'),
        Index('idx_quarterly_plan_dates', 'start_date', 'end_date'),
    )

    def __repr__(self) -> str:
        return f"<QuarterlyPlan(id={self.id}, quarter={self.quarter.value}, title='{self.title}')>"


class MonthlyPlan(Base, TimestampMixin):
    """
    Monthly inspection plan model.

    Breaks down quarterly plan into monthly segments.
    """
    __tablename__ = "monthly_plans"

    id = Column(Integer, primary_key=True, index=True)
    quarterly_plan_id = Column(Integer, ForeignKey("quarterly_plans.id", ondelete="CASCADE"), nullable=False)
    month = Column(Integer, nullable=False)  # 1-12
    title = Column(String(200), nullable=False)
    status = Column(Enum(PlanStatus), default=PlanStatus.draft, nullable=False)
    total_inspections = Column(Integer, default=0, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    quarterly_plan = relationship("QuarterlyPlan", back_populates="monthly_plans")
    created_by = relationship("User", foreign_keys=[created_by_id])
    approved_by = relationship("User", foreign_keys=[approved_by_id])
    planned_inspections = relationship("PlannedInspection", back_populates="monthly_plan")

    __table_args__ = (
        Index('idx_monthly_plan_quarterly', 'quarterly_plan_id'),
        Index('idx_monthly_plan_month', 'month'),
        Index('idx_monthly_plan_status', 'status'),
        Index('idx_monthly_plan_dates', 'start_date', 'end_date'),
    )

    def __repr__(self) -> str:
        return f"<MonthlyPlan(id={self.id}, month={self.month}, title='{self.title}')>"


class PlannedInspection(Base, TimestampMixin):
    """
    Planned inspection model.

    Individual inspection scheduled within a plan.
    """
    __tablename__ = "planned_inspections"

    id = Column(Integer, primary_key=True, index=True)
    annual_plan_id = Column(Integer, ForeignKey("annual_plans.id", ondelete="CASCADE"), nullable=True)
    quarterly_plan_id = Column(Integer, ForeignKey("quarterly_plans.id", ondelete="CASCADE"), nullable=True)
    monthly_plan_id = Column(Integer, ForeignKey("monthly_plans.id", ondelete="CASCADE"), nullable=True)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False)
    inspection_type = Column(Enum(InspectionType), nullable=False)
    priority = Column(Enum(InspectionPriority), default=InspectionPriority.medium, nullable=False)
    scheduled_date = Column(Date, nullable=False)
    estimated_duration_hours = Column(Integer, nullable=True)
    assigned_team_leader_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(Enum(PlannedInspectionStatus), default=PlannedInspectionStatus.scheduled, nullable=False)
    notes = Column(Text, nullable=True)

    # Relationships
    annual_plan = relationship("AnnualPlan", back_populates="planned_inspections")
    quarterly_plan = relationship("QuarterlyPlan", back_populates="planned_inspections")
    monthly_plan = relationship("MonthlyPlan", back_populates="planned_inspections")
    asset = relationship("Asset", back_populates="planned_inspections")
    assigned_team_leader = relationship("User", foreign_keys=[assigned_team_leader_id])
    inspector_assignments = relationship("InspectorAssignment", back_populates="planned_inspection", cascade="all, delete-orphan")
    inspections = relationship("Inspection", back_populates="planned_inspection")

    __table_args__ = (
        Index('idx_planned_inspection_annual', 'annual_plan_id'),
        Index('idx_planned_inspection_quarterly', 'quarterly_plan_id'),
        Index('idx_planned_inspection_monthly', 'monthly_plan_id'),
        Index('idx_planned_inspection_asset', 'asset_id'),
        Index('idx_planned_inspection_status', 'status'),
        Index('idx_planned_inspection_date', 'scheduled_date'),
        Index('idx_planned_inspection_priority', 'priority'),
        Index('idx_planned_inspection_type', 'inspection_type'),
    )

    def __repr__(self) -> str:
        return f"<PlannedInspection(id={self.id}, asset_id={self.asset_id}, scheduled_date={self.scheduled_date})>"
