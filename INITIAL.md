# INITIAL.md - InspectionAgent Product Definition

> Complete inspection process management system for ADNOC UAE - from Annual Planning to RBI Audit & Reporting

---

## PRODUCT

### Name
InspectionAgent

### Description
InspectionAgent is a comprehensive inspection workflow management system designed for ADNOC's internal inspection team. It digitizes and streamlines the complete inspection lifecycle: from annual task planning (AIP), breakdown into quarterly/monthly/work request plans, resource coordination, field execution with data capture, multi-stage quality control reviews (Inspector → Engineering → RBI → Team Leader), SAP Work Request integration, and automated reporting with real-time dashboards. The system ensures RBI (Risk-Based Inspection) compliance, provides escalation workflows, and delivers mobile-first UX for field inspectors.

### Target User
ADNOC Internal Inspection Team
- **Field Inspectors**: Execute inspections, capture data, upload photos
- **Team Leaders**: Oversee operations, assign resources, approve plans
- **Engineering Reviewers**: Technical review of inspection findings
- **RBI Auditors**: Final compliance audit and lock
- **Administrators**: System configuration, user management, reporting

### Type
- [x] Internal Enterprise Application
- [x] Inspection Management System
- [x] Workflow Automation Platform

---

## TECH STACK

### Backend
- [x] FastAPI + Python 3.11+
- [x] SQLAlchemy ORM
- [x] Pydantic for validation
- [x] Alembic for migrations

### Frontend
- [x] React 18 + TypeScript
- [x] Vite (build tool)
- [x] React Router v6
- [x] React Query (TanStack Query)

### Database
- [x] PostgreSQL 15+

### Authentication
- [x] JWT (Access + Refresh tokens)
- [x] Google OAuth 2.0 (Corporate accounts)
- [x] Role-Based Access Control (RBAC)

### UI Framework
- [x] Tailwind CSS
- [x] shadcn/ui components
- [x] Framer Motion (animations)
- [x] Recharts (analytics)
- [x] Lucide Icons

### Additional Tech
- [x] Docker + Docker Compose
- [x] Redis (caching, background tasks)
- [x] Celery (async tasks, notifications)
- [x] AWS S3 / MinIO (file storage)

---

## MODULES

### Module 1: Authentication & User Management (Required)

**Description:** Role-based authentication with Google OAuth integration for ADNOC corporate accounts

**Models:**
- **User**: id, email, hashed_password, full_name, role (inspector|team_leader|engineer|rbi_auditor|admin), department, phone, is_active, is_verified, oauth_provider, avatar_url, created_at, updated_at
- **RefreshToken**: id, user_id, token, expires_at, revoked, created_at
- **UserSession**: id, user_id, ip_address, user_agent, last_activity, created_at

**API Endpoints:**
- POST /api/v1/auth/register - Create new account (admin only)
- POST /api/v1/auth/login - Login with email/password
- POST /api/v1/auth/google - Google OAuth callback
- POST /api/v1/auth/refresh - Refresh access token
- POST /api/v1/auth/logout - Revoke refresh token
- GET /api/v1/auth/me - Get current user profile
- PUT /api/v1/auth/me - Update profile
- GET /api/v1/users - List users (admin only)
- PUT /api/v1/users/{id} - Update user (admin only)
- DELETE /api/v1/users/{id} - Deactivate user (admin only)

**Frontend Pages:**
- /login - Login page with Google OAuth
- /register - Registration page (admin invite only)
- /profile - User profile & settings
- /admin/users - User management (admin only)

**Roles:**
- **Inspector**: Execute inspections, submit reports
- **Team Leader**: Assign tasks, approve plans, oversight
- **Engineer**: Review technical findings, create WRs
- **RBI Auditor**: Final audit, compliance check, lock reports
- **Admin**: Full system access, user management

---

### Module 2: Asset & Equipment Management

**Description:** Centralized database of all inspectable assets/equipment with metadata, location, criticality, and inspection history

**Models:**
- **Asset**: id, asset_code, name, description, asset_type (pressure_vessel|pipeline|tank|valve|heat_exchanger|pump|compressor), location, facility, unit, criticality (low|medium|high|critical), manufacturer, model, serial_number, installation_date, last_inspection_date, next_inspection_due, rbi_category, status (active|inactive|decommissioned), created_at, updated_at, created_by_id
- **AssetDocument**: id, asset_id, document_type (datasheet|drawing|manual|certificate), file_name, file_url, uploaded_by_id, uploaded_at

