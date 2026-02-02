"""Documents router for API endpoints."""

import math
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.document import DocumentStatus
from app.schemas.document import (
    DocumentCreate,
    DocumentUpdate,
    DocumentResponse,
    DocumentListResponse,
    DocumentFilters,
)
from app.services.document_service import document_service
from app.services.storage_service import storage_service
from app.exceptions import NotFoundError, ValidationError

router = APIRouter(prefix="/documents", tags=["documents"])


# Placeholder for authentication dependency
# TODO: Replace with actual auth dependency when auth module is implemented
def get_current_user_id() -> int:
    """Temporary placeholder for getting current user ID."""
    return 1  # Default user ID for development


@router.get("", response_model=DocumentListResponse)
async def list_documents(
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    status: Optional[DocumentStatus] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """
    List documents with optional filters and pagination.

    - **category_id**: Filter documents by category
    - **status**: Filter by document status (processing, active, archived)
    - **search**: Search in document title and description
    - **page**: Page number (default: 1)
    - **per_page**: Items per page (default: 20, max: 100)
    """
    filters = DocumentFilters(
        category_id=category_id,
        status=status,
        search=search
    )

    documents, total = document_service.get_documents(
        db=db,
        user_id=None,  # Show all documents, not just user's own
        filters=filters,
        page=page,
        per_page=per_page
    )

    pages = math.ceil(total / per_page) if total > 0 else 1

    return DocumentListResponse(
        items=[DocumentResponse.model_validate(doc) for doc in documents],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages
    )


@router.post("", response_model=DocumentResponse)
async def upload_document(
    title: str = Form(..., min_length=1, max_length=255),
    description: Optional[str] = Form(None, max_length=1000),
    category_id: Optional[int] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """
    Upload a new document.

    - **title**: Document title (required)
    - **description**: Document description (optional)
    - **category_id**: Category ID (optional)
    - **file**: The document file (PDF, DOCX, or TXT)
    """
    # Validate file
    is_valid, error = storage_service.validate_file(file)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error)

    data = DocumentCreate(
        title=title,
        description=description,
        category_id=category_id
    )

    try:
        document = await document_service.create_document(
            db=db,
            user_id=current_user_id,
            data=data,
            file=file
        )
        return DocumentResponse.model_validate(document)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.message)


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """
    Get a document by ID.

    - **document_id**: The ID of the document to retrieve
    """
    try:
        document = document_service.get_document(db, document_id)
        return DocumentResponse.model_validate(document)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=e.message)


@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: int,
    data: DocumentUpdate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """
    Update a document.

    - **document_id**: The ID of the document to update
    - **title**: New title (optional)
    - **description**: New description (optional)
    - **category_id**: New category ID (optional)
    - **status**: New status (optional)
    """
    try:
        document = document_service.update_document(db, document_id, data)
        return DocumentResponse.model_validate(document)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=e.message)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.message)


@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """
    Delete a document.

    - **document_id**: The ID of the document to delete
    """
    try:
        document_service.delete_document(db, document_id)
        return {"message": "Document deleted successfully"}
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=e.message)


@router.get("/{document_id}/download")
async def download_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """
    Download a document file.

    - **document_id**: The ID of the document to download
    """
    try:
        document = document_service.get_document(db, document_id)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=e.message)

    file_path = storage_service.get_file_path(document.file_url)
    if not file_path:
        raise HTTPException(status_code=404, detail="File not found")

    # Determine content type based on file type
    content_types = {
        "pdf": "application/pdf",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "txt": "text/plain"
    }
    content_type = content_types.get(document.file_type, "application/octet-stream")

    # Generate download filename
    filename = f"{document.title}.{document.file_type}"

    return FileResponse(
        path=str(file_path),
        media_type=content_type,
        filename=filename
    )
