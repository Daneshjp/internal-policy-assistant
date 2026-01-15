"""
Authentication schemas (Pydantic models for request/response validation).

Module 1: Authentication & User Management
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, validator


# Request Schemas
class RegisterRequest(BaseModel):
    """
    User registration request schema.

    Used for creating new user accounts.
    """
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, max_length=100, description="User password (min 8 characters)")
    full_name: str = Field(..., min_length=1, max_length=100, description="User full name")
    role: str = Field(default="inspector", description="User role (inspector, team_leader, engineer, rbi_auditor, admin)")
    department: Optional[str] = Field(None, max_length=100, description="User department")
    phone: Optional[str] = Field(None, max_length=20, description="User phone number")

    @validator("password")
    def validate_password(cls, v: str) -> str:
        """
        Validate password strength.

        Password must contain:
        - At least 8 characters
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one digit
        """
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")

        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")

        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")

        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")

        return v

    @validator("role")
    def validate_role(cls, v: str) -> str:
        """Validate role is one of the allowed values."""
        allowed_roles = ["inspector", "team_leader", "engineer", "rbi_auditor", "admin"]
        if v not in allowed_roles:
            raise ValueError(f"Role must be one of: {', '.join(allowed_roles)}")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "email": "john.doe@adnoc.ae",
                "password": "SecurePass123!",
                "full_name": "John Doe",
                "role": "inspector",
                "department": "Inspection Team A",
                "phone": "+971501234567"
            }
        }


class LoginRequest(BaseModel):
    """
    User login request schema.

    Used for email/password authentication.
    """
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "john.doe@adnoc.ae",
                "password": "SecurePass123!"
            }
        }


class GoogleAuthRequest(BaseModel):
    """
    Google OAuth authentication request schema.

    Used for Google OAuth login.
    """
    google_token: str = Field(..., description="Google ID token from OAuth flow")

    class Config:
        json_schema_extra = {
            "example": {
                "google_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
            }
        }


class RefreshTokenRequest(BaseModel):
    """
    Token refresh request schema.

    Used to refresh access token using refresh token.
    """
    refresh_token: str = Field(..., description="Valid refresh token")

    class Config:
        json_schema_extra = {
            "example": {
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
            }
        }


# Response Schemas
class UserResponse(BaseModel):
    """
    User response schema.

    Used in authentication responses and user profile endpoints.
    """
    id: int = Field(..., description="User ID")
    email: EmailStr = Field(..., description="User email address")
    full_name: str = Field(..., description="User full name")
    role: str = Field(..., description="User role")
    department: Optional[str] = Field(None, description="User department")
    phone: Optional[str] = Field(None, description="User phone number")
    is_active: bool = Field(..., description="Whether user account is active")
    is_verified: bool = Field(..., description="Whether user email is verified")
    oauth_provider: Optional[str] = Field(None, description="OAuth provider (google, azure, etc.)")
    avatar_url: Optional[str] = Field(None, description="User avatar/profile picture URL")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "email": "john.doe@adnoc.ae",
                "full_name": "John Doe",
                "role": "inspector",
                "department": "Inspection Team A",
                "phone": "+971501234567",
                "is_active": True,
                "is_verified": True,
                "oauth_provider": None,
                "avatar_url": "https://example.com/avatar.jpg",
                "created_at": "2026-01-13T10:00:00Z",
                "updated_at": "2026-01-13T10:00:00Z"
            }
        }


class TokenResponse(BaseModel):
    """
    Token response schema.

    Returned after successful login or token refresh.
    """
    access_token: str = Field(..., description="JWT access token (30 minute expiry)")
    refresh_token: str = Field(..., description="JWT refresh token (7 day expiry)")
    token_type: str = Field(default="bearer", description="Token type (always 'bearer')")
    user: UserResponse = Field(..., description="Authenticated user information")

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "id": 1,
                    "email": "john.doe@adnoc.ae",
                    "full_name": "John Doe",
                    "role": "inspector",
                    "department": "Inspection Team A",
                    "phone": "+971501234567",
                    "is_active": True,
                    "is_verified": True,
                    "oauth_provider": None,
                    "avatar_url": None,
                    "created_at": "2026-01-13T10:00:00Z",
                    "updated_at": "2026-01-13T10:00:00Z"
                }
            }
        }


class LogoutResponse(BaseModel):
    """
    Logout response schema.

    Returned after successful logout.
    """
    message: str = Field(..., description="Logout confirmation message")

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Successfully logged out"
            }
        }


class UpdateProfileRequest(BaseModel):
    """
    Update user profile request schema.

    Used for updating own profile information.
    """
    full_name: Optional[str] = Field(None, min_length=1, max_length=100, description="User full name")
    department: Optional[str] = Field(None, max_length=100, description="User department")
    phone: Optional[str] = Field(None, max_length=20, description="User phone number")
    avatar_url: Optional[str] = Field(None, max_length=500, description="Avatar URL")

    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "John Smith",
                "department": "Inspection Team B",
                "phone": "+971507654321",
                "avatar_url": "https://example.com/new-avatar.jpg"
            }
        }
