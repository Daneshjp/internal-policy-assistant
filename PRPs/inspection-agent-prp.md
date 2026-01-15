# PRP: InspectionAgent

> Implementation blueprint for parallel agent execution - Complete inspection workflow management system for ADNOC

---

## METADATA

| Field | Value |
|-------|-------|
| **Product** | InspectionAgent |
| **Type** | Internal Enterprise Application / Inspection Management System |
| **Version** | 1.0 |
| **Created** | 2026-01-13 |
| **Complexity** | **HIGH** (12 modules, 100+ endpoints, 50+ pages) |
| **Agents Required** | 6 (DATABASE, BACKEND, FRONTEND, DEVOPS, TEST, REVIEW) |
| **Estimated Duration** | 3-4 weeks (parallel execution) |

---

## PRODUCT OVERVIEW

**Description:**
InspectionAgent is a comprehensive inspection workflow management system for ADNOC's internal inspection team. It digitizes the complete inspection lifecycle: annual planning (AIP) with breakdown into quarterly/monthly plans, resource coordination, mobile-optimized field execution with photo capture, multi-stage approval workflow (Inspector → Engineer → RBI → Team Leader), Work Request creation, RBI compliance auditing, real-time analytics dashboards, and automated escalation system.

**Value Proposition:**
- **For Field Inspectors**: Mobile-first data entry, photo upload, offline-capable (future)
- **For Team Leaders**: Complete visibility, resource optimization, automated escalations
- **For Engineers**: Streamlined review, Work Request creation, technical analysis
- **For RBI Auditors**: Compliance tracking, audit checklists, final report lock
- **For Admins**: System oversight, user management, audit logs, health monitoring
- **For ADNOC Leadership**: Real-time dashboards, KPIs, compliance reporting

**MVP Scope (For ADNOC Demo):**
- [x] User authentication with Google OAuth
- [x] Role-based access control (5 roles)
- [x] Asset/Equipment database
- [x] Annual Plan (AIP) creation & QIP/MIP breakdown
- [x] Team & resource management
- [x] Mobile-responsive inspection execution with photo upload
- [x] Findings & measurements capture
- [x] Draft report auto-generation
- [x] 4-stage approval workflow
- [x] Work Request creation (mock SAP integration)
- [x] RBI audit checklist
- [x] Real-time analytics dashboard with 10+ KPIs
- [x] Admin panel
- [x] Notification & escalation system
- [x] Demo data seeder (200+ inspections, 50+ assets, 30 users)

---

## TECH STACK

| Layer | Technology | Skill Reference | Notes |
|-------|------------|-----------------|-------|
| Backend | FastAPI + Python 3.11+ | skills/BACKEND.md | Async endpoints, Pydantic validation |
| Frontend | React 18 + TypeScript + Vite | skills/FRONTEND.md | Strict type checking, mobile-first |
| Database | PostgreSQL 15+ + SQLAlchemy | skills/DATABASE.md | JSONB fields, indexing strategy |
| Auth | JWT + Google OAuth 2.0 + RBAC | skills/BACKEND.md | 5 roles, 30min tokens |
| UI | Tailwind CSS + shadcn/ui | skills/FRONTEND.md | Mobile-responsive, dark mode ready |
| Charts | Recharts | skills/FRONTEND.md | Dashboard analytics |
| Animations | Framer Motion | skills/FRONTEND.md | Polished UX |
| Icons | Lucide React | skills/FRONTEND.md | Modern icon library |
| State | React Query (TanStack) | skills/FRONTEND.md | API caching, optimistic updates |
| Storage | MinIO / AWS S3 | skills/DEPLOYMENT.md | Photo uploads, documents |
| Cache | Redis | skills/DEPLOYMENT.md | Dashboard KPIs, sessions |
| Tasks | Celery | skills/DEPLOYMENT.md | Report generation, escalations |
| Email | SendGrid / AWS SES | skills/DEPLOYMENT.md | Notifications |
| Testing (BE) | pytest + pytest-cov | skills/TESTING.md | 80%+ coverage target |
| Testing (FE) | Vitest + React Testing Library | skills/TESTING.md | Component & integration tests |
| Deployment | Docker + docker-compose | skills/DEPLOYMENT.md | PostgreSQL, Redis, MinIO, Celery |

---

## DATABASE MODELS (34 models across 12 modules)

### Module 1: Authentication & User Management
- **User**: id, email, hashed_password, full_name, role (inspector|team_leader|engineer|rbi_auditor|admin), department, phone, is_active, is_verified, oauth_provider, avatar_url, created_at, updated_at
- **RefreshToken**: id, user_id (FK), token, expires_at, revoked, created_at
- **UserSession**: id, user_id (FK), ip_address, user_agent, last_activity, created_at

### Module 2: Asset & Equipment Management
- **Asset**: id, asset_code, name, description, asset_type (enum), location, facility, unit, criticality (enum), manufacturer, model, serial_number, installation_date, last_inspection_date, next_inspection_due, rbi_category, status (enum), created_at, updated_at, created_by_id (FK)
- **AssetDocument**: id, asset_id (FK), document_type (enum), file_name, file_url, uploaded_by_id (FK), uploaded_at

### Module 3: Annual Inspection Planning
- **AnnualPlan**: id, year, title, description, status (enum), total_inspections, start_date, end_date, created_by_id (FK), approved_by_id (FK), approved_at, created_at, updated_at
- **QuarterlyPlan**: id, annual_plan_id (FK), quarter (enum), title, status (enum), total_inspections, start_date, end_date, created_by_id (FK), approved_by_id (FK), approved_at, created_at, updated_at
- **MonthlyPlan**: id, quarterly_plan_id (FK), month, title, status (enum), total_inspections, start_date, end_date, created_by_id (FK), approved_by_id (FK), approved_at, created_at, updated_at
- **PlannedInspection**: id, annual_plan_id (FK), quarterly_plan_id (FK), monthly_plan_id (FK), asset_id (FK), inspection_type (enum), priority (enum), scheduled_date, estimated_duration_hours, assigned_team_leader_id (FK), status (enum), notes, created_at, updated_at

