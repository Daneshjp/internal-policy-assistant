"""
Authentication service - business logic for user authentication.

Module 1: Authentication & User Management
"""
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User, UserRole, RefreshToken
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse, UpdateProfileRequest
from app.auth.password import hash_password, verify_password
from app.auth.jwt import create_access_token, create_refresh_token, verify_token
from app.auth.oauth import verify_google_token

logger = logging.getLogger(__name__)


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Get user by email address.

    Args:
        db: Database session
        email: User email address

    Returns:
        User: User object if found, None otherwise
    """
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """
    Get user by ID.

    Args:
        db: Database session
        user_id: User ID

    Returns:
        User: User object if found, None otherwise
    """
    return db.query(User).filter(User.id == user_id).first()


def register(db: Session, data: RegisterRequest) -> User:
    """
    Register a new user account.

    Args:
        db: Database session
        data: Registration request data

    Returns:
        User: Created user object

    Raises:
        HTTPException: If email already exists
    """
    # Check if email already exists
    existing_user = get_user_by_email(db, data.email)
    if existing_user:
        logger.warning(f"Registration failed: Email already exists: {data.email}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    # Hash password
    hashed_password = hash_password(data.password)

    # Create user
    user = User(
        email=data.email,
        hashed_password=hashed_password,
        full_name=data.full_name,
        role=UserRole[data.role],
        department=data.department,
        phone=data.phone,
        is_active=True,
        is_verified=False
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    logger.info(f"User registered successfully: {user.email} (ID: {user.id})")

    return user


def login(db: Session, data: LoginRequest) -> TokenResponse:
    """
    Authenticate user with email and password.

    Args:
        db: Database session
        data: Login request data

    Returns:
        TokenResponse: Access token, refresh token, and user information

    Raises:
        HTTPException: If credentials are invalid
    """
    # Get user by email
    user = get_user_by_email(db, data.email)

    if not user:
        logger.warning(f"Login failed: User not found: {data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Verify password
    if not user.hashed_password or not verify_password(data.password, user.hashed_password):
        logger.warning(f"Login failed: Invalid password for user: {data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Check if user is active
    if not user.is_active:
        logger.warning(f"Login failed: User account inactive: {data.email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    # Create tokens
    access_token = create_access_token(user.id, user.role.value)
    refresh_token_str = create_refresh_token(user.id)

    # Store refresh token in database
    refresh_token = RefreshToken(
        user_id=user.id,
        token=refresh_token_str,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7)
    )
    db.add(refresh_token)
    db.commit()

    logger.info(f"User logged in successfully: {user.email} (ID: {user.id})")

    # Build response
    user_response = UserResponse.model_validate(user)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token_str,
        token_type="bearer",
        user=user_response
    )


async def google_login(db: Session, google_token: str) -> TokenResponse:
    """
    Authenticate user with Google OAuth token.

    Args:
        db: Database session
        google_token: Google ID token

    Returns:
        TokenResponse: Access token, refresh token, and user information

    Raises:
        HTTPException: If token is invalid
    """
    # Verify Google token
    google_user_info = await verify_google_token(google_token)

    email = google_user_info.get("email")
    if not email:
        logger.error("Google token missing email")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email not provided by Google"
        )

    # Get or create user
    user = get_user_by_email(db, email)

    if not user:
        # Create new user from Google OAuth
        user = User(
            email=email,
            full_name=google_user_info.get("name", email.split("@")[0]),
            role=UserRole.inspector,  # Default role for OAuth users
            is_active=True,
            is_verified=True,  # Google verifies email
            oauth_provider="google",
            avatar_url=google_user_info.get("picture")
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        logger.info(f"New user created via Google OAuth: {user.email} (ID: {user.id})")
    else:
        # Update existing user's OAuth info
        if not user.oauth_provider:
            user.oauth_provider = "google"
        if not user.avatar_url and google_user_info.get("picture"):
            user.avatar_url = google_user_info.get("picture")
        user.is_verified = True
        db.commit()
        db.refresh(user)

        logger.info(f"User logged in via Google OAuth: {user.email} (ID: {user.id})")

    # Check if user is active
    if not user.is_active:
        logger.warning(f"Google login failed: User account inactive: {email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    # Create tokens
    access_token = create_access_token(user.id, user.role.value)
    refresh_token_str = create_refresh_token(user.id)

    # Store refresh token in database
    from datetime import timedelta
    refresh_token = RefreshToken(
        user_id=user.id,
        token=refresh_token_str,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7)
    )
    db.add(refresh_token)
    db.commit()

    # Build response
    user_response = UserResponse.model_validate(user)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token_str,
        token_type="bearer",
        user=user_response
    )


def refresh_access_token(db: Session, refresh_token_str: str) -> TokenResponse:
    """
    Refresh access token using refresh token.

    Args:
        db: Database session
        refresh_token_str: Refresh token string

    Returns:
        TokenResponse: New access token, same refresh token, and user information

    Raises:
        HTTPException: If refresh token is invalid or revoked
    """
    # Verify refresh token
    payload = verify_token(refresh_token_str, expected_type="refresh")

    # Get user ID from token
    user_id = int(payload.get("sub"))

    # Check if refresh token exists in database and is not revoked
    refresh_token = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_token_str,
        RefreshToken.user_id == user_id,
        RefreshToken.revoked == False
    ).first()

    if not refresh_token:
        logger.warning(f"Refresh token not found or revoked for user ID: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked refresh token"
        )

    # Check if refresh token has expired
    if refresh_token.expires_at < datetime.now(timezone.utc):
        logger.warning(f"Refresh token expired for user ID: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired"
        )

    # Get user
    user = get_user_by_id(db, user_id)
    if not user or not user.is_active:
        logger.warning(f"User not found or inactive for ID: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )

    # Create new access token
    access_token = create_access_token(user.id, user.role.value)

    logger.info(f"Access token refreshed for user: {user.email} (ID: {user.id})")

    # Build response
    user_response = UserResponse.model_validate(user)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token_str,
        token_type="bearer",
        user=user_response
    )


def logout(db: Session, refresh_token_str: str, user_id: int) -> None:
    """
    Logout user by revoking refresh token.

    Args:
        db: Database session
        refresh_token_str: Refresh token to revoke
        user_id: User ID

    Raises:
        HTTPException: If refresh token not found
    """
    # Find and revoke refresh token
    refresh_token = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_token_str,
        RefreshToken.user_id == user_id
    ).first()

    if refresh_token:
        refresh_token.revoked = True
        db.commit()
        logger.info(f"User logged out: user ID {user_id}")
    else:
        logger.warning(f"Refresh token not found for user ID: {user_id}")


def update_profile(db: Session, user_id: int, data: UpdateProfileRequest) -> User:
    """
    Update user profile information.

    Args:
        db: Database session
        user_id: User ID
        data: Profile update data

    Returns:
        User: Updated user object

    Raises:
        HTTPException: If user not found
    """
    user = get_user_by_id(db, user_id)

    if not user:
        logger.warning(f"Profile update failed: User not found: ID {user_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Update fields if provided
    if data.full_name is not None:
        user.full_name = data.full_name

    if data.department is not None:
        user.department = data.department

    if data.phone is not None:
        user.phone = data.phone

    if data.avatar_url is not None:
        user.avatar_url = data.avatar_url

    db.commit()
    db.refresh(user)

    logger.info(f"Profile updated for user: {user.email} (ID: {user.id})")

    return user
