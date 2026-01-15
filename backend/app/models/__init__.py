"""
SQLAlchemy models for InspectionAgent.

This module imports all database models for easy access and ensures
they are registered with SQLAlchemy's metadata.
"""

# Module 1: Authentication & User Management
from app.models.user import User, RefreshToken, UserSession, UserRole

# Module 2: Asset & Equipment Management
from app.models.asset import (
    Asset,
    AssetDocument,
    AssetType,
    AssetCriticality,
    AssetStatus,
    DocumentType,
)

# Module 3: Annual Inspection Planning
from app.models.annual_plan import (
    AnnualPlan,
    QuarterlyPlan,
    MonthlyPlan,
    PlannedInspection,
    PlanStatus,
    Quarter,
    InspectionType,
    InspectionPriority,
    PlannedInspectionStatus,
)

# Module 4: Resource Coordination
from app.models.team import (
    Team,
    TeamMember,
    InspectorAssignment,
    ResourceAvailability,
    RoleInTeam,
    AssignmentRole,
    AssignmentStatus,
    AvailabilityStatus,
)

# Module 5: Inspection Execution & Data Entry
from app.models.inspection import (
    Inspection,
    InspectionFinding,
    InspectionPhoto,
    InspectionMeasurement,
    InspectionChecklist,
    InspectionStatus,
    FindingType,
    FindingSeverity,
    ChecklistItemStatus,
)

# Module 6: Draft Report & Quality Control
from app.models.report import (
    InspectionReport,
    ReportTemplate,
    ReportVersion,
    ReportType,
    ReportStatus,
)

# Module 7: Multi-Stage Approval Workflow
from app.models.approval import (
    ApprovalWorkflow,
    ApprovalStage,
    ApprovalComment,
    ApprovalHistory,
    WorkflowStatus,
    ApprovalStageEnum,
    StageStatus,
    CommentType,
    ApprovalAction,
)

# Module 8: Work Request Integration
from app.models.work_request import (
    WorkRequest,
    WRDocument,
    WRPriority,
    WRType,
    WRStatus,
    SAPSyncStatus,
    WRDocumentType,
)

# Module 9: RBI Compliance & Audit
from app.models.rbi import (
    RBIGuideline,
    RBIAudit,
    RBIChecklistItem,
    RBIException,
    RBICategory,
    RBIAuditStatus,
    RBIChecklistStatus,
)

# Module 10: Automated Reporting & Dashboards
from app.models.dashboard import (
    Dashboard,
    ScheduledReport,
    KPIMetric,
    DashboardVisibility,
    ScheduledReportType,
    MetricTrend,
)

# Module 11: Error Handling & Escalation
from app.models.escalation import (
    Escalation,
    EscalationRule,
    Notification,
    SystemError,
    EntityType,
    EscalationLevel,
    EscalationReason,
    EscalationStatus,
    NotificationType,
    ErrorType,
    ErrorSeverity,
)

# Module 12: Admin Panel & System Configuration
from app.models.admin import (
    SystemSetting,
    AuditLog,
    SystemHealth,
    SettingType,
    ServiceName,
    ServiceStatus,
)

__all__ = [
    # Module 1
    "User",
    "RefreshToken",
    "UserSession",
    "UserRole",
    # Module 2
    "Asset",
    "AssetDocument",
    "AssetType",
    "AssetCriticality",
    "AssetStatus",
    "DocumentType",
    # Module 3
    "AnnualPlan",
    "QuarterlyPlan",
    "MonthlyPlan",
    "PlannedInspection",
    "PlanStatus",
    "Quarter",
    "InspectionType",
    "InspectionPriority",
    "PlannedInspectionStatus",
    # Module 4
    "Team",
    "TeamMember",
    "InspectorAssignment",
    "ResourceAvailability",
    "RoleInTeam",
    "AssignmentRole",
    "AssignmentStatus",
    "AvailabilityStatus",
    # Module 5
    "Inspection",
    "InspectionFinding",
    "InspectionPhoto",
    "InspectionMeasurement",
    "InspectionChecklist",
    "InspectionStatus",
    "FindingType",
    "FindingSeverity",
    "ChecklistItemStatus",
    # Module 6
    "InspectionReport",
    "ReportTemplate",
    "ReportVersion",
    "ReportType",
    "ReportStatus",
    # Module 7
    "ApprovalWorkflow",
    "ApprovalStage",
    "ApprovalComment",
    "ApprovalHistory",
    "WorkflowStatus",
    "ApprovalStageEnum",
    "StageStatus",
    "CommentType",
    "ApprovalAction",
    # Module 8
    "WorkRequest",
    "WRDocument",
    "WRPriority",
    "WRType",
    "WRStatus",
    "SAPSyncStatus",
    "WRDocumentType",
    # Module 9
    "RBIGuideline",
    "RBIAudit",
    "RBIChecklistItem",
    "RBIException",
    "RBICategory",
    "RBIAuditStatus",
    "RBIChecklistStatus",
    # Module 10
    "Dashboard",
    "ScheduledReport",
    "KPIMetric",
    "DashboardVisibility",
    "ScheduledReportType",
    "MetricTrend",
    # Module 11
    "Escalation",
    "EscalationRule",
    "Notification",
    "SystemError",
    "EntityType",
    "EscalationLevel",
    "EscalationReason",
    "EscalationStatus",
    "NotificationType",
    "ErrorType",
    "ErrorSeverity",
    # Module 12
    "SystemSetting",
    "AuditLog",
    "SystemHealth",
    "SettingType",
    "ServiceName",
    "ServiceStatus",
]
