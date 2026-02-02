"""Authentication router for API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_active_user
from app.auth.jwt import create_access_token, decode_token, hash_password
from app.database import get_db
from app.models.user import User
from app.schemas.auth import RefreshRequest, RegisterRequest, Token
from app.schemas.user import UserResponse, UserUpdate
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user account.

    Args:
        request: Registration data (email, password, full_name)
        db: Database session

    Returns:
        UserResponse: The created user

    Raises:
        HTTPException: If email already exists
    """
    # Check if email already exists
    existing_user = auth_service.get_user_by_email(db, request.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create user
    from app.schemas.user import UserCreate
    user_create = UserCreate(
        email=request.email,
        password=request.password,
        full_name=request.full_name
    )
    user = auth_service.create_user(db, user_create)

    return user


@router.post("/login", response_model=Token)
async def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login with email and password to get access and refresh tokens.

    Args:
        form: OAuth2 form with username (email) and password
        db: Database session

    Returns:
        Token: Access and refresh tokens

    Raises:
        HTTPException: If credentials are invalid
    """
    user = auth_service.authenticate_user(db, form.username, form.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )

    # Create tokens
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token_record = auth_service.create_refresh_token_record(db, user.id)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token_record.token,
        token_type="bearer"
    )


@router.post("/refresh", response_model=Token)
async def refresh_tokens(request: RefreshRequest, db: Session = Depends(get_db)):
    """
    Refresh access and refresh tokens using a valid refresh token.

    Args:
        request: Refresh token request
        db: Database session

    Returns:
        Token: New access and refresh tokens

    Raises:
        HTTPException: If refresh token is invalid or expired
    """
    # Decode the refresh token
    payload = decode_token(request.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    # Verify token exists and is not revoked
    token_record = auth_service.get_valid_refresh_token(db, request.refresh_token)
    if not token_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired or revoked"
        )

    # Get the user
    user_id = int(payload.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )

    # Revoke the old refresh token
    auth_service.revoke_refresh_token(db, request.refresh_token)

    # Create new tokens
    access_token = create_access_token({"sub": str(user.id)})
    new_refresh_token = auth_service.create_refresh_token_record(db, user.id)

    return Token(
        access_token=access_token,
        refresh_token=new_refresh_token.token,
        token_type="bearer"
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    request: RefreshRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Logout by revoking the refresh token.

    Args:
        request: Refresh token to revoke
        db: Database session
        current_user: The authenticated user

    Returns:
        None (204 No Content)
    """
    auth_service.revoke_refresh_token(db, request.refresh_token)
    return None


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get the current authenticated user's profile.

    Args:
        current_user: The authenticated user

    Returns:
        UserResponse: Current user's profile
    """
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    update_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update the current authenticated user's profile.

    Args:
        update_data: Profile update data
        db: Database session
        current_user: The authenticated user

    Returns:
        UserResponse: Updated user profile
    """
    # Update full_name if provided
    if update_data.full_name is not None:
        current_user.full_name = update_data.full_name

    # Update password if provided
    if update_data.password is not None:
        current_user.hashed_password = hash_password(update_data.password)

    db.commit()
    db.refresh(current_user)

    return current_user
