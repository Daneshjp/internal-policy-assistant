"""Storage service for file management."""

import os
import uuid
from pathlib import Path
from typing import Optional

from fastapi import UploadFile

from app.config import settings


class StorageService:
    """Service for handling file storage operations."""

    def __init__(self):
        """Initialize storage service with upload directory."""
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.max_file_size = settings.MAX_FILE_SIZE_MB * 1024 * 1024  # Convert to bytes
        self.allowed_types = settings.ALLOWED_FILE_TYPES.split(",")

        # Ensure upload directory exists
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def _get_user_directory(self, user_id: int) -> Path:
        """Get or create user-specific upload directory."""
        user_dir = self.upload_dir / str(user_id)
        user_dir.mkdir(parents=True, exist_ok=True)
        return user_dir

    def _generate_unique_filename(self, original_filename: str) -> str:
        """Generate a unique filename while preserving extension."""
        ext = Path(original_filename).suffix.lower()
        unique_id = uuid.uuid4().hex[:12]
        return f"{unique_id}{ext}"

    def _get_file_extension(self, filename: str) -> str:
        """Extract file extension without the dot."""
        return Path(filename).suffix.lower().lstrip(".")

    def validate_file(self, file: UploadFile) -> tuple[bool, Optional[str]]:
        """
        Validate file type and size.

        Returns:
            Tuple of (is_valid, error_message)
        """
        if not file.filename:
            return False, "No filename provided"

        # Check file extension
        ext = self._get_file_extension(file.filename)
        if ext not in self.allowed_types:
            return False, f"File type '{ext}' not allowed. Allowed types: {', '.join(self.allowed_types)}"

        return True, None

    async def save_file(self, file: UploadFile, user_id: int) -> tuple[str, int]:
        """
        Save uploaded file to storage.

        Args:
            file: The uploaded file
            user_id: ID of the user uploading the file

        Returns:
            Tuple of (file_path, file_size)
        """
        # Validate file
        is_valid, error = self.validate_file(file)
        if not is_valid:
            raise ValueError(error)

        # Get user directory and generate unique filename
        user_dir = self._get_user_directory(user_id)
        unique_filename = self._generate_unique_filename(file.filename)
        file_path = user_dir / unique_filename

        # Read file content and check size
        content = await file.read()
        file_size = len(content)

        if file_size > self.max_file_size:
            raise ValueError(f"File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB")

        # Save file
        with open(file_path, "wb") as f:
            f.write(content)

        # Reset file position for potential re-reads
        await file.seek(0)

        # Return relative path from upload directory
        relative_path = str(file_path.relative_to(self.upload_dir))
        return relative_path, file_size

    def delete_file(self, file_path: str) -> bool:
        """
        Delete a file from storage.

        Args:
            file_path: Relative path to the file from upload directory

        Returns:
            True if file was deleted, False if file didn't exist
        """
        full_path = self.upload_dir / file_path

        if full_path.exists():
            full_path.unlink()
            return True
        return False

    def get_file_path(self, file_path: str) -> Optional[Path]:
        """
        Get the full path to a file.

        Args:
            file_path: Relative path to the file from upload directory

        Returns:
            Full path if file exists, None otherwise
        """
        full_path = self.upload_dir / file_path

        if full_path.exists():
            return full_path
        return None

    def get_file_type(self, filename: str) -> str:
        """Get the file type from filename."""
        return self._get_file_extension(filename)


# Singleton instance
storage_service = StorageService()
