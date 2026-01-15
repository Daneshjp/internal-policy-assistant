"""
Authentication router - API endpoints for user authentication.

Module 1: Authentication & User Management
"""
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    GoogleAuthRequest,
    RefreshTokenRequest,
    TokenResponse,
    UserResponse,
    LogoutResponse,
    UpdateProfileRequest
)
from app.services import auth_service
from app.auth.dependencies import get_current_user, admin_only
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register new user",
    description="Create a new user account. Admin only endpoint for user invitation workflow."
)
async def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
) -> UserResponse:
    """
    Register a new user account.

    **RBAC:** Admin only

    **Process:**
    1. Validate email is unique
    2. Hash password with bcrypt
    3. Create user with specified role
    4. Return user information

    **Note:** Password must contain at least 8 characters with uppercase, lowercase, and digit.
    """
    user = auth_service.register(db, data)
    logger.info(f"New user registered by admin {current_user.email}: {user.email}")

    return UserResponse.model_validate(user)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Login with email/password",
    description="Authenticate user with email and password. Returns JWT tokens."
)
async def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
) -> TokenResponse:
    """
    Login with email and password.

    **Public endpoint**

    **Process:**
    1. Validate credentials
    2. Check user is active
    3. Generate JWT access token (30 min expiry)
    4. Generate JWT refresh token (7 day expiry)
    5. Return tokens and user info

    **Response:**
    - access_token: Use in Authorization header for API calls
    - refresh_token: Use to get new access token when expired
    - user: Current user information
    """
    return auth_service.login(db, data)


@router.post(
    "/google",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Login with Google OAuth",
    description="Authenticate user with Google OAuth token. Creates account if first time."
)
async def google_login(
    data: GoogleAuthRequest,
    db: Session = Depends(get_db)
) -> TokenResponse:
    """
    Login with Google OAuth.

    **Public endpoint**

    **Process:**
    1. Verify Google ID token
    2. Extract user email from token
    3. Create new user if first time (role: inspector)
    4. Generate JWT tokens
    5. Return tokens and user info

    **Note:** Email must be verified by Google. New users default to inspector role.
    """
    return await auth_service.google_login(db, data.google_token)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh access token",
    description="Get new access token using refresh token."
)
async def refresh_token(
    data: RefreshTokenRequest,
    db: Session = Depends(get_db)
) -> TokenResponse:
    """
    Refresh access token.

    **Public endpoint** (requires valid refresh token)

    **Process:**
    1. Verify refresh token is valid and not revoked
    2. Check token not expired
    3. Generate new access token (30 min expiry)
    4. Return new access token with same refresh token

    **Use case:**
    When access token expires (after 30 minutes), use refresh token to get new access token
    without requiring user to login again.
    """
    return auth_service.refresh_access_token(db, data.refresh_token)


@router.post(
    "/logout",
    response_model=LogoutResponse,
    status_code=status.HTTP_200_OK,
    summary="Logout user",
    description="Revoke refresh token to logout user."
)
async def logout(
    refresh_token: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> LogoutResponse:
    """
    Logout user.

    **Requires authentication**

    **Process:**
    1. Revoke refresh token in database
    2. Client should also delete tokens from local storage

    **Request body:**
    ```json
    {
        "refresh_token": "your_refresh_token_here"
    }
    ```

    **Note:**
    Access token cannot be revoked (stateless JWT), but will expire in 30 minutes.
    Refresh token is revoked immediately.
    """
    auth_service.logout(db, refresh_token, current_user.id)

    return LogoutResponse(message="Successfully logged out")


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
    description="Get authenticated user's profile information."
)
async def get_me(
    current_user: User = Depends(get_current_user)
) -> UserResponse:
    """
    Get current user profile.

    **Requires authentication**

    **Returns:**
    Current user's profile information including:
    - Basic info (email, name, role)
    - Contact info (phone, department)
    - Account status (active, verified)
    - OAuth info (provider, avatar)
    - Timestamps (created_at, updated_at)
    """
    return UserResponse.model_validate(current_user)


@router.put(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Update current user profile",
    description="Update authenticated user's profile information."
)
async def update_me(
    data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> UserResponse:
    """
    Update current user profile.

    **Requires authentication**

    **Updatable fields:**
    - full_name: User's full name
    - department: User's department
    - phone: User's phone number
    - avatar_url: User's profile picture URL

    **Note:**
    - Email and role cannot be updated by user (admin only via separate endpoint)
    - Only provide fields you want to update (all optional)
    """
    updated_user = auth_service.update_profile(db, current_user.id, data)

    return UserResponse.model_validate(updated_user)
