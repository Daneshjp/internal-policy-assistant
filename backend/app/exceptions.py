"""
Custom HTTP exceptions for the application.

Provides typed exceptions with consistent error responses.
"""
from fastapi import HTTPException, status


class NotFoundException(HTTPException):
    """Exception raised when a resource is not found."""

    def __init__(self, resource: str, resource_id: int | str = None):
        """
        Initialize NotFoundException.

        Args:
            resource: Name of the resource (e.g., "Inspection", "Asset")
            resource_id: Optional ID of the resource
        """
        detail = f"{resource} not found"
        if resource_id:
            detail = f"{resource} with id {resource_id} not found"
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class ConflictException(HTTPException):
    """Exception raised when there's a conflict (e.g., duplicate resource)."""

    def __init__(self, message: str):
        """
        Initialize ConflictException.

        Args:
            message: Description of the conflict
        """
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=message)


class ForbiddenException(HTTPException):
    """Exception raised when user doesn't have permission to perform action."""

    def __init__(self, message: str = "You don't have permission to perform this action"):
        """
        Initialize ForbiddenException.

        Args:
            message: Description of why access is forbidden
        """
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=message)


class UnauthorizedException(HTTPException):
    """Exception raised when user is not authenticated."""

    def __init__(self, message: str = "Not authenticated"):
        """
        Initialize UnauthorizedException.

        Args:
            message: Description of authentication failure
        """
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=message,
            headers={"WWW-Authenticate": "Bearer"}
        )
