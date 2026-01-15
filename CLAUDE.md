# CLAUDE.md - InspectionAgent Project Rules

> Project-specific rules for Claude Code. This file is read automatically in every conversation.

---

## Project Overview

**Project Name:** InspectionAgent
**Description:** Complete inspection workflow management system for ADNOC internal inspection team
**Tech Stack:**
- Backend: FastAPI + Python 3.11+
- Frontend: React 18 + TypeScript + Vite
- Database: PostgreSQL 15+ + SQLAlchemy
- Auth: JWT + Google OAuth 2.0
- UI: Tailwind CSS + shadcn/ui + Framer Motion
- Additional: Redis, Celery, MinIO/S3, Recharts

---

## Project Structure

```
inspection-agent/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app entry
│   │   ├── config.py               # Settings (env vars)
│   │   ├── database.py             # DB session, Base
│   │   ├── models/                 # SQLAlchemy models (12 modules)
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── asset.py
│   │   │   ├── annual_plan.py
│   │   │   ├── team.py
│   │   │   ├── inspection.py
│   │   │   ├── report.py
│   │   │   ├── approval.py
│   │   │   ├── work_request.py
│   │   │   ├── rbi.py
│   │   │   ├── dashboard.py
│   │   │   ├── escalation.py
│   │   │   └── admin.py
│   │   ├── schemas/                # Pydantic schemas
│   │   │   ├── user.py
│   │   │   ├── asset.py
│   │   │   ├── inspection.py
│   │   │   └── ...
│   │   ├── routers/                # API endpoints
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── assets.py
│   │   │   ├── plans.py
│   │   │   ├── teams.py
│   │   │   ├── inspections.py
│   │   │   ├── reports.py
│   │   │   ├── approvals.py
│   │   │   ├── work_requests.py
│   │   │   ├── rbi.py
│   │   │   ├── dashboards.py
│   │   │   ├── escalations.py
│   │   │   └── admin.py
│   │   ├── services/               # Business logic
│   │   │   ├── auth_service.py
│   │   │   ├── inspection_service.py
│   │   │   ├── report_service.py
│   │   │   ├── approval_service.py
│   │   │   ├── rbi_service.py
│   │   │   └── ...
│   │   ├── auth/                   # Auth utilities
│   │   │   ├── jwt.py
│   │   │   ├── oauth.py
│   │   │   ├── dependencies.py     # get_current_user, RoleChecker
│   │   │   └── permissions.py
│   │   ├── utils/                  # Helpers
│   │   │   ├── file_upload.py
│   │   │   ├── pdf_generator.py
│   │   │   ├── cache.py
│   │   │   └── notifications.py
│   │   └── tasks/                  # Celery tasks
│   │       ├── report_generation.py
│   │       ├── escalation.py
│   │       └── notifications.py
│   ├── alembic/                    # DB migrations
│   │   ├── env.py
│   │   └── versions/
│   ├── tests/                      # pytest tests (80%+ coverage)
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_inspections.py
│   │   ├── test_approvals.py
│   │   └── ...
│   ├── seed_demo_data.py           # Demo data seeder
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/             # Reusable components
│   │   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── GoogleOAuthButton.tsx
│   │   │   ├── inspections/
│   │   │   │   ├── InspectionCard.tsx
│   │   │   │   ├── FindingForm.tsx
│   │   │   │   ├── PhotoUpload.tsx
│   │   │   │   └── MeasurementInput.tsx
│   │   │   ├── approvals/
│   │   │   │   ├── ApprovalTimeline.tsx
│   │   │   │   └── ApprovalActions.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── KPICard.tsx
│   │   │   │   ├── InspectionChart.tsx
│   │   │   │   └── FindingsChart.tsx
│   │   │   └── common/
│   │   │       ├── DataTable.tsx
│   │   │       ├── SearchBar.tsx
│   │   │       └── FileUpload.tsx
│   │   ├── pages/                  # Page components
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── ProfilePage.tsx
│   │   │   ├── assets/
│   │   │   │   ├── AssetListPage.tsx
│   │   │   │   ├── AssetDetailPage.tsx
│   │   │   │   └── AssetFormPage.tsx
│   │   │   ├── plans/
│   │   │   │   ├── AnnualPlanPage.tsx
│   │   │   │   ├── QuarterlyPlanPage.tsx
│   │   │   │   └── MonthlyPlanPage.tsx
│   │   │   ├── inspections/
│   │   │   │   ├── InspectionListPage.tsx
│   │   │   │   ├── InspectionDetailPage.tsx
│   │   │   │   └── InspectionExecutePage.tsx
│   │   │   ├── reports/
│   │   │   │   ├── ReportListPage.tsx
│   │   │   │   └── ReportViewerPage.tsx
│   │   │   ├── approvals/
│   │   │   │   └── ApprovalDashboardPage.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── DashboardPage.tsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboardPage.tsx
│   │   │       ├── UserManagementPage.tsx
│   │   │       └── SystemHealthPage.tsx
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useInspection.ts
│   │   │   ├── useApproval.ts
│   │   │   └── useRealtime.ts
│   │   ├── services/               # API client
│   │   │   ├── api.ts              # Axios instance
│   │   │   ├── authService.ts
│   │   │   ├── assetService.ts
│   │   │   ├── inspectionService.ts
│   │   │   ├── reportService.ts
│   │   │   ├── approvalService.ts
│   │   │   └── ...
│   │   ├── context/                # React Context
│   │   │   ├── AuthContext.tsx
│   │   │   └── NotificationContext.tsx
│   │   ├── types/                  # TypeScript types
│   │   │   ├── auth.ts
│   │   │   ├── asset.ts
│   │   │   ├── inspection.ts
│   │   │   ├── approval.ts
│   │   │   └── ...
│   │   ├── utils/                  # Utilities
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   └── constants.ts
│   │   └── lib/                    # shadcn/ui utils
│   │       └── utils.ts
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── .env.example
├── .claude/
│   └── commands/
│       ├── generate-prp.md
│       └── execute-prp.md
├── skills/
│   ├── BACKEND.md
│   ├── FRONTEND.md
│   ├── DATABASE.md
│   ├── TESTING.md
│   └── DEPLOYMENT.md
├── agents/
│   ├── DATABASE-AGENT.md
│   ├── BACKEND-AGENT.md
│   ├── FRONTEND-AGENT.md
│   ├── DEVOPS-AGENT.md
│   ├── TEST-AGENT.md
│   └── REVIEW-AGENT.md
├── PRPs/                           # Generated plans
├── docker-compose.yml
├── .gitignore
├── INITIAL.md
├── CLAUDE.md
└── README.md
```

