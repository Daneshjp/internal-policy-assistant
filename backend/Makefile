# Makefile for InspectionAgent Backend

.PHONY: help install migrate verify-setup seed-demo reset-demo run test lint format clean

help:
	@echo "InspectionAgent Backend - Available Commands"
	@echo "============================================"
	@echo "install       - Install Python dependencies"
	@echo "migrate       - Run database migrations"
	@echo "verify-setup  - Verify demo data setup (dependencies, DB connection)"
	@echo "seed-demo     - Seed database with demo data"
	@echo "reset-demo    - Drop all tables and reseed (WARNING: destructive)"
	@echo "run           - Run development server"
	@echo "test          - Run tests with coverage"
	@echo "lint          - Run ruff linter"
	@echo "format        - Format code with ruff"
	@echo "clean         - Clean Python cache files"

install:
	pip install -r requirements.txt

migrate:
	alembic upgrade head

verify-setup:
	python scripts/verify_setup.py

seed-demo:
	python scripts/seed_demo_data.py

reset-demo:
	python scripts/reset_demo.py

run:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

test:
	pytest tests/ -v --cov=app --cov-report=html --cov-report=term

lint:
	ruff check app/ scripts/

format:
	ruff format app/ scripts/

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.coverage" -delete
	rm -rf .pytest_cache htmlcov .ruff_cache