### Module 4: Resource Coordination
- **Team**: id, name, team_leader_id (FK), department, specialization, is_active, created_at, updated_at
- **TeamMember**: id, team_id (FK), user_id (FK), role_in_team (enum), joined_at
- **InspectorAssignment**: id, planned_inspection_id (FK), inspector_id (FK), role (enum), assigned_by_id (FK), assigned_at, status (enum)
- **ResourceAvailability**: id, user_id (FK), date, status (enum), notes

### Module 5: Inspection Execution & Data Entry
- **Inspection**: id, planned_inspection_id (FK), asset_id (FK), inspection_type (enum), inspection_date, start_time, end_time, duration_hours, primary_inspector_id (FK), status (enum), weather_conditions, ambient_temperature, created_at, updated_at
- **InspectionFinding**: id, inspection_id (FK), finding_type (enum), severity (enum), description (text), location_on_asset, measurement_value, measurement_unit, recommended_action (text), photos (JSONB), created_at, updated_at
- **InspectionPhoto**: id, inspection_id (FK), finding_id (FK nullable), file_name, file_url, caption, taken_at, uploaded_by_id (FK), uploaded_at
- **InspectionMeasurement**: id, inspection_id (FK), parameter_name, value, unit, min_acceptable, max_acceptable, is_within_range (bool), notes
- **InspectionChecklist**: id, inspection_id (FK), checklist_item, status (enum), notes

### Module 6: Draft Report & Quality Control
- **InspectionReport**: id, inspection_id (FK), report_number, report_type (enum), version, status (enum), executive_summary (text), detailed_findings (text), recommendations (text), conclusions (text), generated_at, generated_by_id (FK), qc_reviewed_by_id (FK), qc_reviewed_at, qc_comments (text), submitted_at
- **ReportTemplate**: id, name, inspection_type (enum), template_html (text), variables (JSONB), is_active, created_at, updated_at
- **ReportVersion**: id, report_id (FK), version_number, content (JSONB), created_by_id (FK), created_at

### Module 7: Multi-Stage Approval Workflow
- **ApprovalWorkflow**: id, report_id (FK), current_stage (enum), status (enum), created_at, updated_at
- **ApprovalStage**: id, workflow_id (FK), stage_name, stage_order, reviewer_id (FK), status (enum), comments (text), reviewed_at, created_at
- **ApprovalComment**: id, stage_id (FK), reviewer_id (FK), comment (text), comment_type (enum), created_at
- **ApprovalHistory**: id, workflow_id (FK), action (enum), performed_by_id (FK), stage_name, comments (text), created_at

### Module 8: Work Request Integration
- **WorkRequest**: id, inspection_id (FK), finding_id (FK), report_id (FK), wr_number, title, description (text), priority (enum), wr_type (enum), asset_id (FK), estimated_cost (decimal), status (enum), created_by_id (FK), approved_by_id (FK), sap_sync_status (enum), sap_sync_at, sap_error_message, created_at, updated_at
- **WRDocument**: id, wr_id (FK), document_type (enum), file_name, file_url, uploaded_at

### Module 9: RBI Compliance & Audit
- **RBIGuideline**: id, guideline_code, title, description (text), category (enum), inspection_frequency, applicable_asset_types (JSONB), checklist_items (JSONB), is_active, created_at, updated_at
- **RBIAudit**: id, report_id (FK), auditor_id (FK), audit_date, status (enum), overall_score, compliance_percentage (decimal), audit_notes (text), locked_at, created_at, updated_at
- **RBIChecklistItem**: id, audit_id (FK), guideline_id (FK), item_name, status (enum), evidence (text), auditor_comments (text)
- **RBIException**: id, report_id (FK), guideline_id (FK), exception_reason (text), approved_by_id (FK), approved_at

### Module 10: Automated Reporting & Dashboards
- **Dashboard**: id, name, description, layout (JSONB), widgets (JSONB), visibility (enum), created_by_id (FK), created_at, updated_at
- **ScheduledReport**: id, name, report_type (enum), recipients (JSONB), schedule_cron, last_run_at, next_run_at, is_active, created_by_id (FK)
- **KPIMetric**: id, metric_name, metric_value, metric_unit, comparison_period, change_percentage (decimal), trend (enum), calculated_at

### Module 11: Error Handling & Escalation
- **Escalation**: id, entity_type (enum), entity_id, escalation_level (enum), reason (enum), assigned_to_id (FK), escalated_by_id (FK), status (enum), resolved_at, created_at, updated_at
- **EscalationRule**: id, rule_name, entity_type (enum), condition (JSONB), escalation_level (enum), notify_roles (JSONB), is_active, created_at
- **Notification**: id, user_id (FK), title, message (text), notification_type (enum), entity_type, entity_id, is_read, read_at, created_at
- **SystemError**: id, error_code, error_message (text), error_type (enum), severity (enum), context (JSONB), user_id (FK), resolved, resolved_at, created_at

### Module 12: Admin Panel & System Configuration
- **SystemSetting**: id, setting_key (unique), setting_value, setting_type (enum), description, is_editable, updated_by_id (FK), updated_at
- **AuditLog**: id, user_id (FK), action, entity_type, entity_id, old_value (JSONB), new_value (JSONB), ip_address, user_agent, created_at (immutable)
- **SystemHealth**: id, service_name (enum), status (enum), response_time_ms, last_check_at, error_message

---

## MODULES BREAKDOWN

### Module 1: Authentication & User Management

**Agents:** DATABASE-AGENT + BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| POST | /api/v1/auth/register | Create account (admin invite) | admin |
| POST | /api/v1/auth/login | Email/password login | public |
| POST | /api/v1/auth/google | Google OAuth callback | public |
| POST | /api/v1/auth/refresh | Refresh JWT tokens | authenticated |
| POST | /api/v1/auth/logout | Revoke refresh token | authenticated |
| GET | /api/v1/auth/me | Get current user profile | authenticated |
| PUT | /api/v1/auth/me | Update own profile | authenticated |
| GET | /api/v1/users | List all users | admin |
| GET | /api/v1/users/{id} | Get user details | admin |
| PUT | /api/v1/users/{id} | Update user (role, department) | admin |
| DELETE | /api/v1/users/{id} | Deactivate user | admin |

