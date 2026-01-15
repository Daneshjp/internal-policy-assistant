"""
Dashboard and reporting models.

Module 10: Automated Reporting & Dashboards
"""
import enum
from sqlalchemy import Column, Integer, String, Text, Enum, ForeignKey, DateTime, Numeric, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin


class DashboardVisibility(enum.Enum):
    """Dashboard visibility enumeration."""
    private = "private"
    team = "team"
    department = "department"
    public = "public"


class ScheduledReportType(enum.Enum):
    """Scheduled report type enumeration."""
    daily_summary = "daily_summary"
    weekly_summary = "weekly_summary"
    monthly_summary = "monthly_summary"
    quarterly_summary = "quarterly_summary"
    annual_summary = "annual_summary"
    custom = "custom"


class MetricTrend(enum.Enum):
    """Metric trend enumeration."""
    up = "up"
    down = "down"
    stable = "stable"


class Dashboard(Base, TimestampMixin):
    """
    Dashboard model.

    Custom dashboards for visualizing inspection data.
    """
    __tablename__ = "dashboards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    layout = Column(JSONB, nullable=True)  # Dashboard layout configuration
    widgets = Column(JSONB, nullable=True)  # Widget configurations
    visibility = Column(Enum(DashboardVisibility), default=DashboardVisibility.private, nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    created_by = relationship("User", foreign_keys=[created_by_id])

    __table_args__ = (
        Index('idx_dashboard_name', 'name'),
        Index('idx_dashboard_visibility', 'visibility'),
        Index('idx_dashboard_created_by', 'created_by_id'),
    )

    def __repr__(self) -> str:
        return f"<Dashboard(id={self.id}, name='{self.name}', visibility={self.visibility.value})>"


class ScheduledReport(Base, TimestampMixin):
    """
    Scheduled report model.

    Automated report generation and distribution.
    """
    __tablename__ = "scheduled_reports"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    report_type = Column(Enum(ScheduledReportType), nullable=False)
    recipients = Column(JSONB, nullable=False)  # Array of email addresses
    schedule_cron = Column(String(100), nullable=False)  # Cron expression
    last_run_at = Column(DateTime(timezone=True), nullable=True)
    next_run_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(String(10), default='true', nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    created_by = relationship("User", foreign_keys=[created_by_id])

    __table_args__ = (
        Index('idx_scheduled_report_name', 'name'),
        Index('idx_scheduled_report_type', 'report_type'),
        Index('idx_scheduled_report_active', 'is_active'),
        Index('idx_scheduled_report_next_run', 'next_run_at'),
    )

    def __repr__(self) -> str:
        return f"<ScheduledReport(id={self.id}, name='{self.name}', type={self.report_type.value})>"


class KPIMetric(Base, TimestampMixin):
    """
    KPI metric model.

    Key performance indicators for inspection activities.
    """
    __tablename__ = "kpi_metrics"

    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String(200), nullable=False, index=True)
    metric_value = Column(String(100), nullable=False)
    metric_unit = Column(String(50), nullable=True)
    comparison_period = Column(String(100), nullable=True)
    change_percentage = Column(Numeric(5, 2), nullable=True)
    trend = Column(Enum(MetricTrend), nullable=True)
    calculated_at = Column(DateTime(timezone=True), nullable=False, index=True)

    __table_args__ = (
        Index('idx_kpi_metric_name', 'metric_name'),
        Index('idx_kpi_calculated', 'calculated_at'),
        Index('idx_kpi_trend', 'trend'),
    )

    def __repr__(self) -> str:
        return f"<KPIMetric(id={self.id}, metric_name='{self.metric_name}', value='{self.metric_value}')>"
