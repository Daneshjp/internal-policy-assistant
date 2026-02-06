"""Policy schemas for API requests and responses."""

from pydantic import BaseModel


class PolicyResponse(BaseModel):
    """Response schema for policy data."""

    id: int
    title: str
    summary: str