**API Endpoints:**
- GET /api/v1/assets - List all assets (with filters: type, location, criticality)
- GET /api/v1/assets/{id} - Get asset details
- POST /api/v1/assets - Create new asset (admin/team_leader)
- PUT /api/v1/assets/{id} - Update asset
- DELETE /api/v1/assets/{id} - Delete asset
- GET /api/v1/assets/{id}/history - Get inspection history
- POST /api/v1/assets/{id}/documents - Upload asset document
- GET /api/v1/assets/{id}/documents - List asset documents

**Frontend Pages:**
- /assets - Asset list with advanced filters
- /assets/{id} - Asset detail page with inspection history
- /assets/new - Create new asset form
- /assets/{id}/edit - Edit asset form

---

### Module 3: Annual Inspection Planning (AIP)

**Description:** Create and manage Annual Inspection Plans, breakdown into Quarterly (QIP), Monthly (MIP), and Work Request (WR) plans

**Models:**
- **AnnualPlan (AIP)**: id, year, title, description, status (draft|approved|active|completed), total_inspections, start_date, end_date, created_by_id, approved_by_id, approved_at, created_at, updated_at
- **QuarterlyPlan (QIP)**: id, annual_plan_id, quarter (Q1|Q2|Q3|Q4), title, status (draft|approved|active|completed), total_inspections, start_date, end_date, created_by_id, approved_by_id, approved_at, created_at, updated_at
- **MonthlyPlan (MIP)**: id, quarterly_plan_id, month, title, status (draft|approved|active|completed), total_inspections, start_date, end_date, created_by_id, approved_by_id, approved_at, created_at, updated_at
- **PlannedInspection**: id, annual_plan_id, quarterly_plan_id, monthly_plan_id, asset_id, inspection_type (routine|statutory|rbi|shutdown|emergency), priority (low|medium|high|critical), scheduled_date, estimated_duration_hours, assigned_team_leader_id, status (planned|scheduled|in_progress|completed|cancelled), notes, created_at, updated_at

**API Endpoints:**
- GET /api/v1/plans/annual - List annual plans
- POST /api/v1/plans/annual - Create annual plan
- GET /api/v1/plans/annual/{id} - Get annual plan details
- PUT /api/v1/plans/annual/{id} - Update annual plan
- POST /api/v1/plans/annual/{id}/approve - Approve annual plan
- POST /api/v1/plans/annual/{id}/breakdown - Auto-generate QIP/MIP from AIP
- GET /api/v1/plans/quarterly - List quarterly plans
- POST /api/v1/plans/quarterly - Create quarterly plan
- GET /api/v1/plans/monthly - List monthly plans
- POST /api/v1/plans/monthly - Create monthly plan
- GET /api/v1/plans/inspections - List planned inspections
- PUT /api/v1/plans/inspections/{id} - Update planned inspection

**Frontend Pages:**
- /plans/annual - Annual plans list & calendar view
- /plans/annual/new - Create annual plan wizard
- /plans/annual/{id} - Annual plan detail with breakdown
- /plans/quarterly - Quarterly plans dashboard
- /plans/monthly - Monthly plans calendar
- /plans/inspections - All planned inspections (Gantt/Kanban)

---

### Module 4: Resource Coordination

**Description:** Assign inspectors, manage teams, track availability, coordinate resources for planned inspections

**Models:**
- **Team**: id, name, team_leader_id, department, specialization, is_active, created_at, updated_at
- **TeamMember**: id, team_id, user_id (inspector), role_in_team (lead_inspector|inspector|trainee), joined_at
- **InspectorAssignment**: id, planned_inspection_id, inspector_id, role (primary|secondary|observer), assigned_by_id, assigned_at, status (assigned|accepted|declined|completed)
- **ResourceAvailability**: id, user_id, date, status (available|on_leave|on_site|unavailable), notes

**API Endpoints:**
- GET /api/v1/teams - List all teams
- POST /api/v1/teams - Create team (team_leader/admin)
- GET /api/v1/teams/{id} - Get team details with members
- POST /api/v1/teams/{id}/members - Add team member
- DELETE /api/v1/teams/{id}/members/{user_id} - Remove member
- GET /api/v1/assignments - List inspector assignments
- POST /api/v1/assignments - Assign inspector to inspection
- PUT /api/v1/assignments/{id}/accept - Inspector accepts assignment
- PUT /api/v1/assignments/{id}/decline - Inspector declines
- GET /api/v1/availability/{user_id} - Get inspector availability
- PUT /api/v1/availability - Update availability calendar

