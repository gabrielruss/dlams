"""
admin_routes.py
Admin-only user management: list users, deactivate and reactivate accounts,
and switch an account between the `user` and `demo` roles.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.schemas import (
    AdminUserListResponse,
    AdminUserResponse,
    AdminUserRoleUpdate,
)
from app.auth.utils import get_current_user, require_admin
from app.models import User, UserRole
from app.utils import get_db

router = APIRouter(prefix="/admin/users", tags=["admin"])


def _get_user_or_404(db: Session, user_id: int) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


@router.get("", response_model=AdminUserListResponse)
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AdminUserListResponse:
    """List every account. Admin only."""
    require_admin(current_user)
    users = db.scalars(select(User).order_by(User.username)).all()
    return AdminUserListResponse(
        users=[AdminUserResponse.model_validate(user) for user in users]
    )


@router.post("/{user_id}/deactivate", response_model=AdminUserResponse)
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AdminUserResponse:
    """Block a user from logging in and from using existing sessions."""
    require_admin(current_user)
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own account",
        )
    user = _get_user_or_404(db, user_id)
    user.is_active = False
    db.commit()
    return AdminUserResponse.model_validate(user)


@router.post("/{user_id}/activate", response_model=AdminUserResponse)
def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AdminUserResponse:
    """Restore a deactivated user's access."""
    require_admin(current_user)
    user = _get_user_or_404(db, user_id)
    user.is_active = True
    db.commit()
    return AdminUserResponse.model_validate(user)


@router.put("/{user_id}/role", response_model=AdminUserResponse)
def set_user_role(
    user_id: int,
    request: AdminUserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AdminUserResponse:
    """Switch an account between regular and demo. Demo accounts can only read."""
    require_admin(current_user)
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot change your own role",
        )
    user = _get_user_or_404(db, user_id)
    if user.role == UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin accounts cannot be changed here",
        )
    if user.role == UserRole.SANDBOX.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Demo session accounts cannot be changed here",
        )
    user.role = request.role
    db.commit()
    return AdminUserResponse.model_validate(user)
