# InspectionAgent - ADNOC Inspection Workflow Management System

> Complete inspection workflow management system for ADNOC internal inspection team

---

## Overview

InspectionAgent is a comprehensive web application designed to streamline inspection workflows for ADNOC's internal inspection team. It provides digital inspection execution, automated report generation, multi-stage approvals, RBI audits, and work request management.

## Features

- **Digital Inspection Execution**: Mobile-friendly inspection forms with photo uploads, measurements, and findings
- **Automated Report Generation**: PDF reports auto-generated from inspection data
- **Multi-Stage Approvals**: 4-stage approval workflow (Inspector → Engineer → RBI → Team Leader)
- **RBI Audits**: Risk-based inspection compliance audits with scoring
- **Work Request Management**: Integration with SAP for work request creation
- **Dashboard & Analytics**: Real-time KPIs, charts, and progress tracking
- **Role-Based Access Control**: 5 roles with granular permissions
- **Google OAuth**: Seamless authentication for ADNOC users
- **Real-time Notifications**: Email notifications for escalations and approvals

---

## Tech Stack

- **Backend**: FastAPI + Python 3.11+
- **Frontend**: React 18 + TypeScript + Vite
- **Database**: PostgreSQL 15+ + SQLAlchemy
- **Cache**: Redis
- **Task Queue**: Celery + Redis
- **Storage**: MinIO (S3-compatible)
- **Auth**: JWT + Google OAuth 2.0
- **UI**: Tailwind CSS + shadcn/ui + Framer Motion
- **Charts**: Recharts
- **Deployment**: Docker + Docker Compose

---

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Git

For local development without Docker:
- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- MinIO (or AWS S3)

---

## Quick Start (Docker)

### 1. Clone the Repository

```bash
git clone <repository-url> inspection-agent
cd inspection-agent
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
# At minimum, update:
# - SECRET_KEY (generate with: python -c "import secrets; print(secrets.token_urlsafe(32))")
# - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (from Google Cloud Console)
nano .env
```

### 3. Start All Services

```bash
# Start all services (postgres, redis, minio, backend, frontend, celery)
make up

# Or using docker-compose directly
docker-compose up -d
```

### 4. Run Database Migrations

```bash
make migrate

# Or using docker-compose directly
docker-compose exec backend alembic upgrade head
```

### 5. Seed Demo Data (Optional)

```bash
make seed

# Or using docker-compose directly
docker-compose exec backend python seed_demo_data.py
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)

---

## Development Mode

For development with hot reload, adminer, and mailhog:

```bash
# Start in development mode
make dev