**Frontend Pages:**
- /teams - Teams overview with member lists
- /teams/new - Create team form
- /assignments - Assignment board (drag-and-drop)
- /availability - Team availability calendar

---

### Module 5: Inspection Execution & Data Entry

**Description:** Field execution module for inspectors to capture inspection data, findings, photos, measurements, and defects

**Models:**
- **Inspection**: id, planned_inspection_id, asset_id, inspection_type, inspection_date, start_time, end_time, duration_hours, primary_inspector_id, status (not_started|in_progress|completed|on_hold|cancelled), weather_conditions, ambient_temperature, created_at, updated_at
- **InspectionFinding**: id, inspection_id, finding_type (defect|observation|recommendation|ok), severity (low|medium|high|critical), description, location_on_asset, measurement_value, measurement_unit, recommended_action, photos (JSON array), created_at, updated_at
- **InspectionPhoto**: id, inspection_id, finding_id, file_name, file_url, caption, taken_at, uploaded_by_id, uploaded_at
- **InspectionMeasurement**: id, inspection_id, parameter_name, value, unit, min_acceptable, max_acceptable, is_within_range, notes
- **InspectionChecklist**: id, inspection_id, checklist_item, status (pass|fail|na), notes

**API Endpoints:**
- GET /api/v1/inspections - List inspections (with filters)
- GET /api/v1/inspections/{id} - Get inspection details
- POST /api/v1/inspections - Create inspection from planned inspection
- PUT /api/v1/inspections/{id} - Update inspection
- PUT /api/v1/inspections/{id}/start - Start inspection (change status)
- PUT /api/v1/inspections/{id}/complete - Complete inspection
- POST /api/v1/inspections/{id}/findings - Add finding
- PUT /api/v1/inspections/{id}/findings/{finding_id} - Update finding
- DELETE /api/v1/inspections/{id}/findings/{finding_id} - Delete finding
- POST /api/v1/inspections/{id}/photos - Upload photos
- POST /api/v1/inspections/{id}/measurements - Add measurements
- GET /api/v1/inspections/{id}/checklist - Get checklist
- PUT /api/v1/inspections/{id}/checklist - Update checklist items

**Frontend Pages:**
- /inspections - Inspections list (Today, Upcoming, Completed)
- /inspections/{id} - Inspection detail & data entry form
- /inspections/{id}/execute - Mobile-optimized execution screen
- /inspections/{id}/findings - Findings management
- /inspections/{id}/photos - Photo gallery with upload

---

### Module 6: Draft Report & Quality Control

**Description:** Auto-generate draft reports from inspection data, QC review before submission to approval workflow

**Models:**
- **InspectionReport**: id, inspection_id, report_number, report_type (routine|rbi|statutory), version, status (draft|qc_review|submitted|approved|rejected), executive_summary, detailed_findings, recommendations, conclusions, generated_at, generated_by_id, qc_reviewed_by_id, qc_reviewed_at, qc_comments, submitted_at
- **ReportTemplate**: id, name, inspection_type, template_html, variables (JSON), is_active, created_at, updated_at
- **ReportVersion**: id, report_id, version_number, content (JSON), created_by_id, created_at

**API Endpoints:**
- GET /api/v1/reports - List all reports
- GET /api/v1/reports/{id} - Get report details
- POST /api/v1/reports/generate - Auto-generate report from inspection
- PUT /api/v1/reports/{id} - Update report content
- POST /api/v1/reports/{id}/qc-review - Submit for QC review
- PUT /api/v1/reports/{id}/qc-approve - QC approves draft
- PUT /api/v1/reports/{id}/qc-reject - QC rejects with comments
- GET /api/v1/reports/{id}/pdf - Export report as PDF
- GET /api/v1/reports/{id}/versions - Get version history
- GET /api/v1/report-templates - List templates (admin)
- POST /api/v1/report-templates - Create template (admin)

**Frontend Pages:**
- /reports - Reports dashboard
- /reports/{id} - Report viewer/editor
- /reports/{id}/qc - QC review interface
- /reports/{id}/preview - PDF preview
- /admin/report-templates - Template management

---

### Module 7: Multi-Stage Approval Workflow

**Description:** 4-stage approval process: Inspector Review → Engineering Review → RBI Audit → Team Leader Final Approval

