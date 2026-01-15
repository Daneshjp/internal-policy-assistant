# InspectionAgent Backend

FastAPI backend for the InspectionAgent inspection workflow management system.

## Tech Stack

- **Framework:** FastAPI 0.110+
- **Python:** 3.11+
- **Database:** PostgreSQL 15+ with SQLAlchemy ORM
- **Authentication:** JWT + Google OAuth 2.0
- **Caching:** Redis
- **Task Queue:** Celery
- **Storage:** MinIO/S3 (for photos and reports)
- **Email:** SendGrid/AWS SES
- **Testing:** pytest with 80%+ coverage target
- **Code Quality:** ruff (linting & formatting), mypy (type checking)

## Prerequisites

- Python 3.11 or higher
- PostgreSQL 15 or higher
- Redis 7 or higher
- MinIO (for local development) or AWS S3

## Setup Instructions

### 1. Clone the Repository

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Copy the example environment file and update with your values:

```bash
cp .env.example .env
```

Edit `.env` and set:
- `DATABASE_URL`: Your PostgreSQL connection string
- `SECRET_KEY`: Generate with `openssl rand -hex 32`
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
- Other service credentials as needed

### 5. Database Setup

Create the database:

```bash
# Using psql
createdb inspection_agent

# Or connect to PostgreSQL and run:
# CREATE DATABASE inspection_agent;
```

Run migrations (to be implemented with Alembic in Phase 3):

```bash
# This will be available after database models are created
alembic upgrade head
```

### 6. Run the Application

Start the development server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs (Swagger UI): http://localhost:8000/docs
- Alternative docs (ReDoc): http://localhost:8000/redoc

### 7. Run Tests

```bash
# Run all tests
pytest

# Run with coverage report
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py -v

# Run tests matching a pattern
pytest -k "test_login"
```

### 8. Code Quality

```bash
# Lint code with ruff
ruff check app/

# Format code with ruff
ruff format app/

# Type check with mypy
mypy app/
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app initialization
│   ├── config.py            # Settings and configuration
│   ├── database.py          # Database connection and session
│   ├── dependencies.py      # Common FastAPI dependencies
│   ├── exceptions.py        # Custom HTTP exceptions
│   ├── models/              # SQLAlchemy models (Phase 3)
│   ├── schemas/             # Pydantic schemas (Phase 3)
│   ├── routers/             # API endpoints (Phase 3+)
│   ├── services/            # Business logic (Phase 3+)
│   ├── auth/                # Authentication & authorization (Phase 2)
│   ├── utils/               # Utility functions (Phase 4+)
│   └── tasks/               # Celery background tasks (Phase 5+)
├── alembic/                 # Database migrations (Phase 3)
├── tests/                   # Test files (Phase 6)
├── requirements.txt         # Python dependencies
├── pyproject.toml          # Tool configurations
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Development Guidelines

### Code Standards

1. **Type Hints**: Required for all functions and methods
2. **Async/Await**: All endpoints must be async
3. **Docstrings**: Use Google-style docstrings
4. **Logging**: Use the logging module, never `print()`
5. **Error Handling**: Use custom exceptions from `app.exceptions`

### Example Endpoint

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.inspection import InspectionCreate, InspectionResponse
from app.services import inspection_service
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/v1/inspections", tags=["inspections"])

@router.post("/", response_model=InspectionResponse, status_code=status.HTTP_201_CREATED)
async def create_inspection(
    data: InspectionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Create a new inspection.

    Args:
        data: Inspection creation data
        db: Database session
        current_user: Authenticated user

    Returns:
        Created inspection object

    Raises:
        HTTPException: If asset or planned inspection not found
    """
    return await inspection_service.create_inspection(db, data, current_user.id)
```

## Environment Variables

See `.env.example` for all available configuration options.

Critical variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT signing key (must be secure in production)
- `ALLOWED_ORIGINS`: CORS allowed origins (comma-separated)

## Testing

The project uses pytest for testing with the following structure:

```
tests/
├── conftest.py              # Test fixtures and configuration
├── test_auth.py            # Authentication tests
├── test_inspections.py     # Inspection module tests
├── test_approvals.py       # Approval workflow tests
└── ...
```

Run tests with coverage:

```bash
pytest --cov=app --cov-report=html
# Open htmlcov/index.html in browser to view coverage report
```

## Deployment

For production deployment:

1. Set `ENVIRONMENT=production` and `DEBUG=false`
2. Use a strong `SECRET_KEY` (256-bit random key)
3. Configure proper CORS `ALLOWED_ORIGINS`
4. Use managed PostgreSQL and Redis services
5. Set up SSL/TLS certificates
6. Configure proper logging and monitoring
7. Use environment-specific `.env` files
8. Run with production ASGI server (Gunicorn + Uvicorn workers)

```bash
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Demo Data

For ADNOC presentation and testing, comprehensive demo data can be seeded into the database.

### Quick Start

```bash
# Install dependencies first
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Seed demo data (keeps existing data)
make seed-demo

# OR reset everything and reseed (WARNING: deletes all data)
make reset-demo
```

### What Gets Created

- **30 Users** (1 admin, 5 team leaders, 12 inspectors, 6 engineers, 4 RBI auditors)
- **50 Assets** across ADNOC facilities (Ruwais, Das Island, Fujairah, etc.)
- **200 Inspections** (70% completed, with findings and measurements)
- **150 Reports** (various statuses: draft, submitted, approved)
- **100 Approval Workflows** (4-stage approval process)
- **50 Work Requests** (linked to inspection findings)
- **1 Annual Plan** for 2025 with quarterly breakdown

### Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@adnoc.ae | admin123 |
| Team Leader | khalid.almazrouei@adnoc.ae | demo123 |
| Inspector | inspector1@adnoc.ae | demo123 |
| Engineer | engineer1@adnoc.ae | demo123 |
| RBI Auditor | rbi.auditor1@adnoc.ae | demo123 |

### Scripts

- `scripts/seed_demo_data.py` - Seeds database with demo data
- `scripts/reset_demo.py` - Drops all tables and reseeds (destructive)
- `scripts/README.md` - Detailed documentation

For complete demo data documentation, see `/DEMO_DATA_GUIDE.md` in the project root.

## Troubleshooting

### Database Connection Issues

If you see `sqlalchemy.exc.OperationalError`:
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in .env
- Ensure database exists: `psql -l`

### Import Errors

If you see `ModuleNotFoundError`:
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

### Port Already in Use

If port 8000 is occupied:
- Change port: `uvicorn app.main:app --port 8001`
- Or kill existing process: `lsof -ti:8000 | xargs kill`

## Contributing

1. Follow the code standards defined in `/CLAUDE.md`
2. Write tests for new features (80%+ coverage target)
3. Run linting and type checking before committing
4. Use conventional commit messages

## License

Internal ADNOC project - All rights reserved

## Support

For issues or questions, contact the development team.