**Frontend Pages:**
| Route | Component | Protected | Role |
|-------|-----------|-----------|------|
| /login | LoginPage | No | - |
| /register | RegisterPage | No | - |
| /profile | ProfilePage | Yes | all |
| /admin/users | UserManagementPage | Yes | admin |

**Key Features:**
- bcrypt password hashing (12 rounds)
- JWT access tokens (30min expiry)
- JWT refresh tokens (7 days expiry)
- Google OAuth 2.0 integration
- Role-based access control (5 roles)
- Session tracking
- User avatar upload

---

### Module 2: Asset & Equipment Management

**Agents:** DATABASE-AGENT + BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| GET | /api/v1/assets | List all assets (paginated, filtered) | all |
| GET | /api/v1/assets/{id} | Get asset details | all |
| POST | /api/v1/assets | Create new asset | team_leader, admin |
| PUT | /api/v1/assets/{id} | Update asset | team_leader, admin |
| DELETE | /api/v1/assets/{id} | Delete asset | admin |
| GET | /api/v1/assets/{id}/history | Get inspection history for asset | all |
| POST | /api/v1/assets/{id}/documents | Upload asset document | team_leader, engineer, admin |
| GET | /api/v1/assets/{id}/documents | List asset documents | all |
| DELETE | /api/v1/assets/{id}/documents/{doc_id} | Delete document | admin |

**Frontend Pages:**
| Route | Component | Protected | Role |
|-------|-----------|-----------|------|
| /assets | AssetListPage | Yes | all |
| /assets/new | AssetFormPage | Yes | team_leader, admin |
| /assets/{id} | AssetDetailPage | Yes | all |
| /assets/{id}/edit | AssetFormPage (edit mode) | Yes | team_leader, admin |

**Key Features:**
- Advanced filtering (type, location, criticality, status)
- Search by asset code or name
- Inspection history timeline
- Document management (datasheets, drawings, manuals)
- Asset criticality matrix
- Next inspection due dates

---

### Module 3: Annual Inspection Planning (AIP)

**Agents:** DATABASE-AGENT + BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| GET | /api/v1/plans/annual | List annual plans | all |
| POST | /api/v1/plans/annual | Create annual plan | team_leader, admin |
| GET | /api/v1/plans/annual/{id} | Get annual plan details | all |
| PUT | /api/v1/plans/annual/{id} | Update annual plan | team_leader, admin |
| POST | /api/v1/plans/annual/{id}/approve | Approve annual plan | team_leader, admin |
| POST | /api/v1/plans/annual/{id}/breakdown | Auto-generate QIP/MIP | team_leader, admin |
| GET | /api/v1/plans/quarterly | List quarterly plans | all |
| POST | /api/v1/plans/quarterly | Create quarterly plan | team_leader, admin |
| GET | /api/v1/plans/quarterly/{id} | Get quarterly plan | all |
| GET | /api/v1/plans/monthly | List monthly plans | all |
| POST | /api/v1/plans/monthly | Create monthly plan | team_leader, admin |
| GET | /api/v1/plans/monthly/{id} | Get monthly plan | all |
| GET | /api/v1/plans/inspections | List planned inspections | all |
| GET | /api/v1/plans/inspections/{id} | Get planned inspection | all |
| PUT | /api/v1/plans/inspections/{id} | Update planned inspection | team_leader, admin |

**Frontend Pages:**
| Route | Component | Protected | Role |
|-------|-----------|-----------|------|
| /plans/annual | AnnualPlanPage | Yes | all |
| /plans/annual/new | AnnualPlanWizard | Yes | team_leader, admin |
| /plans/annual/{id} | AnnualPlanDetailPage | Yes | all |
| /plans/quarterly | QuarterlyPlanPage | Yes | all |
| /plans/monthly | MonthlyPlanPage | Yes | all |
| /plans/inspections | PlannedInspectionsPage | Yes | all |

**Key Features:**
- Annual plan creation wizard
- Auto-breakdown: AIP → 4 QIPs → 12 MIPs
- Calendar view (month, quarter, year)
- Drag-and-drop inspection scheduling
- Gantt chart for planned inspections
- Resource conflict detection

---

### Module 4: Resource Coordination

**Agents:** DATABASE-AGENT + BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| GET | /api/v1/teams | List all teams | all |
| POST | /api/v1/teams | Create team | team_leader, admin |
| GET | /api/v1/teams/{id} | Get team details with members | all |
| PUT | /api/v1/teams/{id} | Update team | team_leader, admin |
| POST | /api/v1/teams/{id}/members | Add team member | team_leader, admin |
| DELETE | /api/v1/teams/{id}/members/{user_id} | Remove member | team_leader, admin |
| GET | /api/v1/assignments | List inspector assignments | all |
| POST | /api/v1/assignments | Assign inspector to inspection | team_leader, admin |
| PUT | /api/v1/assignments/{id}/accept | Inspector accepts assignment | inspector |
| PUT | /api/v1/assignments/{id}/decline | Inspector declines (with reason) | inspector |
| GET | /api/v1/availability/{user_id} | Get inspector availability | all |
| PUT | /api/v1/availability | Update own availability | inspector |

**Frontend Pages:**
| Route | Component | Protected | Role |
|-------|-----------|-----------|------|
| /teams | TeamsPage | Yes | all |
| /teams/new | TeamFormPage | Yes | team_leader, admin |
| /teams/{id} | TeamDetailPage | Yes | all |
| /assignments | AssignmentBoard | Yes | all |
| /availability | AvailabilityCalendar | Yes | all |

**Key Features:**
- Team management (create, assign members, specializations)
- Drag-and-drop assignment board
- Inspector availability calendar
- Double-booking prevention
- Team workload visualization
- Assignment acceptance/decline workflow

---

### Module 5: Inspection Execution & Data Entry