**Models:**
- **ApprovalWorkflow**: id, report_id, current_stage (inspector_review|engineering_review|rbi_audit|team_leader_approval), status (pending|approved|rejected|in_revision), created_at, updated_at
- **ApprovalStage**: id, workflow_id, stage_name, stage_order, reviewer_id, status (pending|approved|rejected|revision_requested), comments, reviewed_at, created_at
- **ApprovalComment**: id, stage_id, reviewer_id, comment, comment_type (approval|rejection|question|revision_request), created_at
- **ApprovalHistory**: id, workflow_id, action (submitted|approved|rejected|revision_requested|completed), performed_by_id, stage_name, comments, created_at

**API Endpoints:**
- POST /api/v1/approvals/submit - Submit report to approval workflow
- GET /api/v1/approvals/{workflow_id} - Get workflow status
- GET /api/v1/approvals/pending - Get pending approvals for current user
- PUT /api/v1/approvals/{workflow_id}/approve - Approve current stage
- PUT /api/v1/approvals/{workflow_id}/reject - Reject with comments
- PUT /api/v1/approvals/{workflow_id}/request-revision - Request revisions
- POST /api/v1/approvals/{workflow_id}/comments - Add comment
- GET /api/v1/approvals/{workflow_id}/history - Get approval history
- GET /api/v1/approvals/stats - Get approval metrics (admin)

**Frontend Pages:**
- /approvals - My pending approvals (role-based)
- /approvals/{id} - Approval review interface
- /approvals/{id}/history - Approval timeline
- /approvals/dashboard - Approval metrics (admin)

**Workflow Stages:**
1. **Inspector Review**: Primary inspector verifies draft report accuracy
2. **Engineering Review**: Engineering team reviews technical findings, creates SAP WRs if needed
3. **RBI Audit**: RBI auditor checks compliance with RBI guidelines
4. **Team Leader Approval**: Team leader final sign-off and lock

---

### Module 8: Work Request (WR) Integration

**Description:** Create SAP Work Requests based on inspection findings that require maintenance/repair

**Models:**
- **WorkRequest**: id, inspection_id, finding_id, report_id, wr_number (from SAP), title, description, priority (low|medium|high|critical), wr_type (preventive|corrective|breakdown), asset_id, estimated_cost, status (draft|submitted_to_sap|approved|in_progress|completed|cancelled), created_by_id (engineer), approved_by_id, sap_sync_status (pending|synced|failed), sap_sync_at, sap_error_message, created_at, updated_at
- **WRDocument**: id, wr_id, document_type (estimate|approval|completion_cert), file_name, file_url, uploaded_at

**API Endpoints:**
- GET /api/v1/work-requests - List work requests
- GET /api/v1/work-requests/{id} - Get WR details
- POST /api/v1/work-requests - Create WR from finding
- PUT /api/v1/work-requests/{id} - Update WR
- POST /api/v1/work-requests/{id}/submit-to-sap - Submit to SAP
- GET /api/v1/work-requests/{id}/sync-status - Check SAP sync status
- POST /api/v1/work-requests/{id}/documents - Upload documents

**Frontend Pages:**
- /work-requests - WR list with SAP status
- /work-requests/new - Create WR form
- /work-requests/{id} - WR detail page
- /work-requests/{id}/edit - Edit WR

---

### Module 9: RBI Compliance & Audit

**Description:** RBI (Risk-Based Inspection) guideline compliance tracking, audit checks, final report lock

**Models:**
- **RBIGuideline**: id, guideline_code, title, description, category (integrity|safety|environmental), inspection_frequency, applicable_asset_types (JSON array), checklist_items (JSON), is_active, created_at, updated_at
- **RBIAudit**: id, report_id, auditor_id, audit_date, status (in_progress|passed|failed), overall_score, compliance_percentage, audit_notes, locked_at, created_at, updated_at
- **RBIChecklistItem**: id, audit_id, guideline_id, item_name, status (pass|fail|na), evidence (text/photo), auditor_comments
- **RBIException**: id, report_id, guideline_id, exception_reason, approved_by_id, approved_at

