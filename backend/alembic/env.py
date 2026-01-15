"""
Alembic environment configuration.

This module configures the Alembic migration environment and ensures
all models are imported for autogeneration.
"""
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

import sys
from pathlib import Path

# Add the parent directory to sys.path to enable imports
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import settings
from app.database import Base

# Import all models to ensure they are registered with SQLAlchemy metadata
from app.models import (
    # Module 1: Authentication & User Management
    User, RefreshToken, UserSession,
    # Module 2: Asset & Equipment Management
    Asset, AssetDocument,
    # Module 3: Annual Inspection Planning
    AnnualPlan, QuarterlyPlan, MonthlyPlan, PlannedInspection,
    # Module 4: Resource Coordination
    Team, TeamMember, InspectorAssignment, ResourceAvailability,
    # Module 5: Inspection Execution & Data Entry
    Inspection, InspectionFinding, InspectionPhoto, InspectionMeasurement, InspectionChecklist,
    # Module 6: Draft Report & Quality Control
    InspectionReport, ReportTemplate, ReportVersion,
    # Module 7: Multi-Stage Approval Workflow
    ApprovalWorkflow, ApprovalStage, ApprovalComment, ApprovalHistory,
    # Module 8: Work Request Integration
    WorkRequest, WRDocument,
    # Module 9: RBI Compliance & Audit
    RBIGuideline, RBIAudit, RBIChecklistItem, RBIException,
    # Module 10: Automated Reporting & Dashboards
    Dashboard, ScheduledReport, KPIMetric,
    # Module 11: Error Handling & Escalation
    Escalation, EscalationRule, Notification, SystemError,
    # Module 12: Admin Panel & System Configuration
    SystemSetting, AuditLog, SystemHealth,
)

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.
    """
    url = config.get_main_option("sqlalchemy.url") or settings.DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.
    """
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = settings.DATABASE_URL
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