---

## Code Standards

### Python (Backend)

**Type Hints (Required)**
```python
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.inspection import Inspection
from app.schemas.inspection import InspectionCreate

def get_inspection(db: Session, inspection_id: int) -> Optional[Inspection]:
    """Get inspection by ID."""
    return db.query(Inspection).filter(Inspection.id == inspection_id).first()

def create_inspection(db: Session, data: InspectionCreate, user_id: int) -> Inspection:
    """Create a new inspection."""
    inspection = Inspection(**data.dict(), primary_inspector_id=user_id)
    db.add(inspection)
    db.commit()
    db.refresh(inspection)
    return inspection
```

**Async Endpoints (Required)**
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.auth.dependencies import get_current_user, RoleChecker
from app.models.user import User

router = APIRouter(prefix="/api/v1/inspections", tags=["inspections"])

@router.get("/{inspection_id}", response_model=InspectionResponse)
async def get_inspection(
    inspection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get inspection details."""
    inspection = await inspection_service.get_inspection(db, inspection_id)
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return inspection
```

**Docstrings (Required)**
```python
def approve_report(db: Session, workflow_id: int, reviewer_id: int, comments: str) -> ApprovalWorkflow:
    """
    Approve current stage of approval workflow.

    Args:
        db: Database session
        workflow_id: ID of the approval workflow
        reviewer_id: ID of the reviewer approving
        comments: Optional approval comments

    Returns:
        Updated ApprovalWorkflow object

    Raises:
        HTTPException: If workflow not found or reviewer not authorized
    """
    # Implementation...
```

**Logging (Required - NO print())**
```python
import logging

logger = logging.getLogger(__name__)

def process_inspection_report(inspection_id: int):
    logger.info(f"Processing report for inspection {inspection_id}")
    try:
        # Processing logic
        logger.info(f"Report generated successfully for inspection {inspection_id}")
    except Exception as e:
        logger.error(f"Failed to generate report for inspection {inspection_id}: {str(e)}")
        raise
```

---

### TypeScript (Frontend)

**Interfaces (Required - NO any types)**
```typescript
// types/inspection.ts
export interface Inspection {
  id: number;
  planned_inspection_id: number;
  asset_id: number;
  inspection_type: 'routine' | 'statutory' | 'rbi' | 'shutdown' | 'emergency';
  inspection_date: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  primary_inspector_id: number;
  created_at: string;
  updated_at: string;
}

export interface InspectionFinding {
  id: number;
  inspection_id: number;
  finding_type: 'defect' | 'observation' | 'recommendation' | 'ok';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location_on_asset: string;
  photos: string[];
}

// Component props
interface InspectionCardProps {
  inspection: Inspection;
  onView: (id: number) => void;
  onEdit?: (id: number) => void;
}
```

**Type-Safe API Calls**
```typescript
// services/inspectionService.ts
import { api } from './api';
import type { Inspection, InspectionCreate, InspectionFinding } from '@/types/inspection';

export const inspectionService = {
  getInspections: async (filters?: Record<string, unknown>): Promise<Inspection[]> => {
    const response = await api.get<Inspection[]>('/inspections', { params: filters });
    return response.data;
  },

  getInspection: async (id: number): Promise<Inspection> => {
    const response = await api.get<Inspection>(`/inspections/${id}`);
    return response.data;
  },

  createInspection: async (data: InspectionCreate): Promise<Inspection> => {
    const response = await api.post<Inspection>('/inspections', data);
    return response.data;
  },
};
```

**React Components**
```typescript
// components/inspections/InspectionCard.tsx
import { FC } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Inspection } from '@/types/inspection';

interface InspectionCardProps {
  inspection: Inspection;
  onView: (id: number) => void;
}

export const InspectionCard: FC<InspectionCardProps> = ({ inspection, onView }) => {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onView(inspection.id)}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Inspection #{inspection.id}</span>
          <Badge variant={getStatusVariant(inspection.status)}>{inspection.status}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{inspection.inspection_type}</p>
        <p className="text-xs text-gray-500 mt-2">{new Date(inspection.inspection_date).toLocaleDateString()}</p>
      </CardContent>
    </Card>
  );
};

function getStatusVariant(status: Inspection['status']): 'default' | 'secondary' | 'success' | 'warning' {
  // Implementation
}
```

---

## Forbidden Patterns

### Backend
- ❌ **NEVER** use `print()` - use `logging` module
- ❌ **NEVER** store passwords in plain text - use bcrypt
- ❌ **NEVER** hardcode secrets - use environment variables
- ❌ **NEVER** use `SELECT *` - specify columns
- ❌ **NEVER** skip input validation - use Pydantic schemas
- ❌ **NEVER** expose internal errors to users - use generic messages
- ❌ **NEVER** skip authentication on protected endpoints
- ❌ **NEVER** commit commented-out code

### Frontend
- ❌ **NEVER** use `any` type - define proper interfaces
- ❌ **NEVER** leave `console.log` in production code
- ❌ **NEVER** skip error handling in async operations
- ❌ **NEVER** use inline styles - use Tailwind classes
- ❌ **NEVER** hardcode API URLs - use environment variables
- ❌ **NEVER** skip loading states for async operations
- ❌ **NEVER** ignore TypeScript errors - fix them

---

## Module-Specific Rules

### Authentication & Authorization
- All passwords hashed with bcrypt (min 12 rounds)
- JWT access tokens expire in 30 minutes
- JWT refresh tokens expire in 7 days
- RBAC enforced on ALL endpoints (use `RoleChecker` dependency)
- Roles: `inspector`, `team_leader`, `engineer`, `rbi_auditor`, `admin`
- OAuth state parameter required for CSRF protection

### Inspections
- All inspections must link to a `planned_inspection_id`
- Photos stored in S3/MinIO (not database)
- Max photo size: 10MB
- Allowed photo formats: JPG, PNG, HEIC
- Findings must have severity (low|medium|high|critical)
- Critical findings trigger automatic escalation

### Reports
- Reports auto-generated from inspection data
- Report numbers follow format: `RPT-{YEAR}-{SEQUENCE}`
- PDF generation happens in Celery background task
- Reports locked after final approval (immutable)
- Version history maintained for all edits

### Approvals
- 4-stage workflow: Inspector → Engineer → RBI → Team Leader
- Cannot skip stages
- Rejection returns to previous stage
- Comments required on rejection
- Email notification on each stage change

### Work Requests
- WRs created by Engineers only
- WR numbers from SAP (mock for demo: `WR-{YEAR}-{SEQUENCE}`)
- SAP sync status tracked (pending|synced|failed)
- Priority required: low|medium|high|critical

### RBI Audits
- RBI checklist based on guidelines
- Compliance score auto-calculated (% passed items)
- Report lock only after audit passed
- RBI failures trigger immediate escalation

### Escalations
- Auto-escalation rules:
  - Inspection overdue 3 days → Team Leader
  - Inspection overdue 7 days → Department Manager
  - Critical finding not addressed → Immediate
  - Approval stuck 48 hours → Next level
  - RBI failure → Immediate
- Manual escalation allowed by Team Leaders

---

## API Conventions

### Endpoint Structure
- All endpoints prefixed with `/api/v1/`
- Use plural nouns: `/inspections`, `/assets`, `/reports`
- Use resource IDs in path: `/inspections/{id}`
- Use query params for filters: `/inspections?status=completed&date_from=2026-01-01`

### HTTP Status Codes
- `200 OK` - Successful GET/PUT
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized (role-based)
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Duplicate/constraint violation
- `500 Internal Server Error` - Server error (log details)

### Response Format
```json
// Success
{
  "id": 123,
  "name": "Asset XYZ",
  "status": "active"
}

// List with pagination
{
  "items": [...],
  "total": 150,
  "page": 1,
  "page_size": 20
}

// Error
{
  "detail": "Inspection not found",
  "error_code": "INSPECTION_NOT_FOUND"
}
```

---

## Database Rules

### Models
- All models inherit from `Base`
- Primary key: `id` (Integer, auto-increment)
- Timestamps: `created_at`, `updated_at` (DateTime, auto-managed)
- Foreign keys: `{entity}_id` (e.g., `user_id`, `inspection_id`)
- Enums for status fields (use SQLAlchemy Enum)
- JSON fields for flexible data (use `JSONB` in PostgreSQL)
- Soft deletes where needed (add `deleted_at` column)

### Relationships
```python
# One-to-Many
class Inspection(Base):
    __tablename__ = "inspections"
    findings = relationship("InspectionFinding", back_populates="inspection")

class InspectionFinding(Base):
    __tablename__ = "inspection_findings"
    inspection_id = Column(Integer, ForeignKey("inspections.id"))
    inspection = relationship("Inspection", back_populates="findings")
```

### Indexes (CRITICAL for Performance)
```python
class Inspection(Base):
    __tablename__ = "inspections"

    # Indexes for frequent queries
    __table_args__ = (
        Index('idx_inspection_status', 'status'),
        Index('idx_inspection_date', 'inspection_date'),
        Index('idx_inspection_asset', 'asset_id'),
        Index('idx_inspection_inspector', 'primary_inspector_id'),
    )
```

---

## Security Requirements

### Authentication
- Passwords: bcrypt with 12 rounds minimum
- JWT secret: 256-bit random key (env var)
- HTTPS only in production
- Rate limiting: 100 requests/minute per user
- Session tracking (IP, user agent, last activity)

### Authorization
```python
from app.auth.dependencies import RoleChecker

# Endpoint requires specific roles
@router.post("/inspections/{id}/approve")
async def approve_inspection(
    current_user: User = Depends(RoleChecker(allowed_roles=["team_leader", "admin"]))
):
    # Only team_leader and admin can approve
    pass
```

### Input Validation
- All inputs validated by Pydantic schemas
- SQL injection prevented by SQLAlchemy ORM (no raw SQL)
- XSS prevented by React auto-escaping + DOMPurify for user HTML
- File uploads: whitelist extensions, max size, virus scan (ClamAV)

### Audit Logging
- Log sensitive actions: login, user creation, approval, report lock
- Store: user_id, action, entity_type, entity_id, old_value, new_value, IP, timestamp
- Immutable audit logs (no updates/deletes)

---

## Performance Optimization

### Backend
- Database connection pooling (SQLAlchemy default)
- Redis caching for dashboard KPIs (5-minute TTL)
- Celery for background tasks (report generation, emails, escalations)
- Pagination for list endpoints (default 20 items/page)
- Eager loading for relationships (avoid N+1 queries)
```python
# ❌ BAD (N+1 query)
inspections = db.query(Inspection).all()
for inspection in inspections:
    print(inspection.asset.name)  # Triggers separate query

# ✅ GOOD (single query with join)
inspections = db.query(Inspection).options(joinedload(Inspection.asset)).all()
```

### Frontend
- Code splitting (React.lazy + Suspense)
- Image lazy loading
- Debounce search inputs (300ms)
- React Query for caching API responses (5-minute stale time)
- Memoization for expensive calculations (useMemo, React.memo)

---

## Mobile Responsiveness

### Breakpoints (Tailwind)
```typescript
// Mobile-first approach
sm: '640px',   // Small devices
md: '768px',   // Tablets
lg: '1024px',  // Laptops
xl: '1280px',  // Desktops
2xl: '1536px'  // Large desktops
```

### Critical Mobile Views
- **Inspection Execution**: Full-screen mobile mode, large buttons, photo upload
- **Dashboard**: Stack cards vertically on mobile
- **Tables**: Horizontal scroll or card view on mobile
- **Forms**: Single column layout, touch-friendly inputs

```tsx
// Responsive example
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 col on mobile, 2 on tablet, 3 on desktop */}
</div>
```

---

## Demo Data Requirements

### Seed Data Script (`seed_demo_data.py`)
- **Users**: 30 users (5 roles distributed)
  - 10 Inspectors
  - 5 Team Leaders
  - 5 Engineers
  - 5 RBI Auditors
  - 5 Admins
- **Assets**: 50+ assets
  - Variety: Pressure vessels, pipelines, tanks, pumps, heat exchangers
  - Locations: Abu Dhabi, Dubai, Sharjah facilities
  - Criticality: Distributed (10% critical, 30% high, 40% medium, 20% low)
- **Inspections**: 200+ inspections
  - Statuses: Mix of completed, in_progress, planned
  - 50% with findings (varied severity)
  - 30% with photos
- **Workflows**: Complete approval workflows in various stages
- **Work Requests**: 20+ WRs with different statuses

### Realistic Data
- Use faker library for names, emails, dates
- Industry-appropriate asset names (e.g., "Heat Exchanger HX-101")
- Realistic finding descriptions (corrosion, leaks, wear)
- Varied measurements (pressure, temperature, thickness)

---

## Environment Variables

### Backend `.env`
```env
# Database
DATABASE_URL=postgresql://inspection_user:password@localhost:5432/inspection_agent

# Auth
SECRET_KEY=your-256-bit-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback

# Redis
REDIS_URL=redis://localhost:6379/0

# Celery
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# Storage (MinIO/S3)
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=inspection-agent

# Email (SendGrid/SES)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@inspectionagent.adnoc.ae

# App
ENVIRONMENT=development
DEBUG=true
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_APP_NAME=InspectionAgent
VITE_ENVIRONMENT=development
```

---

## Development Commands

### Backend
```bash
# Setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Database
alembic upgrade head
python seed_demo_data.py

# Run
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Tests
pytest tests/ -v --cov=app --cov-report=html

# Linting
ruff check app/
ruff format app/
```

### Frontend
```bash
# Setup
cd frontend
npm install

# Run
npm run dev

# Build
npm run build
npm run preview

# Tests
npm test
npm run test:coverage

# Linting
npm run lint
npm run type-check
```

### Docker
```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild
docker-compose up -d --build

# Stop
docker-compose down

# Reset (WARNING: deletes data)
docker-compose down -v
```

---

## Git Commit Message Format

```
<type>(<module>): <short description>

<optional longer description>

<optional footer>
```

**Types:**
- `feat`: New feature (e.g., `feat(inspections): add photo upload`)
- `fix`: Bug fix (e.g., `fix(approvals): correct workflow stage transition`)
- `refactor`: Code refactoring (e.g., `refactor(auth): extract jwt logic`)
- `test`: Add/update tests (e.g., `test(inspections): add finding creation tests`)
- `docs`: Documentation (e.g., `docs(readme): update setup instructions`)
- `style`: Code style (e.g., `style(backend): format with ruff`)
- `chore`: Maintenance (e.g., `chore(deps): update fastapi to 0.115.0`)
- `perf`: Performance (e.g., `perf(dashboard): add redis caching`)

**Modules:** auth, users, assets, plans, teams, inspections, reports, approvals, work-requests, rbi, dashboards, escalations, admin

---

## Skills Reference

| Task | Skill File | Description |
|------|-----------|-------------|
| Database models & migrations | `skills/DATABASE.md` | SQLAlchemy models, Alembic migrations, relationships |
| API development & auth | `skills/BACKEND.md` | FastAPI routers, Pydantic schemas, JWT, OAuth |
| React components & UI | `skills/FRONTEND.md` | React components, hooks, Tailwind, shadcn/ui |
| Testing | `skills/TESTING.md` | pytest, React Testing Library, fixtures |
| Docker & deployment | `skills/DEPLOYMENT.md` | Dockerfile, docker-compose, CI/CD, environments |

---

## Agents Coordination

For complex tasks, 6 specialized agents work in parallel:

| Agent | Role | Reads Skills | Works On |
|-------|------|--------------|----------|
| **DATABASE-AGENT** | Database architect | DATABASE.md | All 12 modules' SQLAlchemy models, migrations, indexes |
| **BACKEND-AGENT** | API developer | BACKEND.md | All API endpoints, services, auth, business logic |
| **FRONTEND-AGENT** | UI/UX developer | FRONTEND.md | All pages, components, hooks, state management |
| **DEVOPS-AGENT** | Infrastructure engineer | DEPLOYMENT.md | Docker, docker-compose, CI/CD, environments |
| **TEST-AGENT** | QA engineer | TESTING.md | Unit tests, integration tests, fixtures (80%+ coverage) |
| **REVIEW-AGENT** | Security & quality auditor | ALL | Code review, security audit, performance check |

**Coordination Flow:**
1. DATABASE-AGENT creates models (blocking dependency)
2. BACKEND-AGENT builds APIs (depends on models)
3. FRONTEND-AGENT builds UI (depends on API contracts)
4. DEVOPS-AGENT works in parallel
5. TEST-AGENT writes tests as modules complete
6. REVIEW-AGENT audits at the end

---

## Quality Checklist

Before considering any module complete:

### Backend
- [ ] All endpoints have type hints
- [ ] All functions have docstrings
- [ ] Pydantic schemas for validation
- [ ] Role-based access control enforced
- [ ] Tests cover 80%+ of code
- [ ] No `print()` statements
- [ ] Logging configured
- [ ] OpenAPI docs generated (Swagger UI at /docs)
- [ ] Database indexes on foreign keys and filtered columns

### Frontend
- [ ] No `any` types
- [ ] All props interfaces defined
- [ ] Error boundaries implemented
- [ ] Loading states for async operations
- [ ] Mobile responsive (test 375px, 768px, 1024px)
- [ ] No `console.log` in production
- [ ] TypeScript strict mode passes
- [ ] Accessibility: keyboard nav, ARIA labels

### General
- [ ] Environment variables documented in .env.example
- [ ] Docker builds successfully
- [ ] README updated with setup instructions
- [ ] Commit messages follow format
- [ ] No secrets in code

---

**Last Updated:** 2026-01-13
**Project Status:** Setup Complete - Ready for PRP Generation
