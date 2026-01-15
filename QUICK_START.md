# InspectionAgent - Quick Start Guide

## Prerequisites Completed ✅
- ✅ PostgreSQL running (docker-compose)
- ✅ Redis running (docker-compose)
- ✅ Database migrated (all 34 tables created)
- ✅ Backend environment configured (.env)

## Start the Application

### Option 1: Using Docker (Recommended)

```bash
# Start all services (PostgreSQL, Redis, MinIO, Backend, Frontend)
docker-compose up -d

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 2: Local Development

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Load Demo Data (Optional but Recommended)

The demo data includes:
- 30 users (across 5 roles)
- 50+ assets (8 ADNOC locations)
- 200+ inspections
- 150+ reports
- 100+ approval workflows

```bash
cd backend
source venv/bin/activate
python scripts/seed_demo_data.py
```

**Note:** The demo data script is ready but may need minor adjustments based on the actual schema.

## Login Credentials

After seeding demo data:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@adnoc.ae | admin123 |
| Team Leader | khalid.al.mazrouei@adnoc.ae | demo123 |
| Inspector | inspector1@adnoc.ae | demo123 |
| Engineer | engineer1@adnoc.ae | demo123 |
| RBI Auditor | rbi.auditor1@adnoc.ae | demo123 |

## Verify Installation

### Check Database Tables
```bash
cd backend
source venv/bin/activate
python -c "from app.database import engine; from sqlalchemy import inspect; inspector = inspect(engine); print('Tables:', inspector.get_table_names())"
```

Expected output: 37 tables (34 models + 3 support tables)

### Test Backend API
```bash
curl http://localhost:8000/health
```

Expected: `{"status":"ok"}`

### Test API Documentation
Open: http://localhost:8000/docs

You should see all API endpoints organized by module.

## Available Services

When running `docker-compose up -d`, the following services are started:

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Caching & Celery broker |
| MinIO | 9000, 9001 | Object storage (S3-compatible) |
| Backend | 8000 | FastAPI application |
| Frontend | 5173 | React application |
| Celery | - | Background task worker |
| Nginx | 80 | Reverse proxy (production) |

## Troubleshooting

### Backend won't start
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check backend logs
docker-compose logs backend

# Or if running locally:
cd backend
source venv/bin/activate
python -c "from app.config import settings; print(settings.DATABASE_URL)"
```

### Frontend won't start
```bash
# Check frontend logs
docker-compose logs frontend

# Or reinstall dependencies:
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Database connection issues
```bash
# Restart PostgreSQL
docker-compose restart postgres

# Check DATABASE_URL in .env
cat backend/.env | grep DATABASE_URL
```

Expected: `DATABASE_URL=postgresql://inspection_user:SecurePassword123@localhost:5432/inspection_agent`

## Run Tests

**Backend:**
```bash
cd backend
source venv/bin/activate
pytest --cov=app --cov-report=html
```

**Frontend:**
```bash
cd frontend
npm run test
```

## Stop Services

```bash
# Stop all Docker services
docker-compose down

# Stop and remove volumes (WARNING: deletes database)
docker-compose down -v
```

## Next Steps

1. ✅ Start the application
2. ✅ Load demo data (optional)
3. ✅ Login with credentials
4. ✅ Explore the dashboard
5. ✅ Test the 11-step inspection workflow
6. ✅ Review API documentation at /docs
7. ✅ Prepare for ADNOC presentation!

## Project Structure

```
AdNoc/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app
│   │   ├── models/          # 34 database models
│   │   ├── routers/         # 6 API routers
│   │   ├── schemas/         # 7 Pydantic schemas
│   │   ├── services/        # 7 service layers
│   │   └── auth/            # Authentication logic
│   ├── alembic/             # Database migrations
│   ├── scripts/             # Seed data scripts
│   └── tests/               # Test suite
├── frontend/
│   └── src/
│       ├── pages/           # 50+ pages
│       ├── components/      # Reusable components
│       ├── hooks/           # Custom React hooks
│       └── services/        # API services
├── docker-compose.yml       # Production services
├── docker-compose.dev.yml   # Development services
├── BUILD_SUMMARY.md         # Complete technical docs
└── QUICK_START.md          # This file
```

## Support

For issues or questions:
1. Check BUILD_SUMMARY.md for detailed documentation
2. Review API docs at http://localhost:8000/docs
3. Check Docker logs: `docker-compose logs -f`
4. Verify environment: `docker-compose ps`

---

**Status:** ✅ Ready for Development & Demo
**Next:** Run `docker-compose up -d` to start!
