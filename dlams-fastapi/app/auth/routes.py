"""
routes.py
This file contains the FastAPI routes for the authentication module.
"""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth.schemas import (
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    RegistrationInvitationResponse,
    UserResponse,
)
from app.auth.utils import (
    create_access_token,
    get_current_user,
    get_user_by_username,
    require_admin,
)
from app.config import COOKIE_SECURE
from app.auth.utils import pwd_context
from app.models import RegistrationInvitation, User, UserRole
from app.utils import get_db

router = APIRouter()


@router.post("/register")
def register(user: RegisterRequest, db: Session = Depends(get_db)) -> dict[str, str]:
    """Create a regular account using a valid, unused invitation."""
    now = datetime.now(timezone.utc)
    invitation_hash = hashlib.sha256(
        user.invitation_code.encode("utf-8")
    ).hexdigest()
    invitation = db.scalar(
        select(RegistrationInvitation)
        .where(
            RegistrationInvitation.token_hash == invitation_hash,
            RegistrationInvitation.redeemed_at.is_(None),
            RegistrationInvitation.expires_at > now,
        )
        .with_for_update()
    )
    if invitation is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation is invalid, expired, or already used",
        )

    existing_user = get_user_by_username(user.username, db)

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    invitation.redeemed_at = now
    db.add(
        User(
            username=user.username,
            hashed_password=pwd_context.hash(user.password),
            role=UserRole.USER.value,
        )
    )
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to create account with those details",
        ) from exc

    return {"message": "User created successfully"}


@router.post(
    "/invitations",
    response_model=RegistrationInvitationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_registration_invitation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RegistrationInvitationResponse:
    """Create a seven-day, single-use registration invitation for an admin."""
    require_admin(current_user)

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=7)
    token = secrets.token_urlsafe(32)
    db.add(
        RegistrationInvitation(
            token_hash=hashlib.sha256(token.encode("utf-8")).hexdigest(),
            created_by_id=current_user.id,
            created_at=now,
            expires_at=expires_at,
        )
    )
    db.commit()
    return RegistrationInvitationResponse(
        invitation_code=token,
        expires_at=expires_at,
    )


@router.post("/login", response_model=AuthResponse)
def login(
    response: Response,
    login_data: LoginRequest,
    db: Session = Depends(get_db),
):
    """
    Handle user login.

    Args:
        response (Response): The FastAPI response object.
        login_data (LoginSchema): The login data containing username and password.

    Returns:
        dict: A dictionary containing the access token and token type.
    """

    db_user = get_user_by_username(login_data.username, db)

    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    if not pwd_context.verify(login_data.password, str(db_user.hashed_password)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    if not db_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    access_token = create_access_token(
        data={"sub": login_data.username},
        expires_delta=timedelta(minutes=30))


    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=1800,  # 30 minutes
        path="/",
    )

    return AuthResponse(
        message="Login successful",
        user=UserResponse.model_validate(db_user)
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response) -> Response:
    """Clear the authentication cookie for this browser session."""
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        path="/",
    )
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@router.get("/verify", response_model=AuthResponse)
async def verify_user(current_user: User = Depends(get_current_user)):
    """ Verify current user is auth'd """
    return AuthResponse(
        message="Verify successful",
        user=current_user
    )

@router.get("/protected")
async def protected_route(current_user: User = Depends(get_current_user)
                          ) -> dict[str, str]:
    """ Test route to check if protected routes are working """
    return {
        "message": "Protected route using current user",
        "user": str(current_user.username)
    }
