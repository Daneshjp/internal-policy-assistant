"""User model for authentication and authorization."""

import enum
from sqlalchemy import Column, Integer, String, Boolean, Enum
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import TimestampMixin


class UserRole(enum.Enum):
    """Enumeration of user roles."""

    admin = "admin"
    manager = "manager"
    employee = "employee"


class User(Base, TimestampMixin):
    """
    User model for storing user account information.

    Attributes:
        id: Primary key
        email: User's email address (unique, indexed)
        hashed_password: Bcrypt hashed password
        full_name: User's full name
        role: User's role (admin, manager, employee)
        is_active: Whether the user account is active
        is_verified: Whether the user's email is verified
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.employee, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)

    # Relationships
    refresh_tokens = relationship(
        "RefreshToken",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    documents = relationship(
        "Document",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    conversations = relationship(
        "Conversation",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    query_logs = relationship(
        "QueryLog",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    document_views = relationship(
        "DocumentView",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role={self.role.value})>"
