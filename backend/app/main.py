"""
FastAPI application entry point.

This module initializes the FastAPI app, configures middleware,
exception handlers, and includes all routers.
"""
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import engine, Base

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan context manager.

    Handles startup and shutdown events.
    """
    # Startup
    logger.info("Starting InspectionAgent API...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug mode: {settings.DEBUG}")

    # Create database tables (in production, use Alembic migrations)
    if settings.ENVIRONMENT == "development":
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)

    # Start automatic sensor polling scheduler (every 15 minutes)
    logger.info("Starting automatic sensor polling scheduler...")
    from app.scheduler import start_scheduler
    start_scheduler(interval=900)  # 900 seconds = 15 minutes
    logger.info("Sensor polling scheduler started (interval: 15 minutes)")

    yield

    # Shutdown
    logger.info("Shutting down InspectionAgent API...")

    # Stop scheduler
    logger.info("Stopping sensor polling scheduler...")
    from app.scheduler import stop_scheduler
    stop_scheduler()
    logger.info("Sensor polling scheduler stopped")


# Initialize FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Complete inspection workflow management system for ADNOC",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None
)


# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)


# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
) -> JSONResponse:
    """
    Handle Pydantic validation errors.

    Returns a formatted JSON response with validation error details.
    """
    logger.warning(f"Validation error on {request.url}: {exc.errors()}")

    # Convert errors to JSON-serializable format
    errors = []
    for error in exc.errors():
        error_dict = {
            "loc": error.get("loc", []),
            "msg": error.get("msg", ""),
            "type": error.get("type", ""),
        }
        # Convert bytes to string if present in input
        if "input" in error:
            input_val = error["input"]
            if isinstance(input_val, bytes):
                error_dict["input"] = input_val.decode("utf-8", errors="replace")
            else:
                error_dict["input"] = str(input_val)
        errors.append(error_dict)

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": errors,
            "error_code": "VALIDATION_ERROR"
        }
    )


@app.exception_handler(Exception)
async def generic_exception_handler(
    request: Request,
    exc: Exception
) -> JSONResponse:
    """
    Handle uncaught exceptions.

    Logs the error and returns a generic error response.
    """
    logger.error(f"Unhandled exception on {request.url}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An unexpected error occurred. Please try again later.",
            "error_code": "INTERNAL_SERVER_ERROR"
        }
    )


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check() -> dict:
    """
    Health check endpoint.

    Returns the application status and version.

    Returns:
        dict: Health status information
    """
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }


# Root endpoint
@app.get("/", tags=["Root"])
async def root() -> dict:
    """
    Root endpoint.

    Returns basic API information.

    Returns:
        dict: API information
    """
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "version": settings.VERSION,
        "docs": "/docs" if settings.DEBUG else "Documentation disabled in production"
    }


# Include routers
from app.routers import auth, assets, planning, teams, inspections, reports, work_requests, approvals

app.include_router(auth.router, prefix="/api/v1")
app.include_router(assets.router, prefix="/api/v1")
app.include_router(planning.router, prefix="/api/v1")
app.include_router(teams.router, prefix="/api/v1")
app.include_router(inspections.router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")
app.include_router(work_requests.router, prefix="/api/v1")
app.include_router(approvals.router, prefix="/api/v1")