# This starts additional services:
# - Adminer (Database UI): http://localhost:8080
# - MailHog (Email testing): http://localhost:8025
```

---

## Project Structure

```
inspection-agent/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py            # FastAPI app entry
│   │   ├── config.py          # Settings (env vars)
│   │   ├── database.py        # DB session, Base
│   │   ├── models/            # SQLAlchemy models (12 modules)
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── routers/           # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── auth/              # Authentication & authorization
│   │   ├── utils/             # Helpers (file upload, PDF, cache)
│   │   └── tasks/             # Celery tasks
│   ├── alembic/               # Database migrations
│   ├── tests/                 # pytest tests
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── requirements.txt
│   └── seed_demo_data.py      # Demo data seeder
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API client
│   │   ├── context/           # React Context
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utilities
│   ├── public/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── nginx.conf             # Nginx config for production
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── skills/                     # Development skills/patterns
│   ├── BACKEND.md
│   ├── FRONTEND.md
│   ├── DATABASE.md
│   ├── TESTING.md
│   └── DEPLOYMENT.md
│
├── agents/                     # Agent definitions
│   ├── DATABASE-AGENT.md
│   ├── BACKEND-AGENT.md
│   ├── FRONTEND-AGENT.md
│   ├── DEVOPS-AGENT.md
│   ├── TEST-AGENT.md
│   └── REVIEW-AGENT.md
│
├── .claude/                    # Claude Code commands
│   └── commands/
│       ├── generate-prp.md
│       └── execute-prp.md
│
├── PRPs/                       # Generated implementation plans
├── docker-compose.yml          # Production compose
├── docker-compose.dev.yml      # Development overrides
├── Makefile                    # Convenience commands
├── .env.example                # Example environment variables
├── .gitignore
├── INITIAL.md                  # Product definition
├── CLAUDE.md                   # Project rules
└── README.md                   # This file
```

---

## Architecture

### Backend Services

- **Backend API** (Port 8000): FastAPI REST API
- **Celery Worker**: Background task processing (report generation, emails)
- **Celery Beat**: Scheduled tasks (escalations, reminders)

### Frontend

- **Development** (Port 5173): Vite dev server with hot reload
- **Production** (Port 80): Nginx serving static build + proxying API

### Infrastructure

- **PostgreSQL** (Port 5432): Primary database
- **Redis** (Port 6379): Cache and message broker
- **MinIO** (Ports 9000, 9001): S3-compatible object storage

---

## Database Schema

### Core Models (12 modules)

1. **User**: System users with roles
2. **Asset**: Equipment/assets to be inspected
3. **Annual Plan**: Yearly inspection planning
4. **Team**: Inspection teams
5. **Inspection**: Individual inspection records
6. **Report**: Generated inspection reports
7. **Approval**: Multi-stage approval workflows
8. **Work Request**: SAP work requests
9. **RBI**: Risk-based inspection audits
10. **Dashboard**: Dashboard KPIs and metrics
11. **Escalation**: Automated escalation rules
12. **Admin**: System administration

---

## User Roles & Permissions

| Role | Permissions |
|------|------------|
| **Inspector** | Execute inspections, add findings, submit reports |
| **Team Leader** | Approve reports (final stage), manage teams, view dashboards |
| **Engineer** | Approve reports (2nd stage), create work requests |
| **RBI Auditor** | Perform RBI audits, approve reports (3rd stage) |
| **Admin** | Full system access, user management, system settings |

---

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - Login with JWT
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/google` - Google OAuth login
- `GET /api/v1/auth/google/callback` - OAuth callback

### Core Modules
- `/api/v1/users` - User management
- `/api/v1/assets` - Asset CRUD
- `/api/v1/plans` - Annual/quarterly/monthly plans
- `/api/v1/teams` - Team management
- `/api/v1/inspections` - Inspection execution
- `/api/v1/reports` - Report generation & viewing
- `/api/v1/approvals` - Approval workflows
- `/api/v1/work-requests` - Work request management
- `/api/v1/rbi` - RBI audits
- `/api/v1/dashboards` - Analytics & KPIs
- `/api/v1/escalations` - Escalation management
- `/api/v1/admin` - Admin functions

Full API documentation available at: http://localhost:8000/docs

---

## Environment Variables

See `.env.example` for all available environment variables. Key variables:

### Database
- `DATABASE_URL` - PostgreSQL connection string

### Authentication
- `SECRET_KEY` - JWT signing key (generate securely!)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### Storage
- `S3_ENDPOINT` - MinIO/S3 endpoint
- `S3_ACCESS_KEY` - S3 access key
- `S3_SECRET_KEY` - S3 secret key
- `S3_BUCKET` - Bucket name

### Email
- `EMAIL_HOST` - SMTP host
- `EMAIL_PORT` - SMTP port
- `EMAIL_USER` - SMTP username
- `EMAIL_PASSWORD` - SMTP password
- `EMAIL_FROM` - From email address

---

## Make Commands

The `Makefile` provides convenient commands:

### Container Management
```bash
make up              # Start all services
make down            # Stop all services
make build           # Build all images
make rebuild         # Rebuild (no cache)
make restart         # Restart services
make ps              # List containers
make logs            # Tail all logs
make clean           # Stop and remove volumes
```

### Development
```bash
make dev             # Start in development mode
make prod            # Start in production mode
```

### Shell Access
```bash
make shell-backend   # Backend container shell
make shell-frontend  # Frontend container shell
make shell-db        # PostgreSQL shell
make shell-redis     # Redis CLI
```