**API Endpoints:**
- GET /api/v1/rbi/guidelines - List RBI guidelines
- GET /api/v1/rbi/guidelines/{id} - Get guideline details
- POST /api/v1/rbi/guidelines - Create guideline (admin)
- GET /api/v1/rbi/audits - List audits
- POST /api/v1/rbi/audits - Start RBI audit for report
- GET /api/v1/rbi/audits/{id} - Get audit details
- PUT /api/v1/rbi/audits/{id}/checklist - Update checklist items
- POST /api/v1/rbi/audits/{id}/complete - Complete audit
- POST /api/v1/rbi/audits/{id}/lock - Lock report (final)
- POST /api/v1/rbi/exceptions - Request exception
- GET /api/v1/rbi/compliance-report - Generate compliance report

**Frontend Pages:**
- /rbi/guidelines - RBI guidelines library
- /rbi/audits - My RBI audits
- /rbi/audits/{id} - Audit review interface
- /rbi/compliance - Compliance dashboard
- /admin/rbi/guidelines - Manage guidelines

---

### Module 10: Automated Reporting & Dashboards

**Description:** Real-time dashboards, KPIs, automated reports, executive summaries for stakeholders

**Models:**
- **Dashboard**: id, name, description, layout (JSON), widgets (JSON), visibility (personal|team|public), created_by_id, created_at, updated_at
- **ScheduledReport**: id, name, report_type (daily|weekly|monthly|quarterly), recipients (JSON array), schedule_cron, last_run_at, next_run_at, is_active, created_by_id
- **KPIMetric**: id, metric_name, metric_value, metric_unit, comparison_period, change_percentage, trend (up|down|stable), calculated_at

**API Endpoints:**
- GET /api/v1/dashboards - List dashboards
- GET /api/v1/dashboards/{id} - Get dashboard with widgets
- POST /api/v1/dashboards - Create custom dashboard
- PUT /api/v1/dashboards/{id} - Update dashboard layout
- GET /api/v1/kpis - Get current KPI metrics
- GET /api/v1/analytics/inspections - Inspection analytics (trends, completion rates)
- GET /api/v1/analytics/assets - Asset analytics (by type, location, criticality)
- GET /api/v1/analytics/findings - Findings analytics (severity distribution)
- GET /api/v1/analytics/performance - Team performance metrics
- GET /api/v1/scheduled-reports - List scheduled reports (admin)
- POST /api/v1/scheduled-reports - Create scheduled report
- POST /api/v1/reports/export - Export custom report (CSV/PDF/Excel)

**Frontend Pages:**
- /dashboard - Main dashboard (role-based default view)
- /dashboards/custom - Custom dashboard builder
- /analytics - Advanced analytics with filters
- /analytics/inspections - Inspection metrics & trends
- /analytics/team-performance - Team KPIs
- /admin/scheduled-reports - Manage scheduled reports

**KPIs to Display:**
- Total inspections (planned vs completed)
- Completion rate (%)
- Average inspection duration
- Findings by severity (Critical, High, Medium, Low)
- Assets by criticality
- Approval workflow bottlenecks
- Overdue inspections
- Work requests status
- Team utilization rate
- RBI compliance score

---

### Module 11: Error Handling & Escalation

**Description:** Automatic escalation for overdue tasks, error tracking, notification system, issue management

**Models:**
- **Escalation**: id, entity_type (inspection|approval|work_request), entity_id, escalation_level (level_1|level_2|level_3), reason (overdue|stuck|critical_finding|compliance_issue), assigned_to_id, escalated_by_id, status (open|in_progress|resolved|closed), resolved_at, created_at, updated_at
- **EscalationRule**: id, rule_name, entity_type, condition (JSON: e.g., overdue_by_days), escalation_level, notify_roles (JSON array), is_active, created_at
- **Notification**: id, user_id, title, message, notification_type (info|warning|error|success), entity_type, entity_id, is_read, read_at, created_at
- **SystemError**: id, error_code, error_message, error_type (validation|integration|system), severity (low|medium|high|critical), context (JSON), user_id, resolved, resolved_at, created_at

**API Endpoints:**
- GET /api/v1/escalations - List escalations
- POST /api/v1/escalations - Create manual escalation
- PUT /api/v1/escalations/{id}/resolve - Resolve escalation
- GET /api/v1/escalations/rules - List escalation rules (admin)
- POST /api/v1/escalations/rules - Create escalation rule
- GET /api/v1/notifications - Get user notifications
- PUT /api/v1/notifications/{id}/read - Mark as read
- PUT /api/v1/notifications/read-all - Mark all as read
- GET /api/v1/errors - List system errors (admin)
- POST /api/v1/errors - Log error
- PUT /api/v1/errors/{id}/resolve - Mark error resolved

