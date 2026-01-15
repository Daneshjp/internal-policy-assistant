"""
Auth package.

Authentication and authorization utilities.
"""
from app.auth.jwt import create_access_token, create_refresh_token, verify_token, decode_token
from app.auth.oauth import verify_google_token, get_google_user_info
from app.auth.password import hash_password, verify_password
from app.auth.dependencies import (
    get_current_user,
    get_current_active_user,
    RoleChecker,
    require_role,
    admin_only,
    admin_or_team_leader,
    admin_team_leader_or_engineer,
    all_roles
)

__all__ = [
    # JWT
    "create_access_token",
    "create_refresh_token",
    "verify_token",
    "decode_token",
    # OAuth
    "verify_google_token",
    "get_google_user_info",
    # Password
    "hash_password",
    "verify_password",
    # Dependencies
    "get_current_user",
    "get_current_active_user",
    "RoleChecker",
    "require_role",
    "admin_only",
    "admin_or_team_leader",
    "admin_team_leader_or_engineer",
    "all_roles"
]
