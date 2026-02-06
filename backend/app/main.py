"""FastAPI application entry point."""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.exceptions import AppException
from app.routers import auth, categories, documents, policies

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Internal Policy Assistant API",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Configure CORS middleware (allow all origins for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Exception handlers
# -------------------------
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message
            }
        }
    )

# -------------------------
# Root sanity check
# -------------------------
@app.get("/")
async def root():
    return {"message": "Internal Policy Assistant API is running"}

# -------------------------
# Health check (MATCHES DOCKER)
# -------------------------
@app.get("/api/v1/health")
async def health():
    return {"status": "healthy"}

# -------------------------
# Include routers
# -------------------------
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
app.include_router(policies.router, prefix="/api/v1")
app.include_router(categories.router, prefix="/api/v1", tags=["categories"])
app.include_router(documents.router, prefix="/api/v1", tags=["documents"])