**Agents:** DATABASE-AGENT + BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| GET | /api/v1/inspections | List inspections (filtered) | all |
| GET | /api/v1/inspections/{id} | Get inspection details | all |
| POST | /api/v1/inspections | Create inspection from planned | inspector |
| PUT | /api/v1/inspections/{id} | Update inspection | inspector |
| PUT | /api/v1/inspections/{id}/start | Start inspection | inspector |
| PUT | /api/v1/inspections/{id}/complete | Complete inspection | inspector |
| POST | /api/v1/inspections/{id}/findings | Add finding | inspector |
| PUT | /api/v1/inspections/{id}/findings/{finding_id} | Update finding | inspector |
| DELETE | /api/v1/inspections/{id}/findings/{finding_id} | Delete finding | inspector |
| POST | /api/v1/inspections/{id}/photos | Upload photos (multipart) | inspector |
| DELETE | /api/v1/inspections/{id}/photos/{photo_id} | Delete photo | inspector |
| POST | /api/v1/inspections/{id}/measurements | Add measurements | inspector |
| PUT | /api/v1/inspections/{id}/measurements/{m_id} | Update measurement | inspector |
| GET | /api/v1/inspections/{id}/checklist | Get checklist | inspector |
| PUT | /api/v1/inspections/{id}/checklist | Update checklist items | inspector |

**Frontend Pages:**
| Route | Component | Protected | Role |
|-------|-----------|-----------|------|
| /inspections | InspectionListPage | Yes | all |
| /inspections/{id} | InspectionDetailPage | Yes | all |
| /inspections/{id}/execute | InspectionExecutePage (mobile) | Yes | inspector |
| /inspections/{id}/findings | FindingsPage | Yes | all |
| /inspections/{id}/photos | PhotoGalleryPage | Yes | all |

**Key Features:**
- Mobile-optimized execution screen (375px - 768px)
- Photo upload (JPG, PNG, HEIC, max 10MB)
- Image compression before upload
- Findings with severity levels
- Measurements with pass/fail auto-detection
- Checklist with pass/fail/NA
- Weather conditions & ambient temperature
- Auto-save draft data (localStorage)

---

### Module 6: Draft Report & Quality Control

**Agents:** DATABASE-AGENT + BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| GET | /api/v1/reports | List all reports | all |
| GET | /api/v1/reports/{id} | Get report details | all |
| POST | /api/v1/reports/generate | Auto-generate report from inspection | inspector |
| PUT | /api/v1/reports/{id} | Update report content | inspector (draft only) |
| POST | /api/v1/reports/{id}/qc-review | Submit for QC review | inspector |
| PUT | /api/v1/reports/{id}/qc-approve | QC approves draft | team_leader |
| PUT | /api/v1/reports/{id}/qc-reject | QC rejects with comments | team_leader |
| GET | /api/v1/reports/{id}/pdf | Export report as PDF | all |
| GET | /api/v1/reports/{id}/versions | Get version history | all |
| GET | /api/v1/report-templates | List templates | admin |
| POST | /api/v1/report-templates | Create template | admin |
| PUT | /api/v1/report-templates/{id} | Update template | admin |

**Frontend Pages:**
| Route | Component | Protected | Role |
|-------|-----------|-----------|------|
| /reports | ReportsPage | Yes | all |
| /reports/{id} | ReportViewerPage | Yes | all |
| /reports/{id}/edit | ReportEditorPage | Yes | inspector |
| /reports/{id}/qc | QCReviewPage | Yes | team_leader |
| /reports/{id}/preview | PDFPreviewPage | Yes | all |
| /admin/report-templates | TemplateManagementPage | Yes | admin |

**Key Features:**
- Auto-generation from inspection data
- Rich text editor (Tiptap or similar)
- Report number format: RPT-{YEAR}-{SEQUENCE}
- Version history
- QC review workflow
- PDF export (Celery background task)
- Templates for different inspection types

---

### Module 7: Multi-Stage Approval Workflow

**Agents:** DATABASE-AGENT + BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| POST | /api/v1/approvals/submit | Submit report to approval workflow | inspector |
| GET | /api/v1/approvals/{workflow_id} | Get workflow status | all |
| GET | /api/v1/approvals/pending | Get my pending approvals | reviewer roles |
| PUT | /api/v1/approvals/{workflow_id}/approve | Approve current stage | reviewer roles |
| PUT | /api/v1/approvals/{workflow_id}/reject | Reject with comments | reviewer roles |
| PUT | /api/v1/approvals/{workflow_id}/request-revision | Request revisions | reviewer roles |
| POST | /api/v1/approvals/{workflow_id}/comments | Add comment | reviewer roles |
| GET | /api/v1/approvals/{workflow_id}/history | Get approval history | all |
| GET | /api/v1/approvals/stats | Get approval metrics | admin |

**Frontend Pages:**
| Route | Component | Protected | Role |
|-------|-----------|-----------|------|
| /approvals | ApprovalDashboardPage | Yes | all |
| /approvals/{id} | ApprovalReviewPage | Yes | reviewer roles |
| /approvals/{id}/history | ApprovalTimelinePage | Yes | all |
| /approvals/dashboard | ApprovalMetricsPage | Yes | admin |

**Key Features:**
- 4-stage workflow: Inspector → Engineer → RBI → Team Leader
- Cannot skip stages
- Email notifications on stage change
- Comments with attachments
- Approval history timeline
- Stuck workflow detection (48 hours)
- Auto-escalation

**Workflow Stages:**
1. **Inspector Review** (inspector role)
2. **Engineering Review** (engineer role) - can create WRs
3. **RBI Audit** (rbi_auditor role) - compliance check
4. **Team Leader Approval** (team_leader role) - final lock

---

### Module 8: Work Request (WR) Integration

**Agents:** DATABASE-AGENT + BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| GET | /api/v1/work-requests | List work requests | all |
| GET | /api/v1/work-requests/{id} | Get WR details | all |
| POST | /api/v1/work-requests | Create WR from finding | engineer |
| PUT | /api/v1/work-requests/{id} | Update WR | engineer |
| DELETE | /api/v1/work-requests/{id} | Delete WR (draft only) | engineer |
| POST | /api/v1/work-requests/{id}/submit-to-sap | Submit to SAP (mock) | engineer |
| GET | /api/v1/work-requests/{id}/sync-status | Check SAP sync status | all |
| POST | /api/v1/work-requests/{id}/documents | Upload WR documents | engineer |

