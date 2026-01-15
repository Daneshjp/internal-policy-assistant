"""
JWT token creation and validation utilities.

Module 1: Authentication & User Management
"""
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional

from jose import JWTError, jwt
from fastapi import HTTPException, status

from app.config import settings

logger = logging.getLogger(__name__)


def create_access_token(user_id: int, role: str) -> str:
    """
    Create JWT access token.

    Args:
        user_id: User ID to encode in token
        role: User role to encode in token

    Returns:
        str: Encoded JWT access token (30 minute expiry)
    """
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": expire,
        "type": "access",
        "iat": datetime.now(timezone.utc)
    }

    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    logger.debug(f"Created access token for user {user_id} with role {role}")

    return token


def create_refresh_token(user_id: int) -> str:
    """
    Create JWT refresh token.

    Args:
        user_id: User ID to encode in token

    Returns:
        str: Encoded JWT refresh token (7 day expiry)
    """
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )

    payload = {
        "sub": str(user_id),
        "exp": expire,
        "type": "refresh",
        "iat": datetime.now(timezone.utc)
    }

    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    logger.debug(f"Created refresh token for user {user_id}")

    return token


def verify_token(token: str, expected_type: str = "access") -> Dict[str, any]:
    """
    Verify and decode JWT token.

    Args:
        token: JWT token to verify
        expected_type: Expected token type ('access' or 'refresh')

    Returns:
        dict: Decoded token payload

    Raises:
        HTTPException: If token is invalid, expired, or wrong type
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        # Verify token type
        token_type = payload.get("type")
        if token_type != expected_type:
            logger.warning(f"Invalid token type: expected {expected_type}, got {token_type}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token type. Expected {expected_type} token.",
                headers={"WWW-Authenticate": "Bearer"}
            )

        # Verify expiration
        exp = payload.get("exp")
        if exp is None:
            logger.warning("Token missing expiration claim")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing expiration",
                headers={"WWW-Authenticate": "Bearer"}
            )

        if datetime.fromtimestamp(exp, tz=timezone.utc) < datetime.now(timezone.utc):
            logger.warning("Token has expired")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"}
            )

        return payload

    except JWTError as e:
        logger.error(f"JWT validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )


def decode_token(token: str) -> Optional[Dict[str, any]]:
    """
    Decode JWT token without verification (for debugging/inspection only).

    Args:
        token: JWT token to decode

    Returns:
        dict: Decoded token payload or None if invalid

    Note:
        Use verify_token() for production token validation
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            options={"verify_exp": False}
        )
        return payload
    except JWTError as e:
        logger.debug(f"Failed to decode token: {str(e)}")
        return None
