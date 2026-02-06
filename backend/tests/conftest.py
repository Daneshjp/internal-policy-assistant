"""Pytest fixtures for backend tests."""

import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from app.main import app
from app.database import get_db
from app.models.user import User, UserRole


@pytest.fixture
def mock_db():
    """Create a mock database session."""
    return MagicMock()


@pytest.fixture
def mock_user():
    """Create a mock authenticated user."""
    user = MagicMock(spec=User)
    user.id = 1
    user.email = "test@example.com"
    user.full_name = "Test User"
    user.role = UserRole.employee
    user.is_active = True
    user.is_verified = True
    return user


@pytest.fixture
def auth_client(mock_db, mock_user):
    """Create a test client with mocked authentication."""
    from app.auth.dependencies import get_current_active_user

    app.dependency_overrides[get_db] = lambda: mock_db
    app.dependency_overrides[get_current_active_user] = lambda: mock_user

    yield TestClient(app)

    app.dependency_overrides.clear()