**Frontend Pages:**
| Route | Component | Protected | Role |
|-------|-----------|-----------|------|
| /work-requests | WorkRequestListPage | Yes | all |
| /work-requests/new | WorkRequestFormPage | Yes | engineer |
| /work-requests/{id} | WorkRequestDetailPage | Yes | all |
| /work-requests/{id}/edit | WorkRequestFormPage | Yes | engineer |

**Key Features:**
- WR number format: WR-{YEAR}-{SEQUENCE}
- SAP sync status: pending|synced|failed (mock)
- Priority levels: low|medium|high|critical
- WR types: preventive|corrective|breakdown
- Estimated cost tracking
- Document attachments
- Mock SAP integration endpoint

---

### Module 9: RBI Compliance & Audit

**Agents:** DATABASE-AGENT + BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| GET | /api/v1/rbi/guidelines | List RBI guidelines | all |
| GET | /api/v1/rbi/guidelines/{id} | Get guideline details | all |
| POST | /api/v1/rbi/guidelines | Create guideline | admin |
| PUT | /api/v1/rbi/guidelines/{id} | Update guideline | admin |
| DELETE | /api/v1/rbi/guidelines/{id} | Delete guideline | admin |
| GET | /api/v1/rbi/audits | List audits | rbi_auditor, admin |
| POST | /api/v1/rbi/audits | Start RBI audit for report | rbi_auditor |
| GET | /api/v1/rbi/audits/{id} | Get audit details | all |
| PUT | /api/v1/rbi/audits/{id}/checklist | Update checklist items | rbi_auditor |
| POST | /api/v1/rbi/audits/{id}/complete | Complete audit | rbi_auditor |
| POST | /api/v1/rbi/audits/{id}/lock | Lock report (final) | rbi_auditor |
| POST | /api/v1/rbi/exceptions | Request exception | engineer, rbi_auditor |
| GET | /api/v1/rbi/compliance-report | Generate compliance report | admin |

**Frontend Pages:**
| Route | Component | Protected | Role |
|-------|-----------|-----------|------|
| /rbi/guidelines | RBIGuidelinesPage | Yes | all |
| /rbi/audits | RBIAuditsPage | Yes | rbi_auditor, admin |
| /rbi/audits/{id} | RBIAuditReviewPage | Yes | rbi_auditor |
| /rbi/compliance | ComplianceDashboardPage | Yes | admin |
| /admin/rbi/guidelines | RBIGuidelineManagementPage | Yes | admin |

**Key Features:**
- RBI guideline library
- Checklist auto-population from guidelines
- Pass/fail/NA status for each item
- Evidence upload (text + photos)
- Compliance score calculation (% passed)
- Report lock mechanism (immutable after lock)
- Exception handling workflow
- Compliance reporting

---

### Module 10: Automated Reporting & Dashboards

**Agents:** DATABASE-AGENT + BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| GET | /api/v1/dashboards | List dashboards | all |
| GET | /api/v1/dashboards/{id} | Get dashboard with widgets | all |
| POST | /api/v1/dashboards | Create custom dashboard | all |
| PUT | /api/v1/dashboards/{id} | Update dashboard layout | creator |
| DELETE | /api/v1/dashboards/{id} | Delete dashboard | creator |
| GET | /api/v1/kpis | Get current KPI metrics (cached) | all |
| GET | /api/v1/analytics/inspections | Inspection analytics | all |
| GET | /api/v1/analytics/assets | Asset analytics | all |
| GET | /api/v1/analytics/findings | Findings analytics | all |
| GET | /api/v1/analytics/performance | Team performance metrics | team_leader, admin |
| GET | /api/v1/scheduled-reports | List scheduled reports | admin |
| POST | /api/v1/scheduled-reports | Create scheduled report | admin |
| DELETE | /api/v1/scheduled-reports/{id} | Delete scheduled report | admin |
| POST | /api/v1/reports/export | Export custom report | all |

**Frontend Pages:**
| Route | Component | Protected | Role |
|-------|-----------|-----------|------|
| /dashboard | DashboardPage (role-based) | Yes | all |
| /dashboards/custom | DashboardBuilderPage | Yes | all |
| /analytics | AdvancedAnalyticsPage | Yes | all |
| /analytics/inspections | InspectionMetricsPage | Yes | all |
| /analytics/team-performance | TeamPerformancePage | Yes | team_leader, admin |
| /admin/scheduled-reports | ScheduledReportsPage | Yes | admin |

**Key Features:**
- Real-time KPI cards (10+ metrics)
- Recharts visualizations
- Redis caching (5-minute TTL)
- Filters: date range, location, team, criticality
- Export: CSV, Excel, PDF
- Custom dashboard builder (drag-and-drop widgets)
- Scheduled reports (email delivery)

**KPIs:**
1. Total inspections (planned vs completed)
2. Completion rate (%)
3. Average inspection duration
4. Findings by severity (pie chart)
5. Assets by criticality (bar chart)
6. Approval workflow bottlenecks
7. Overdue inspections count
8. Work requests status (donut chart)
9. Team utilization rate
10. RBI compliance score

---

### Module 11: Error Handling & Escalation

**Agents:** DATABASE-AGENT + BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| GET | /api/v1/escalations | List escalations | all |
| GET | /api/v1/escalations/{id} | Get escalation details | all |
| POST | /api/v1/escalations | Create manual escalation | team_leader, admin |
| PUT | /api/v1/escalations/{id}/resolve | Resolve escalation | assigned user |
| PUT | /api/v1/escalations/{id}/reassign | Reassign escalation | team_leader, admin |
| GET | /api/v1/escalations/rules | List escalation rules | admin |
| POST | /api/v1/escalations/rules | Create escalation rule | admin |
| PUT | /api/v1/escalations/rules/{id} | Update rule | admin |
| DELETE | /api/v1/escalations/rules/{id} | Delete rule | admin |
| GET | /api/v1/notifications | Get user notifications | authenticated |
| PUT | /api/v1/notifications/{id}/read | Mark notification as read | authenticated |
| PUT | /api/v1/notifications/read-all | Mark all as read | authenticated |
| GET | /api/v1/errors | List system errors | admin |
| PUT | /api/v1/errors/{id}/resolve | Mark error resolved | admin |

