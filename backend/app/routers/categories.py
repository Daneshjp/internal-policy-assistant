"""Category router for API endpoints."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_active_user, require_role
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoryTreeResponse,
    CategoryWithDocuments,
)
from app.services import category_service

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=List[CategoryTreeResponse])
async def list_categories(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    """
    List all categories in tree structure.

    Returns categories with nested children and document counts.
    """
    return category_service.get_category_tree(db)


@router.get("/flat", response_model=List[CategoryResponse])
async def list_categories_flat(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    """
    List all categories as a flat list.

    Returns all categories without nesting.
    """
    categories = category_service.get_categories(db)
    # Add document counts to each category
    result = []
    for cat in categories:
        cat_data = category_service.get_category_with_document_count(db, cat.id)
        if cat_data:
            result.append(cat_data)
    return result


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role([UserRole.admin, UserRole.manager])),
):
    """
    Create a new category.

    Requires manager or admin role.
    """
    # Check if name already exists
    if category_service.category_exists(db, data.name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists",
        )

    # Validate parent_id if provided
    if data.parent_id:
        parent = category_service.get_category(db, data.parent_id)
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent category not found",
            )
        # Only allow one level of nesting
        if parent.parent_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Categories can only have one level of nesting",
            )

    category = category_service.create_category(db, data)
    return category_service.get_category_with_document_count(db, category.id)


@router.get("/{category_id}", response_model=CategoryWithDocuments)
async def get_category(
    category_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    """
    Get a single category by ID.

    Returns category with document count.
    """
    category = category_service.get_category_with_document_count(db, category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )
    return category


@router.get("/{category_id}/documents")
async def get_category_documents(
    category_id: int,
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    """
    Get paginated documents for a category.

    Returns documents belonging to the specified category.
    """
    # Check if category exists
    category = category_service.get_category(db, category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return category_service.get_category_documents(db, category_id, page, per_page)


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role([UserRole.admin, UserRole.manager])),
):
    """
    Update a category.

    Requires manager or admin role.
    """
    # Check if name already exists (if updating name)
    if data.name and category_service.category_exists(db, data.name, exclude_id=category_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists",
        )

    category = category_service.update_category(db, category_id, data)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return category_service.get_category_with_document_count(db, category.id)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role([UserRole.admin, UserRole.manager])),
):
    """
    Delete a category.

    Requires manager or admin role.
    Documents in this category will have their category_id set to NULL.
    """
    if not category_service.delete_category(db, category_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )
