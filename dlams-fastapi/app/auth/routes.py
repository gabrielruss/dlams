"""
routes.py
This file contains the FastAPI routes for the authentication module.
"""

from datetime import timedelta

from fastapi import APIRouter, Response, status, HTTPException, Depends

from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.auth.schemas import LoginRequest
from app.auth.utils import create_access_token
from app.models import User
from app.auth.utils import pwd_context

router = APIRouter()

temp_fake_user = {
    "jeff": {
        "username": "jeff",
        # testpass123
        "hash_password": "$2b$12$lRC.8pWKcnZ1EjSA25Rp/ecdH7xXVfWjmasqnnDE8EYB0K57wRbdS",
    }
}

def get_db():
    """ This function creates a new database session for each request and closes it afterward. """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register")
def register(user: LoginRequest, db: Session = Depends(get_db)):
    """ register new users """
    existing_user = db.query(User).filter(User.username == user.username).first()

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

@router.post("/login")
def login(
    response: Response,
    login_data: LoginRequest,
    db: Session = Depends(get_db)) -> dict[str, str]:
    """
    Handle user login.

    Args:
        response (Response): The FastAPI response object.
        login_data (LoginSchema): The login data containing username and password.

    Returns:
        dict: A dictionary containing the access token and token type.
    """

    db_user = db.query(User).filter(User.username == login_data.username).first()

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
    return {"message": "Login successful"}