**Frontend Pages:**
| Route | Component | Protected | Role |
|-------|-----------|-----------|------|
| /escalations | EscalationsPage | Yes | all |
| /escalations/{id} | EscalationDetailPage | Yes | all |
| /notifications | NotificationCenterPage | Yes | all |
| /admin/escalations/rules | EscalationRulesPage | Yes | admin |
| /admin/errors | SystemErrorLogPage | Yes | admin |

**Key Features:**
- Auto-escalation Celery tasks (every 1 hour)
- Notification bell icon with unread count
- Real-time notifications (WebSocket or polling)
- Email notifications
- Escalation levels: level_1, level_2, level_3
- Escalation reasons: overdue, stuck, critical_finding, compliance_issue

**Auto-Escalation Rules:**
1. Inspection overdue 3 days → Level 1 (Team Leader)
2. Inspection overdue 7 days → Level 2 (Department Manager)
3. Critical finding not addressed → Immediate escalation
4. Approval stuck 48 hours → Escalate to next level
5. RBI compliance failure → Immediate escalation

---

### Module 12: Admin Panel & System Configuration

**Agents:** DATABASE-AGENT + BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| GET | /api/v1/admin/settings | Get all system settings | admin |
| PUT | /api/v1/admin/settings/{key} | Update setting | admin |
| GET | /api/v1/admin/audit-logs | Get audit logs (filtered) | admin |
| GET | /api/v1/admin/health | System health check | admin |
| GET | /api/v1/admin/stats | Platform statistics | admin |
| POST | /api/v1/admin/maintenance-mode | Enable/disable maintenance | admin |
| GET | /api/v1/admin/backup | Trigger database backup | admin |
| POST | /api/v1/admin/cache/clear | Clear Redis cache | admin |

**Frontend Pages:**
| Route | Component | Protected | Role |
|-------|-----------|-----------|------|
| /admin | AdminDashboardPage | Yes | admin |
| /admin/users | UserManagementPage | Yes | admin |
| /admin/settings | SystemSettingsPage | Yes | admin |
| /admin/audit-logs | AuditLogViewerPage | Yes | admin |
| /admin/health | SystemHealthMonitorPage | Yes | admin |
| /admin/reports | AdminReportsPage | Yes | admin |

**Key Features:**
- System settings (editable/non-editable)
- Audit log viewer with filters
- System health monitoring (database, Redis, Celery, storage)
- Platform statistics (users, inspections, reports)
- Maintenance mode toggle
- Database backup trigger
- Cache management

---

## PHASE EXECUTION PLAN

### Phase 1: Foundation (4 agents in parallel)

**Duration:** 1-2 days

**DATABASE-AGENT:**
- Task: Create all 34 SQLAlchemy models across 12 modules
- Files:
  - backend/app/models/__init__.py
  - backend/app/models/user.py
  - backend/app/models/asset.py
  - backend/app/models/annual_plan.py
  - backend/app/models/team.py
  - backend/app/models/inspection.py
  - backend/app/models/report.py
  - backend/app/models/approval.py
  - backend/app/models/work_request.py
  - backend/app/models/rbi.py
  - backend/app/models/dashboard.py
  - backend/app/models/escalation.py
  - backend/app/models/admin.py
- Tasks:
  - Define all enums
  - Add relationships
  - Add indexes (see CLAUDE.md)
  - Create database.py (Base, get_db)
  - Create config.py (settings from env)
  - Generate initial Alembic migration
- Validation:
  - alembic upgrade head
  - No errors

**BACKEND-AGENT:**
- Task: Setup FastAPI project structure
- Files:
  - backend/app/main.py (FastAPI app, CORS, exception handlers)
  - backend/requirements.txt (all dependencies)
  - backend/.env.example
  - backend/alembic.ini
  - backend/alembic/env.py (configured for async)
- Validation:
  - pip install -r requirements.txt
  - alembic check
  - uvicorn app.main:app --reload (starts without errors)

