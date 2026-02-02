"""Authentication service for business logic."""

from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.auth.jwt import hash_password, verify_password, create_refresh_token
from app.config import settings
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.user import UserCreate


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Get a user by email address.

    Args:
        db: Database session
        email: User's email address

    Returns:
        User | None: The user if found, None otherwise
    """
    return db.query(User).filter(User.email == email).first()


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Authenticate a user by email and password.

    Args:
        db: Database session
        email: User's email address
        password: Plain text password

    Returns:
        User | None: The authenticated user if valid, None otherwise
    """
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def create_user(db: Session, user_data: UserCreate) -> User:
    """
    Create a new user.

    Args:
        db: Database session
        user_data: User creation data

    Returns:
        User: The created user
    """
    hashed_password = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_refresh_token_record(db: Session, user_id: int) -> RefreshToken:
    """
    Create a refresh token record in the database.

    Args:
        db: Database session
        user_id: The user's ID

    Returns:
        RefreshToken: The created refresh token record
    """
    # Generate the JWT refresh token
    token_str = create_refresh_token({"sub": str(user_id)})

    # Calculate expiration time
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    # Create the database record
    refresh_token = RefreshToken(
        user_id=user_id,
        token=token_str,
        expires_at=expires_at,
        revoked=False
    )
    db.add(refresh_token)
    db.commit()
    db.refresh(refresh_token)

    return refresh_token


def revoke_refresh_token(db: Session, token: str) -> bool:
    """
    Revoke a refresh token.

    Args:
        db: Database session
        token: The refresh token string to revoke

    Returns:
        bool: True if token was revoked, False if not found
    """
    refresh_token = db.query(RefreshToken).filter(
        RefreshToken.token == token,
        RefreshToken.revoked == False
    ).first()

    if not refresh_token:
        return False

    refresh_token.revoked = True
    db.commit()
    return True


def get_valid_refresh_token(db: Session, token: str) -> Optional[RefreshToken]:
    """
    Get a valid (non-revoked, non-expired) refresh token.

    Args:
        db: Database session
        token: The refresh token string

    Returns:
        RefreshToken | None: The refresh token if valid, None otherwise
    """
    refresh_token = db.query(RefreshToken).filter(
        RefreshToken.token == token,
        RefreshToken.revoked == False,
        RefreshToken.expires_at > datetime.now(timezone.utc)
    ).first()

    return refresh_token


def update_user_password(db: Session, user: User, new_password: str) -> User:
    """
    Update a user's password.

    Args:
        db: Database session
        user: The user to update
        new_password: The new plain text password

    Returns:
        User: The updated user
    """
    user.hashed_password = hash_password(new_password)
    db.commit()
    db.refresh(user)
    return user
