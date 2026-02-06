from fastapi import APIRouter, Query, Depends
from typing import List

from app.schemas.policy import PolicyResponse
from app.auth.dependencies import get_current_active_user

router = APIRouter(
    prefix="/policies",
    tags=["policies"]
)

@router.get("/search", response_model=List[PolicyResponse])
async def search_policies(
    q: str = Query(..., min_length=2),
    user = Depends(get_current_active_user)
):
    """
    Search internal policies (mock implementation).
    """
    # Mock data for now
    policies = [
        {
            "id": 1,
            "title": "Annual Leave Policy",
            "summary": "Employees are entitled to 25 days of annual leave per year."
        },
        {
            "id": 2,
            "title": "Sick Leave Policy",
            "summary": "Employees may take sick leave with valid medical certification."
        },
        {
            "id": 3,
            "title": "Remote Working Policy",
            "summary": "Employees may work remotely up to 3 days per week."
        }
    ]

    # Simple mock filtering
    query = q.lower()
    return [
        p for p in policies
        if query in p["title"].lower() or query in p["summary"].lower()
    ]
