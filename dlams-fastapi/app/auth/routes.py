"""
routes.py
This file contains the FastAPI routes for the authentication module.
"""

from datetime import timedelta

from fastapi import APIRouter, Response, status, HTTPException, Depends

from sqlalchemy.orm import Session
from app.auth.schemas import LoginRequest, AuthResponse, UserResponse
from app.auth.utils import create_access_token, get_current_user, get_user_by_username
from app.models import User
from app.auth.utils import pwd_context
from app.utils import get_db

router = APIRouter()

@router.post("/register")
def register(user: LoginRequest, db: Session = Depends(get_db)):
    """ register new users """
    existing_user = get_user_by_username(user.username, db)

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    hashed_password = pwd_context.hash(user.password)
    new_user = User(username=user.username, hashed_password=hashed_password)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User created successfully"}

@router.post("/login", response_model=AuthResponse)
def login(
    response: Response,
    login_data: LoginRequest,
    db: Session = Depends(get_db)):
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

    access_token = create_access_token(
        data={"sub": login_data.username},
        expires_delta=timedelta(minutes=30))


    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # Set to True in production
        samesite="lax",
        max_age=1800,  # 30 minutes
        path="/",
    )

    return AuthResponse(
        message="Login successful",
        user=UserResponse.model_validate(db_user)
    )

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
