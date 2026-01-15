# ========================================
# InspectionAgent Makefile
# ========================================
# Convenience commands for Docker operations

.PHONY: help up down build restart logs clean shell-backend shell-frontend \
        shell-db migrate migrate-create migrate-down seed test test-backend \
        test-frontend lint lint-backend lint-frontend format format-backend \
        format-frontend ps dev prod backup restore

# ========================================
# Help
# ========================================
help:
	@echo "InspectionAgent Development Commands"
	@echo "===================================="
	@echo ""
	@echo "Container Management:"
	@echo "  make up              - Start all services"
	@echo "  make down            - Stop all services"
	@echo "  make build           - Build all images"
	@echo "  make rebuild         - Rebuild all images (no cache)"
	@echo "  make restart         - Restart all services"
	@echo "  make ps              - List running containers"
	@echo "  make logs            - Tail all logs"
	@echo "  make clean           - Stop and remove volumes"
	@echo ""
	@echo "Development Mode:"
	@echo "  make dev             - Start in development mode with hot reload"
	@echo "  make prod            - Start in production mode"
	@echo ""
	@echo "Shell Access:"
	@echo "  make shell-backend   - Open backend container shell"
	@echo "  make shell-frontend  - Open frontend container shell"
	@echo "  make shell-db        - Open PostgreSQL shell"
	@echo "  make shell-redis     - Open Redis CLI"
	@echo ""
	@echo "Database Operations:"
	@echo "  make migrate         - Run database migrations"
	@echo "  make migrate-create  - Create new migration (MESSAGE=description)"
	@echo "  make migrate-down    - Rollback last migration"
	@echo "  make seed            - Seed database with demo data"
	@echo "  make backup          - Backup PostgreSQL database"
	@echo "  make restore         - Restore PostgreSQL database (FILE=backup.sql)"
	@echo ""
	@echo "Testing:"
	@echo "  make test            - Run all tests"
	@echo "  make test-backend    - Run backend tests with coverage"
	@echo "  make test-frontend   - Run frontend tests"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint            - Lint all code"
	@echo "  make lint-backend    - Lint backend code"
	@echo "  make lint-frontend   - Lint frontend code"
	@echo "  make format          - Format all code"
	@echo "  make format-backend  - Format backend code"
	@echo "  make format-frontend - Format frontend code"
	@echo ""

# ========================================
# Container Management
# ========================================
up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose build

rebuild:
	docker-compose build --no-cache

restart:
	docker-compose restart

ps:
	docker-compose ps

logs:
	docker-compose logs -f

clean:
	@echo "WARNING: This will remove all containers and volumes!"
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 1
	docker-compose down -v
	@echo "Cleaned successfully!"

# ========================================
# Development Mode
# ========================================
dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
	@echo "Development environment started!"
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:5173"
	@echo "API Docs: http://localhost:8000/docs"
	@echo "MinIO Console: http://localhost:9001"
	@echo "Adminer (DB): http://localhost:8080"
	@echo "MailHog: http://localhost:8025"

prod:
	docker-compose up -d --build
	@echo "Production environment started!"
	@echo "Application: http://localhost"
	@echo "API: http://localhost/api"

# ========================================
# Shell Access
# ========================================
shell-backend:
	docker-compose exec backend bash

shell-frontend:
	docker-compose exec frontend sh

shell-db:
	docker-compose exec postgres psql -U inspection_user -d inspection_agent

shell-redis:
	docker-compose exec redis redis-cli

# ========================================
# Database Operations
# ========================================
migrate:
	docker-compose exec backend alembic upgrade head
	@echo "Migrations applied successfully!"

migrate-create:
ifndef MESSAGE
	@echo "Error: MESSAGE is required. Usage: make migrate-create MESSAGE='description'"
	@exit 1
endif
	docker-compose exec backend alembic revision --autogenerate -m "$(MESSAGE)"
	@echo "Migration created: $(MESSAGE)"

migrate-down:
	docker-compose exec backend alembic downgrade -1
	@echo "Rolled back last migration!"

seed:
	docker-compose exec backend python seed_demo_data.py
	@echo "Demo data seeded successfully!"

backup:
	@mkdir -p backups
	@echo "Creating backup..."
	docker-compose exec -T postgres pg_dump -U inspection_user inspection_agent | gzip > backups/backup_$$(date +%Y%m%d_%H%M%S).sql.gz
	@echo "Backup created in backups/ directory"

restore:
ifndef FILE
	@echo "Error: FILE is required. Usage: make restore FILE=backups/backup.sql.gz"
	@exit 1
endif
	@echo "Restoring from $(FILE)..."
	@gunzip -c $(FILE) | docker-compose exec -T postgres psql -U inspection_user inspection_agent
	@echo "Database restored successfully!"

# ========================================
# Testing
# ========================================
test: test-backend test-frontend

test-backend:
	docker-compose exec backend pytest tests/ -v --cov=app --cov-report=html --cov-report=term
	@echo "Backend tests completed! Coverage report: backend/htmlcov/index.html"

test-frontend:
	docker-compose exec frontend npm test
	@echo "Frontend tests completed!"

# ========================================
# Code Quality
# ========================================
lint: lint-backend lint-frontend

lint-backend:
	docker-compose exec backend ruff check app/
	@echo "Backend linting completed!"

lint-frontend:
	docker-compose exec frontend npm run lint
	@echo "Frontend linting completed!"

format: format-backend format-frontend

format-backend:
	docker-compose exec backend ruff format app/
	@echo "Backend code formatted!"

format-frontend:
	docker-compose exec frontend npm run format
	@echo "Frontend code formatted!"

# ========================================
# Service-Specific Logs
# ========================================
logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-postgres:
	docker-compose logs -f postgres

logs-redis:
	docker-compose logs -f redis

logs-celery:
	docker-compose logs -f celery_worker celery_beat

# ========================================
# Health Checks
# ========================================
health:
	@echo "Checking service health..."
	@echo ""
	@echo "Backend:"
	@curl -s http://localhost:8000/health || echo "Backend is down"
	@echo ""
	@echo "Frontend:"
	@curl -s http://localhost:5173 > /dev/null && echo "Frontend is up" || echo "Frontend is down"
	@echo ""
	@echo "PostgreSQL:"
	@docker-compose exec -T postgres pg_isready -U inspection_user || echo "PostgreSQL is down"
	@echo ""
	@echo "Redis:"
	@docker-compose exec -T redis redis-cli ping || echo "Redis is down"
	@echo ""

# ========================================
# Quick Reset (Development)
# ========================================
reset: down clean up migrate seed
	@echo "Environment reset complete!"

# ========================================
# Production Deploy
# ========================================
deploy:
	@echo "Building production images..."
	docker-compose build
	@echo "Starting services..."
	docker-compose up -d
	@echo "Running migrations..."
	$(MAKE) migrate
	@echo "Deployment complete!"