**FRONTEND-AGENT:**
- Task: Setup React + Vite project with TypeScript
- Files:
  - frontend/package.json (all dependencies)
  - frontend/tsconfig.json (strict mode)
  - frontend/vite.config.ts
  - frontend/tailwind.config.js
  - frontend/postcss.config.js
  - frontend/.env.example
  - frontend/src/main.tsx
  - frontend/src/App.tsx
  - frontend/src/lib/utils.ts (shadcn/ui utils)
  - frontend/src/components/ui/* (install shadcn/ui components: button, card, input, etc.)
- Validation:
  - npm install
  - npm run type-check
  - npm run dev (starts without errors)

**DEVOPS-AGENT:**
- Task: Setup Docker, docker-compose, environment configs
- Files:
  - docker-compose.yml (postgres, redis, minio, backend, frontend, celery)
  - backend/Dockerfile
  - frontend/Dockerfile
  - .dockerignore
  - .gitignore
  - nginx.conf (for production)
- Services:
  - PostgreSQL 15
  - Redis 7
  - MinIO (S3-compatible storage)
  - Celery worker + Celery beat
- Validation:
  - docker-compose config
  - docker-compose up -d
  - All services healthy

**Validation Gate 1:**
```bash
# Database
cd backend && alembic upgrade head

# Backend
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload

# Frontend
cd frontend && npm install && npm run dev

# Docker
docker-compose config && docker-compose up -d

# Check health
curl localhost:8000/health
curl localhost:5173
```

---

### Phase 2: Backend Development (Sequential per module, ~12 days)

**Duration:** 10-14 days

**BACKEND-AGENT:**

**Module Order (respecting dependencies):**
1. Authentication & User Management (blocking all others)
2. Asset & Equipment Management
3. Annual Inspection Planning
4. Resource Coordination
5. Inspection Execution & Data Entry
6. Draft Report & Quality Control
7. Multi-Stage Approval Workflow
8. Work Request Integration
9. RBI Compliance & Audit
10. Automated Reporting & Dashboards
11. Error Handling & Escalation
12. Admin Panel & System Configuration

**For Each Module:**
- Create Pydantic schemas (request, response)
- Create FastAPI router
- Create service layer (business logic)
- Create auth dependencies (RoleChecker)
- Add to main.py router
- Update OpenAPI tags

**Example for Module 1 (Auth):**
- backend/app/schemas/user.py
- backend/app/schemas/auth.py
- backend/app/routers/auth.py
- backend/app/routers/users.py
- backend/app/services/auth_service.py
- backend/app/auth/jwt.py
- backend/app/auth/oauth.py
- backend/app/auth/dependencies.py
- backend/app/auth/permissions.py
- backend/app/utils/password.py

**Validation Gate 2 (after each module):**
```bash
# Lint
ruff check backend/app/routers/
ruff check backend/app/services/

# Type check
mypy backend/app/routers/
mypy backend/app/services/

# Start server
uvicorn app.main:app --reload

# Check OpenAPI docs
open http://localhost:8000/docs
```

---

### Phase 3: Frontend Development (Sequential per module, ~12 days)

**Duration:** 10-14 days

**FRONTEND-AGENT:**

**Module Order (matches backend):**
1. Authentication & User Management
2. Asset & Equipment Management
3. Annual Inspection Planning
4. Resource Coordination
5. Inspection Execution & Data Entry
6. Draft Report & Quality Control
7. Multi-Stage Approval Workflow
8. Work Request Integration
9. RBI Compliance & Audit
10. Automated Reporting & Dashboards
11. Error Handling & Escalation
12. Admin Panel & System Configuration

**For Each Module:**
- Create TypeScript types
- Create API service functions (axios)
- Create React Query hooks
- Create page components
- Create reusable components
- Add routes to App.tsx
- Implement protected routes
- Mobile responsiveness testing

**Example for Module 1 (Auth):**
- frontend/src/types/auth.ts
- frontend/src/types/user.ts
- frontend/src/services/api.ts (axios instance)
- frontend/src/services/authService.ts
- frontend/src/services/userService.ts
- frontend/src/context/AuthContext.tsx
- frontend/src/hooks/useAuth.ts
- frontend/src/pages/auth/LoginPage.tsx
- frontend/src/pages/auth/RegisterPage.tsx
- frontend/src/pages/auth/ProfilePage.tsx
- frontend/src/pages/admin/UserManagementPage.tsx
- frontend/src/components/auth/LoginForm.tsx
- frontend/src/components/auth/GoogleOAuthButton.tsx
- frontend/src/components/layout/AppLayout.tsx
- frontend/src/components/layout/Navbar.tsx
- frontend/src/components/layout/Sidebar.tsx
- frontend/src/components/layout/ProtectedRoute.tsx

**Validation Gate 3 (after each module):**
```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Test
npm run dev
```

---

### Phase 4: Testing & Quality (2 agents in parallel, ~5 days)

**Duration:** 4-6 days

**TEST-AGENT:**

**Backend Testing:**
- Create pytest fixtures (conftest.py)
- Create test database setup
- Write unit tests for services
- Write integration tests for API endpoints
- Aim for 80%+ coverage

**Files:**
- backend/tests/conftest.py
- backend/tests/test_auth.py
- backend/tests/test_users.py
- backend/tests/test_assets.py
- backend/tests/test_inspections.py
- backend/tests/test_reports.py
- backend/tests/test_approvals.py
- backend/tests/test_work_requests.py
- backend/tests/test_rbi.py
- backend/tests/test_escalations.py
- backend/tests/test_admin.py

**Frontend Testing:**
- Setup Vitest + React Testing Library
- Write component tests
- Write integration tests
- Mock API calls

**Files:**
- frontend/src/tests/setup.ts
- frontend/src/tests/components/*.test.tsx
- frontend/src/tests/pages/*.test.tsx
- frontend/src/tests/hooks/*.test.tsx

**REVIEW-AGENT:**

**Security Audit:**
- Check authentication & authorization
- Check input validation
- Check SQL injection prevention
- Check XSS prevention
- Check CSRF protection
- Check rate limiting
- Check audit logging
- Check password hashing
- Check JWT configuration

**Code Quality:**
- Check code organization
- Check naming conventions
- Check type hints (backend)
- Check TypeScript types (frontend)
- Check docstrings
- Check error handling
- Check logging

**Performance:**
- Check database queries (N+1)
- Check caching strategy
- Check pagination
- Check image optimization
- Check code splitting

**Validation Gate 4:**
```bash
# Backend tests
cd backend && pytest tests/ -v --cov=app --cov-report=html --cov-fail-under=80

# Frontend tests
cd frontend && npm test && npm run test:coverage

# Security check
bandit -r backend/app/

# Final build
docker-compose build
docker-compose up -d
docker-compose ps  # All services healthy
```

---

### Phase 5: Demo Data & Final Polish (~3 days)

**Duration:** 2-3 days

**BACKEND-AGENT + DATABASE-AGENT:**

**Demo Data Seeder:**
- File: backend/seed_demo_data.py
- Use faker library
- Create realistic data:
  - 30 users (5 roles distributed)
  - 50+ assets (various types, locations, criticality)
  - 200+ inspections (various statuses)
  - 100+ findings (varied severity)
  - 50+ reports (various stages)
  - 20+ approval workflows (various stages)
  - 20+ work requests
  - 10+ RBI audits
  - 5+ escalations
  - 1000+ audit logs
- Industry-appropriate names (e.g., "Heat Exchanger HX-101")
- Realistic finding descriptions
- Photos (placeholder or stock images)

**FRONTEND-AGENT:**

**UI Polish:**
- Add loading states
- Add error boundaries
- Add success toasts
- Add animations (Framer Motion)
- Responsive testing (375px, 768px, 1024px)
- Dark mode (optional)
- Accessibility (keyboard nav, ARIA labels)
- Performance optimization (React.memo, useMemo)

**Validation Gate 5:**
```bash
# Seed data
cd backend && python seed_demo_data.py

# Verify data
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM assets;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM inspections;"

# Final test
docker-compose up -d
open http://localhost:5173
# Manual testing of all workflows
```

---

## VALIDATION GATES

| Gate | Stage | Commands | Success Criteria |
|------|-------|----------|------------------|
| Gate 1 | Foundation Complete | `alembic upgrade head`, `docker-compose up -d`, `curl localhost:8000/health`, `curl localhost:5173` | All services running, DB migrated, API responds, Frontend loads |
| Gate 2 | Backend Module Complete | `ruff check backend/`, `mypy backend/`, `curl localhost:8000/docs` | No lint errors, type check passes, OpenAPI docs show endpoints |
| Gate 3 | Frontend Module Complete | `npm run type-check`, `npm run lint`, `npm run build` | Type check passes, no lint errors, build succeeds |
| Gate 4 | Testing Complete | `pytest --cov-fail-under=80`, `npm test`, `docker-compose build` | 80%+ coverage, all tests pass, Docker builds |
| Gate 5 | Demo Ready | `python seed_demo_data.py`, Manual testing | Realistic data loaded, all workflows functional |
| Final | Production Ready | `docker-compose up -d`, Health checks, Load testing | All services healthy, API responsive, UI performant |

---

## ENVIRONMENT VARIABLES

### Backend `.env`
```env
# Database
DATABASE_URL=postgresql://inspection_user:SecurePassword123@postgres:5432/inspection_agent

# Auth
SECRET_KEY=<256-bit-random-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback

# Redis
REDIS_URL=redis://redis:6379/0

# Celery
CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/2

# Storage (MinIO)
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=inspection-agent

# Email
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=<sendgrid-api-key>
EMAIL_FROM=noreply@inspectionagent.adnoc.ae

# App
ENVIRONMENT=development
DEBUG=true
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_APP_NAME=InspectionAgent
VITE_ENVIRONMENT=development
```

---

## AGENT COORDINATION MATRIX

| Agent | Depends On | Blocks | Works In Parallel With | Skill Files |
|-------|-----------|--------|------------------------|-------------|
| DATABASE-AGENT | - | BACKEND-AGENT | DEVOPS-AGENT, FRONTEND-AGENT (setup only) | DATABASE.md |
| BACKEND-AGENT | DATABASE-AGENT | FRONTEND-AGENT | DEVOPS-AGENT | BACKEND.md |
| FRONTEND-AGENT | BACKEND-AGENT (API contracts) | - | DEVOPS-AGENT | FRONTEND.md |
| DEVOPS-AGENT | - | - | All (after Phase 1) | DEPLOYMENT.md |
| TEST-AGENT | BACKEND-AGENT, FRONTEND-AGENT | - | REVIEW-AGENT | TESTING.md |
| REVIEW-AGENT | All code complete | - | TEST-AGENT | All skills |

---

## COMPLEXITY BREAKDOWN

**Total Deliverables:**
- **Models**: 34 (SQLAlchemy)
- **API Endpoints**: ~110
- **Frontend Pages**: ~50
- **Components**: ~80
- **Tests**: 200+ (target 80%+ coverage)
- **Files**: ~300

**Estimated Lines of Code:**
- Backend: ~15,000 lines
- Frontend: ~20,000 lines
- Tests: ~10,000 lines
- **Total**: ~45,000 lines

**Complexity Factors:**
- 12 interconnected modules
- 5 user roles with different permissions
- Multi-stage approval workflow
- Real-time dashboards
- Mobile-responsive UI
- File uploads (photos, documents)
- Background tasks (Celery)
- Caching layer (Redis)
- Mock SAP integration

---

## QUALITY REQUIREMENTS

### Backend
- [x] All endpoints have type hints
- [x] All functions have docstrings
- [x] Pydantic schemas for all requests/responses
- [x] Role-based access control on all protected endpoints
- [x] 80%+ test coverage
- [x] No `print()` statements (use logging)
- [x] OpenAPI documentation complete
- [x] Database indexes on foreign keys and filtered columns
- [x] SQL injection prevention (SQLAlchemy ORM)
- [x] Rate limiting (100 req/min per user)

### Frontend
- [x] No `any` types (TypeScript strict mode)
- [x] All props interfaces defined
- [x] Error boundaries implemented
- [x] Loading states for all async operations
- [x] Mobile responsive (375px - 768px - 1024px)
- [x] No `console.log` in production
- [x] Accessibility (keyboard nav, ARIA labels, WCAG 2.1 Level AA)
- [x] XSS prevention (React auto-escaping + DOMPurify)
- [x] Code splitting (React.lazy + Suspense)

### General
- [x] Environment variables documented
- [x] Docker builds successfully
- [x] README with setup instructions
- [x] Git commit messages follow format
- [x] No secrets in code
- [x] Audit logging for sensitive actions

---

## NEXT STEP

Execute this PRP with parallel agents:

```bash
/execute-prp PRPs/inspection-agent-prp.md
```

This will:
1. Dispatch tasks to 6 specialized agents
2. Execute phases sequentially (with parallel work within phases)
3. Run validation gates after each phase
4. Generate final report

**Expected Timeline:**
- Phase 1: 1-2 days
- Phase 2: 10-14 days
- Phase 3: 10-14 days
- Phase 4: 4-6 days
- Phase 5: 2-3 days
- **Total: 27-39 days (~3-4 weeks with parallel execution)**

**Comparison:**
- Sequential development: 12+ weeks
- **Parallel with 6 agents: 3-4 weeks (70% faster)**

---

## DEMO READINESS CHECKLIST

Before ADNOC presentation:

- [ ] All 12 modules functional
- [ ] 200+ inspections with varied data
- [ ] 50+ assets with complete metadata
- [ ] 30 users across 5 roles
- [ ] Complete workflow examples (planning → execution → approval → lock)
- [ ] Mobile view tested on iPad/iPhone
- [ ] Dashboard with live KPIs
- [ ] No console errors
- [ ] Fast page load times (<2 seconds)
- [ ] Professional UI (Tailwind + shadcn/ui)
- [ ] Smooth animations (Framer Motion)
- [ ] Impressive charts (Recharts)
- [ ] Demo script practiced (20-minute presentation)

---

*Generated by PRP Generator for InspectionAgent*
*Ready for parallel execution with 6 specialized agents*
*Estimated delivery: 3-4 weeks from start*
