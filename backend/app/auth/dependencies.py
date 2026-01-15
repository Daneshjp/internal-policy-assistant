"""
Authentication and authorization dependencies for FastAPI endpoints.

Module 1: Authentication & User Management
"""
import logging
from typing import List, Optional
from functools import wraps

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.jwt import verify_token
from app.models.user import User, UserRole

logger = logging.getLogger(__name__)

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    auto_error=True
)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token.

    Args:
        token: JWT access token from Authorization header
        db: Database session

    Returns:
        User: Current authenticated user

    Raises:
        HTTPException: If token is invalid or user not found

    Usage:
        @router.get("/me")
        async def get_me(current_user: User = Depends(get_current_user)):
            return current_user
    """
    # Verify and decode token
    payload = verify_token(token, expected_type="access")

    # Extract user ID from token
    user_id_str = payload.get("sub")
    if user_id_str is None:
        logger.warning("Token missing 'sub' claim")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing user ID",
            headers={"WWW-Authenticate": "Bearer"}
        )

    try:
        user_id = int(user_id_str)
    except (ValueError, TypeError):
        logger.warning(f"Invalid user ID in token: {user_id_str}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: malformed user ID",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Query user from database
    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        logger.warning(f"User not found for ID: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Check if user is active
    if not user.is_active:
        logger.warning(f"Inactive user attempted access: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    logger.debug(f"Authenticated user: {user.email} (ID: {user.id}, Role: {user.role.value})")

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current active user (convenience dependency).

    Args:
        current_user: Current user from get_current_user

    Returns:
        User: Current active user

    Raises:
        HTTPException: If user is inactive

    Usage:
        @router.get("/protected")
        async def protected_route(user: User = Depends(get_current_active_user)):
            return {"message": "Protected resource"}
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    return current_user


class RoleChecker:
    """
    Dependency class for role-based access control (RBAC).

    Usage:
        # Single role
        @router.post("/assets", dependencies=[Depends(RoleChecker(["admin"]))])
        async def create_asset():
            pass

        # Multiple roles
        @router.get("/admin", dependencies=[Depends(RoleChecker(["admin", "team_leader"]))])
        async def admin_dashboard():
            pass

        # With current user
        @router.delete("/assets/{id}")
        async def delete_asset(
            id: int,
            current_user: User = Depends(RoleChecker(["admin"]))
        ):
            pass
    """

    def __init__(self, allowed_roles: List[str]):
        """
        Initialize role checker.

        Args:
            allowed_roles: List of allowed role names (e.g., ["admin", "team_leader"])
        """
        self.allowed_roles = allowed_roles

    async def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        """
        Check if current user has required role.

        Args:
            current_user: Current authenticated user

        Returns:
            User: Current user if authorized

        Raises:
            HTTPException: If user doesn't have required role
        """
        user_role = current_user.role.value

        if user_role not in self.allowed_roles:
            logger.warning(
                f"Access denied for user {current_user.email} (Role: {user_role}). "
                f"Required roles: {self.allowed_roles}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required roles: {', '.join(self.allowed_roles)}"
            )

        logger.debug(
            f"Access granted for user {current_user.email} (Role: {user_role})"
        )

        return current_user


def require_role(*roles: str):
    """
    Decorator factory for role-based access control.

    Convenience function to create RoleChecker dependency.

    Args:
        *roles: Variable number of allowed role names

    Returns:
        RoleChecker: Configured role checker dependency

    Usage:
        @router.post("/assets", dependencies=[Depends(require_role("admin", "team_leader"))])
        async def create_asset():
            pass
    """
    return RoleChecker(list(roles))


# Common role combinations
admin_only = RoleChecker(["admin"])
admin_or_team_leader = RoleChecker(["admin", "team_leader"])
admin_team_leader_or_engineer = RoleChecker(["admin", "team_leader", "engineer"])
all_roles = RoleChecker(["admin", "team_leader", "engineer", "rbi_auditor", "inspector"])