**Frontend Pages:**
- /escalations - Escalations dashboard
- /escalations/{id} - Escalation detail
- /notifications - Notification center
- /admin/escalations/rules - Manage escalation rules
- /admin/errors - System error log

**Escalation Triggers:**
- Inspection overdue by 3 days → Level 1 (Team Leader)
- Inspection overdue by 7 days → Level 2 (Department Manager)
- Critical finding not addressed → Immediate escalation
- Approval stuck for 48 hours → Escalate to next level
- RBI compliance failure → Immediate escalation

---

### Module 12: Admin Panel & System Configuration

**Description:** System administration, user management, settings, audit logs, system health monitoring

**Models:**
- **SystemSetting**: id, setting_key, setting_value, setting_type (string|number|boolean|json), description, is_editable, updated_by_id, updated_at
- **AuditLog**: id, user_id, action, entity_type, entity_id, old_value (JSON), new_value (JSON), ip_address, user_agent, created_at
- **SystemHealth**: id, service_name (database|redis|celery|storage), status (healthy|degraded|down), response_time_ms, last_check_at, error_message

**API Endpoints:**
- GET /api/v1/admin/settings - Get all system settings
- PUT /api/v1/admin/settings/{key} - Update setting
- GET /api/v1/admin/audit-logs - Get audit logs (with filters)
- GET /api/v1/admin/health - System health check
- GET /api/v1/admin/stats - Platform statistics (users, inspections, reports)
- POST /api/v1/admin/maintenance-mode - Enable/disable maintenance mode
- GET /api/v1/admin/backup - Trigger database backup
- POST /api/v1/admin/cache/clear - Clear Redis cache

**Frontend Pages:**
- /admin - Admin dashboard
- /admin/users - User management (CRUD)
- /admin/settings - System settings
- /admin/audit-logs - Audit trail viewer
- /admin/health - System health monitor
- /admin/reports - Admin reports & exports

---

## MVP SCOPE

### Must Have (MVP - For ADNOC Demo)
- [x] User authentication with Google OAuth
- [x] Role-based access control (5 roles)
- [x] Asset/Equipment database with details
- [x] Annual Plan (AIP) creation
- [x] Breakdown AIP into QIP/MIP
- [x] Team & resource management
- [x] Inspection execution with data entry
- [x] Photo upload and gallery
- [x] Findings & measurements capture
- [x] Draft report generation
- [x] Multi-stage approval workflow (4 stages)
- [x] Work Request creation
- [x] RBI audit checklist
- [x] Real-time analytics dashboard
- [x] KPI widgets (completion rate, findings, overdue)
- [x] Mobile-responsive UI (critical for field use)
- [x] Admin panel with user management
- [x] Notification system
- [x] Escalation tracking

### Nice to Have (Post-MVP)
- [ ] SAP integration (real-time sync)
- [ ] Advanced report customization
- [ ] Mobile app (iOS/Android native)
- [ ] Offline mode for field inspectors
- [ ] AI-powered finding classification
- [ ] Predictive maintenance recommendations
- [ ] Integration with IoT sensors
- [ ] Multi-language support (Arabic/English)
- [ ] Advanced analytics (ML-based insights)
- [ ] Document OCR and auto-data extraction
- [ ] Voice-to-text for field notes
- [ ] Geolocation tracking for inspectors
- [ ] QR code scanning for assets
- [ ] Blockchain-based audit trail

---

## ACCEPTANCE CRITERIA

### Authentication & Authorization
- [ ] User can register with email/password (admin invite)
- [ ] User can login with Google OAuth (ADNOC accounts)
- [ ] JWT tokens work with 30min expiry + refresh
- [ ] Role-based access enforced on all endpoints
- [ ] Protected routes redirect to login
- [ ] User sessions tracked and manageable

### Asset Management
- [ ] Can create/edit/delete assets
- [ ] Asset list supports filtering by type, location, criticality
- [ ] Asset detail shows full inspection history
- [ ] Can upload asset documents (datasheets, drawings)
- [ ] Search assets by code/name

### Annual Planning (AIP)
- [ ] Can create annual inspection plan
- [ ] Can approve annual plan (team leader)
- [ ] Can auto-breakdown AIP into QIP (4 quarters)
- [ ] Can auto-breakdown QIP into MIP (12 months)
- [ ] Calendar view shows all planned inspections
- [ ] Can assign team leader to planned inspections