### Database
```bash
make migrate                               # Run migrations
make migrate-create MESSAGE="description"  # Create migration
make migrate-down                          # Rollback migration
make seed                                  # Seed demo data
make backup                                # Backup database
make restore FILE=backup.sql.gz            # Restore database
```

### Testing
```bash
make test            # Run all tests
make test-backend    # Backend tests with coverage
make test-frontend   # Frontend tests
```

### Code Quality
```bash
make lint            # Lint all code
make lint-backend    # Lint backend (ruff)
make lint-frontend   # Lint frontend (eslint)
make format          # Format all code
make format-backend  # Format backend (ruff)
make format-frontend # Format frontend (prettier)
```

### Health Check
```bash
make health          # Check all services
```

### Quick Reset
```bash
make reset           # Stop, clean, start, migrate, seed
```

---

## Local Development (Without Docker)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with local database URL

# Run migrations
alembic upgrade head

# Seed demo data (optional)
python seed_demo_data.py

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with API URL

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Testing

### Backend Tests

```bash
# Run all tests with coverage
pytest tests/ -v --cov=app --cov-report=html --cov-report=term

# Run specific test file
pytest tests/test_inspections.py -v

# Run with specific marker
pytest tests/ -v -m "unit"
```

Coverage report: `backend/htmlcov/index.html`

### Frontend Tests

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- InspectionCard.test.tsx
```

---

## Deployment

### Production Deployment (Docker)

```bash
# Build production images
docker-compose build

# Start services
docker-compose up -d

# Run migrations
make migrate

# Check health
make health
```

### Environment-Specific Builds

```bash
# Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Production
docker-compose up -d
```

---

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `docker-compose ps postgres`
- Check logs: `docker-compose logs backend`
- Verify DATABASE_URL in .env

### Frontend can't connect to API
- Verify backend is running: `curl http://localhost:8000/health`
- Check VITE_API_URL in frontend/.env
- Check CORS settings in backend config

### Database connection issues
- Ensure PostgreSQL container is healthy: `docker-compose ps`
- Check connection string format: `postgresql://user:pass@host:port/db`
- Verify credentials match docker-compose.yml

### MinIO upload failures
- Check MinIO is running: `curl http://localhost:9000/minio/health/live`
- Verify S3 credentials in .env
- Check bucket exists (create via console at localhost:9001)

### Celery tasks not running
- Check Celery worker: `docker-compose logs celery_worker`
- Check Celery beat: `docker-compose logs celery_beat`
- Verify Redis connection: `docker-compose exec redis redis-cli ping`

---

## Contributing

### Development Workflow

1. Create a new branch for your feature
2. Make changes and test locally
3. Run linters: `make lint`
4. Run tests: `make test`
5. Commit with conventional commit messages
6. Push and create pull request

### Commit Message Format

```
<type>(<module>): <short description>

<optional longer description>
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`, `perf`

Modules: `auth`, `users`, `assets`, `plans`, `teams`, `inspections`, `reports`, `approvals`, `work-requests`, `rbi`, `dashboards`, `escalations`, `admin`

---

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with expiration
- Role-based access control on all endpoints
- SQL injection prevention via SQLAlchemy ORM
- XSS prevention via React auto-escaping
- HTTPS required in production
- Rate limiting enabled
- Audit logging for sensitive actions

---

## Performance

- Database connection pooling
- Redis caching (5-minute TTL for dashboards)
- Celery background tasks
- Database indexes on foreign keys and filtered columns
- Pagination (default 20 items/page)
- Image lazy loading
- Code splitting (React.lazy)
- Nginx compression (gzip)

---

## Support

For issues, questions, or feature requests:
- Create an issue in the repository
- Contact the development team
- Review documentation in `/docs`

---

## License

Proprietary - ADNOC Internal Use Only

---

## Acknowledgments

Built with:
- FastAPI
- React
- PostgreSQL
- Redis
- Celery
- MinIO
- Tailwind CSS
- shadcn/ui
- And many other open-source projects

---

**Last Updated**: 2026-01-13
**Version**: 1.0.0
