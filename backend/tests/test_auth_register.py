"""Tests for the registration endpoint duplicate email handling."""

import pytest
from unittest.mock import MagicMock, patch
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.exc import IntegrityError

from app.main import app
from app.database import get_db
from app.models.user import User, UserRole


# Mock database session
@pytest.fixture
def mock_db():
    """Create a mock database session."""
    return MagicMock()


@pytest.fixture
def client(mock_db):
    """Create a test client with mocked database."""
    app.dependency_overrides[get_db] = lambda: mock_db
    yield TestClient(app)
    app.dependency_overrides.clear()


class TestRegisterDuplicateEmail:
    """Test cases for duplicate email handling in registration."""

    def test_register_duplicate_email_returns_409(self, client, mock_db):
        """Test that registering with an existing email returns 409 Conflict."""
        # Mock get_user_by_email to return an existing user
        existing_user = MagicMock(spec=User)
        existing_user.id = 1
        existing_user.email = "test@example.com"

        with patch("app.routers.auth.auth_service") as mock_service:
            mock_service.get_user_by_email.return_value = existing_user

            response = client.post(
                "/api/v1/auth/register",
                json={
                    "email": "test@example.com",
                    "password": "SecurePass123!",
                    "full_name": "Test User"
                }
            )

        assert response.status_code == status.HTTP_409_CONFLICT
        data = response.json()
        assert data["detail"]["error"] == "duplicate_email"
        assert "already registered" in data["detail"]["message"].lower()

    def test_register_race_condition_integrity_error_returns_409(self, client, mock_db):
        """Test that IntegrityError from race condition returns 409 Conflict."""
        with patch("app.routers.auth.auth_service") as mock_service:
            # First check passes (no existing user)
            mock_service.get_user_by_email.return_value = None
            # But create_user fails with IntegrityError (race condition)
            mock_service.create_user.side_effect = IntegrityError(
                statement="INSERT INTO users",
                params={},
                orig=Exception("UNIQUE constraint failed: users.email")
            )

            response = client.post(
                "/api/v1/auth/register",
                json={
                    "email": "test@example.com",
                    "password": "SecurePass123!",
                    "full_name": "Test User"
                }
            )

        assert response.status_code == status.HTTP_409_CONFLICT
        data = response.json()
        assert data["detail"]["error"] == "duplicate_email"
        assert "already registered" in data["detail"]["message"].lower()

    def test_register_new_user_returns_201(self, client, mock_db):
        """Test that registering a new user returns 201 Created."""
        mock_user = MagicMock(spec=User)
        mock_user.id = 1
        mock_user.email = "newuser@example.com"
        mock_user.full_name = "New User"
        mock_user.role = UserRole.employee
        mock_user.is_active = True
        mock_user.is_verified = False
        mock_user.created_at = "2024-01-01T00:00:00"
        mock_user.updated_at = "2024-01-01T00:00:00"

        with patch("app.routers.auth.auth_service") as mock_service:
            mock_service.get_user_by_email.return_value = None
            mock_service.create_user.return_value = mock_user

            response = client.post(
                "/api/v1/auth/register",
                json={
                    "email": "newuser@example.com",
                    "password": "SecurePass123!",
                    "full_name": "New User"
                }
            )

        assert response.status_code == status.HTTP_201_CREATED
