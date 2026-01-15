"""
Common FastAPI dependencies.

Contains reusable dependencies for database sessions, authentication, etc.
"""
from typing import Generator
import redis.asyncio as aioredis
from sqlalchemy.orm import Session

from app.database import get_db as _get_db
from app.config import settings


def get_db() -> Generator[Session, None, None]:
    """
    Get database session dependency.

    Yields:
        Session: SQLAlchemy database session
    """
    yield from _get_db()


async def get_redis() -> Generator[aioredis.Redis, None, None]:
    """
    Get Redis connection dependency.

    Yields:
        Redis: Async Redis connection

    Usage:
        @router.get("/cached")
        async def cached_data(redis: Redis = Depends(get_redis)):
            return await redis.get("key")
    """
    redis = await aioredis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True
    )
    try:
        yield redis
    finally:
        await redis.close()


async def get_current_user():
    """
    Get current authenticated user dependency.

    This is a stub that will be implemented in Phase 2 (Authentication).

    Returns:
        User: Current authenticated user

    Raises:
        HTTPException: If user is not authenticated
    """
    # TODO: Implement in Phase 2 - Authentication
    # This will decode JWT token and fetch user from database
    pass
