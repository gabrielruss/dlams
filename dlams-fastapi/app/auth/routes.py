"""
routes.py
This file contains the FastAPI routes for the authentication module.
"""

from datetime import timedelta

from fastapi import APIRouter, Response, status, HTTPException

from app.auth.schemas import LoginRequest
from app.auth.utils import create_access_token, verify_password

router = APIRouter()

temp_fake_user = {
    "jeff": {
        "username": "jeff",
        # testpass123
        "hash_password": "$2b$12$lRC.8pWKcnZ1EjSA25Rp/ecdH7xXVfWjmasqnnDE8EYB0K57wRbdS",
    }
}

@router.post("/login")
def login(response: Response, login_data: LoginRequest) -> dict[str, str]:
    """
    Handle user login.

    Args:
        response (Response): The FastAPI response object.
        login_data (LoginSchema): The login data containing username and password.

    Returns:
        dict: A dictionary containing the access token and token type.
    """
    user = temp_fake_user.get(login_data.username)
    valid_password = verify_password(login_data.password, user["hash_password"]) if user else False

    if not user or not valid_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    token = create_access_token(data={"sub": user["username"]}, expires_delta=timedelta(minutes=30))

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,  # Set to True in production
        samesite="lax",
        max_age=1800,  # 30 minutes
        path="/",
    )
    return {"message": "Login successful"}
