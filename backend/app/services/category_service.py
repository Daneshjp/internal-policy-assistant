"""Category service for business logic."""

from typing import List, Optional

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.category import Category
from app.models.document import Document, DocumentStatus
from app.schemas.category import CategoryCreate, CategoryUpdate


def get_categories(db: Session) -> List[Category]:
    """
    Get all categories as a flat list.

    Args:
        db: Database session

    Returns:
        List[Category]: List of all categories
    """
    return db.query(Category).order_by(Category.name).all()


def get_category_tree(db: Session) -> List[dict]:
    """
    Get categories as a nested tree structure.

    Args:
        db: Database session

    Returns:
        List[dict]: List of root categories with nested children
    """
    # Get all categories with document counts
    categories = db.query(Category).all()

    # Get document counts per category
    doc_counts = dict(
        db.query(Document.category_id, func.count(Document.id))
        .filter(Document.status == DocumentStatus.active)
        .group_by(Document.category_id)
        .all()
    )

    # Build a lookup dictionary
    category_dict = {}
    for cat in categories:
        category_dict[cat.id] = {
            "id": cat.id,
            "name": cat.name,
            "description": cat.description,
            "icon": cat.icon,
            "parent_id": cat.parent_id,
            "document_count": doc_counts.get(cat.id, 0),
            "children": [],
            "created_at": cat.created_at,
        }

    # Build the tree structure
    root_categories = []
    for cat_id, cat_data in category_dict.items():
        parent_id = cat_data["parent_id"]
        if parent_id is None:
            root_categories.append(cat_data)
        elif parent_id in category_dict:
            category_dict[parent_id]["children"].append(cat_data)

    # Sort by name
    root_categories.sort(key=lambda x: x["name"])
    for cat in root_categories:
        cat["children"].sort(key=lambda x: x["name"])

    return root_categories


def get_category(db: Session, category_id: int) -> Optional[Category]:
    """
    Get a single category by ID.

    Args:
        db: Database session
        category_id: Category ID

    Returns:
        Category | None: The category if found, None otherwise
    """
    return db.query(Category).filter(Category.id == category_id).first()


def get_category_with_document_count(db: Session, category_id: int) -> Optional[dict]:
    """
    Get a category by ID with document count.

    Args:
        db: Database session
        category_id: Category ID

    Returns:
        dict | None: Category data with document count if found
    """
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        return None

    doc_count = db.query(func.count(Document.id)).filter(
        Document.category_id == category_id,
        Document.status == DocumentStatus.active
    ).scalar() or 0

    return {
        "id": category.id,
        "name": category.name,
        "description": category.description,
        "icon": category.icon,
        "parent_id": category.parent_id,
        "document_count": doc_count,
        "created_at": category.created_at,
    }


def create_category(db: Session, data: CategoryCreate) -> Category:
    """
    Create a new category.

    Args:
        db: Database session
        data: Category creation data

    Returns:
        Category: The created category
    """
    category = Category(
        name=data.name,
        description=data.description,
        icon=data.icon,
        parent_id=data.parent_id,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update_category(
    db: Session, category_id: int, data: CategoryUpdate
) -> Optional[Category]:
    """
    Update an existing category.

    Args:
        db: Database session
        category_id: Category ID
        data: Category update data

    Returns:
        Category | None: The updated category if found, None otherwise
    """
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        return None

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category_id: int) -> bool:
    """
    Delete a category.

    Args:
        db: Database session
        category_id: Category ID

    Returns:
        bool: True if deleted, False if not found
    """
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        return False

    db.delete(category)
    db.commit()
    return True


def get_category_documents(
    db: Session, category_id: int, page: int = 1, per_page: int = 20
) -> dict:
    """
    Get paginated documents for a category.

    Args:
        db: Database session
        category_id: Category ID
        page: Page number (1-indexed)
        per_page: Items per page

    Returns:
        dict: Paginated documents with metadata
    """
    query = db.query(Document).filter(
        Document.category_id == category_id,
        Document.status == DocumentStatus.active
    )

    total = query.count()
    documents = query.order_by(Document.created_at.desc()).offset(
        (page - 1) * per_page
    ).limit(per_page).all()

    return {
        "items": documents,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page,
    }


def category_exists(db: Session, name: str, exclude_id: Optional[int] = None) -> bool:
    """
    Check if a category with the given name exists.

    Args:
        db: Database session
        name: Category name
        exclude_id: Category ID to exclude from check (for updates)

    Returns:
        bool: True if exists, False otherwise
    """
    query = db.query(Category).filter(Category.name == name)
    if exclude_id:
        query = query.filter(Category.id != exclude_id)
    return query.first() is not None