### Resource Coordination
- [ ] Can create teams and assign members
- [ ] Can assign inspectors to inspections
- [ ] Inspectors can accept/decline assignments
- [ ] Availability calendar prevents double-booking
- [ ] Dashboard shows team workload

### Inspection Execution
- [ ] Can start inspection from planned inspection
- [ ] Can capture multiple findings with severity
- [ ] Can upload photos with captions
- [ ] Can record measurements with pass/fail
- [ ] Can fill inspection checklist
- [ ] Can complete inspection (changes status)
- [ ] Mobile-optimized execution screen
- [ ] Offline data entry with sync (nice-to-have)

### Draft Report & QC
- [ ] Auto-generate report from inspection data
- [ ] Report includes executive summary, findings, photos
- [ ] Can edit report content before submission
- [ ] QC reviewer can approve or reject draft
- [ ] Can export report as PDF

### Approval Workflow
- [ ] Report submission triggers 4-stage workflow
- [ ] Each stage shows pending approvals to role
- [ ] Reviewer can approve, reject, or request revision
- [ ] Rejection returns report to previous stage
- [ ] Final approval locks the report
- [ ] Approval history shows full timeline

### Work Requests
- [ ] Engineer can create WR from finding
- [ ] WR includes description, priority, estimated cost
- [ ] Can track WR status (draft → submitted → completed)
- [ ] SAP sync status indicator (mock for demo)

### RBI Audit
- [ ] RBI auditor sees checklist from guidelines
- [ ] Can mark each checklist item pass/fail/NA
- [ ] Can add evidence and comments
- [ ] Compliance score calculated automatically
- [ ] Can lock report after audit passed
- [ ] Locked reports cannot be edited

### Analytics Dashboard
- [ ] Dashboard shows KPI cards (8-10 metrics)
- [ ] Charts: Inspections trend, Findings by severity, Asset distribution
- [ ] Filters: Date range, location, team, criticality
- [ ] Real-time updates (WebSocket or polling)
- [ ] Export dashboard data as CSV/Excel

### Admin Panel
- [ ] Admin can create/edit/deactivate users
- [ ] Admin can assign roles
- [ ] Admin can view audit logs
- [ ] Admin can view system health
- [ ] Admin can manage RBI guidelines
- [ ] Admin can configure escalation rules

### Error Handling & Escalation
- [ ] Overdue inspections trigger escalations
- [ ] Critical findings trigger immediate escalation
- [ ] Stuck approvals escalate after 48 hours
- [ ] Notification sent on escalation
- [ ] Can resolve escalation manually

### Quality & Performance
- [ ] All API endpoints documented in OpenAPI (Swagger UI)
- [ ] Backend test coverage 80%+
- [ ] Frontend TypeScript strict mode passes
- [ ] Page load time < 2 seconds
- [ ] Mobile responsive on iOS/Android (375px to 768px)
- [ ] Docker builds and runs successfully
- [ ] No console errors in production build
- [ ] Accessibility: WCAG 2.1 Level AA (keyboard nav, screen reader)

---

## SPECIAL REQUIREMENTS

### Security
- [x] Rate limiting on all endpoints (100 req/min per user)
- [x] Input validation on all endpoints (Pydantic)
- [x] SQL injection prevention (SQLAlchemy ORM)
- [x] XSS prevention (React auto-escaping + DOMPurify)
- [x] CSRF protection for OAuth flow
- [x] Secure file upload (whitelist extensions, virus scan)
- [x] Password hashing with bcrypt
- [x] HTTPS only in production
- [x] Audit logging for sensitive actions
- [x] Role-based access control enforced

### Performance
- [x] Database indexing on frequently queried columns
- [x] Redis caching for dashboard KPIs (5-minute TTL)
- [x] Lazy loading for large lists (pagination)
- [x] Image compression on upload
- [x] CDN for static assets
- [x] Background tasks for report generation (Celery)

### Integrations
- [x] AWS S3 / MinIO for file storage
- [x] Email service for notifications (SendGrid/AWS SES)
- [ ] SAP Work Request API (mock endpoint for demo)
- [x] Google OAuth 2.0 for authentication
- [x] Redis for caching and sessions
- [x] PostgreSQL for relational data

### Demo-Specific Requirements
- [x] **Realistic dummy data**: 50+ assets, 200+ inspections, 30+ users
- [x] **Variety**: Different asset types, locations, findings severities
- [x] **Complete workflows**: Show full lifecycle from planning to final approval
- [x] **Visual appeal**: Professional UI with Tailwind + shadcn/ui
- [x] **Mobile demo**: Responsive design, test on iPad/iPhone
- [x] **Performance**: Fast load times, smooth animations
- [x] **Polished UX**: Loading states, error messages, success toasts
- [x] **Impressive charts**: Use Recharts for analytics
- [x] **Dark mode**: Optional luxury feature for demo

---

## AGENTS

> These 6 specialized agents will build InspectionAgent in parallel:

| Agent | Role | Works On | Deliverables |
|-------|------|----------|--------------|
| **DATABASE-AGENT** | Database architect | All 12 modules' data models | SQLAlchemy models, Alembic migrations, relationships, indexes |
| **BACKEND-AGENT** | API developer | All API endpoints, business logic, services | FastAPI routers, Pydantic schemas, CRUD services, authentication, authorization |
| **FRONTEND-AGENT** | UI/UX developer | All frontend pages, components, state management | React components, pages, hooks, API integration, Tailwind styling, mobile responsiveness |
| **DEVOPS-AGENT** | Infrastructure engineer | Docker, CI/CD, deployment, environments | Dockerfile, docker-compose.yml, GitHub Actions, environment configs, S3/MinIO setup |
| **TEST-AGENT** | QA engineer | Unit tests, integration tests, E2E tests | pytest tests for backend (80% coverage), React Testing Library for frontend, test fixtures |
| **REVIEW-AGENT** | Security & quality auditor | Code review, security audit, performance check | Security audit report, code quality report, performance recommendations, final approval |

### Agent Coordination Flow:
1. **DATABASE-AGENT** creates all models first (dependency for all)
2. **BACKEND-AGENT** builds APIs (depends on DATABASE-AGENT)
3. **FRONTEND-AGENT** builds UI (depends on BACKEND-AGENT for API contracts)
4. **DEVOPS-AGENT** works in parallel after models ready
5. **TEST-AGENT** writes tests as agents complete their modules
6. **REVIEW-AGENT** audits everything at the end before demo

---

## DEMO SCRIPT (For ADNOC Presentation)

### Setup (Pre-Demo):
1. Database seeded with realistic dummy data
2. 5 user accounts ready (one per role)
3. Complete inspection workflow in various stages
4. Dashboard pre-populated with metrics

### Demo Flow (20 minutes):

**Part 1: Planning (4 min)**
- Login as Team Leader (Google OAuth)
- Show Annual Plan dashboard
- Create new Quarterly Plan (Q2 2026)
- Auto-breakdown into Monthly Plans
- Assign resources to inspections

**Part 2: Field Execution (5 min)**
- Switch to Inspector account
- Show mobile view (responsive design)
- Open assigned inspection
- Capture findings with photos
- Record measurements
- Complete inspection

**Part 3: Quality & Approval (5 min)**
- Switch to Engineer account
- Review draft report
- Approve and create Work Request
- Show multi-stage workflow progress
- Switch to RBI Auditor
- Complete RBI checklist
- Lock final report

**Part 4: Analytics & Oversight (4 min)**
- Switch to Team Leader account
- Show main dashboard with KPIs
- Drill into inspection trends
- Show team performance
- Demonstrate escalation alerts

**Part 5: Admin Panel (2 min)**
- Switch to Admin account
- Show user management
- System health monitor
- Audit logs

**Closing:**
- Highlight mobile responsiveness
- Show report PDF export
- Mention future integrations (SAP, IoT)
- Q&A

---

# READY TO BUILD?

## Next Steps:

```bash
# Step 1: Generate PRP (Parallel Runnable Plan)
/generate-prp INITIAL.md

# Step 2: Execute PRP (Runs all 6 agents in parallel)
/execute-prp PRPs/inspection-agent-prp.md

# Step 3: Seed dummy data
python backend/seed_demo_data.py

# Step 4: Run the app
docker-compose up -d

# Step 5: Practice demo script
open http://localhost:5173
```

---

**PROJECT TIMELINE ESTIMATE**: 6 agents working in parallel = ~3-4 weeks for MVP (vs 12+ weeks sequential)

**DEMO READINESS**: MVP will be fully functional with polished UI, realistic data, and impressive analytics for ADNOC presentation.

---

*Generated by InspectionAgent Setup Wizard*
*Last Updated: 2026-01-13*
