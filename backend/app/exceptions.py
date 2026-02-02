"""Custom exception classes for the application."""


class AppException(Exception):
    """Base exception for application errors."""

    def __init__(self, message: str, code: str, status_code: int = 500):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(self.message)


class NotFoundError(AppException):
    """Raised when a requested resource is not found."""

    def __init__(self, resource: str):
        super().__init__(
            message=f"{resource} not found",
            code="NOT_FOUND",
            status_code=404
        )


class ConflictError(AppException):
    """Raised when there is a conflict with the current state."""

    def __init__(self, message: str):
        super().__init__(
            message=message,
            code="CONFLICT",
            status_code=409
        )


class UnauthorizedError(AppException):
    """Raised when authentication fails or is missing."""

    def __init__(self, message: str = "Unauthorized"):
        super().__init__(
            message=message,
            code="UNAUTHORIZED",
            status_code=401
        )


class ForbiddenError(AppException):
    """Raised when user lacks permission to access a resource."""

    def __init__(self, message: str = "Forbidden"):
        super().__init__(
            message=message,
            code="FORBIDDEN",
            status_code=403
        )


class ValidationError(AppException):
    """Raised when input validation fails."""

    def __init__(self, message: str):
        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
            status_code=422
        )
