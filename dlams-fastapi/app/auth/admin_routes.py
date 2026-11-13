"""
admin_routes.py
Admin-only user management: list users, deactivate and reactivate accounts,
switch an account between the `user` and `template` roles, and reset passwords.
"""

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.schemas import (
    AdminPasswordReset,
    AdminUserListResponse,
    AdminUserResponse,
    AdminUserRoleUpdate,
)
from app.auth.utils import CurrentUserDep, pwd_context, require_admin
from app.models import User, UserRole
from app.utils import DbSessionDep

admin_users_router = APIRouter(prefix="/admin/users", tags=["admin"])


def _get_user_or_404(db: Session, user_id: int) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


@admin_users_router.get("")
def list_users(
    db: DbSessionDep,
    current_user: CurrentUserDep,
) -> AdminUserListResponse:
    """List every account. Admin only."""
    require_admin(current_user)
    users = db.scalars(select(User).order_by(User.username)).all()
    return AdminUserListResponse(
        users=[AdminUserResponse.model_validate(user) for user in users]
    )


@admin_users_router.post("/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    db: DbSessionDep,
    current_user: CurrentUserDep,
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


@admin_users_router.post("/{user_id}/activate")
def activate_user(
    user_id: int,
    db: DbSessionDep,
    current_user: CurrentUserDep,
) -> AdminUserResponse:
    """Restore a deactivated user's access."""
    require_admin(current_user)
    user = _get_user_or_404(db, user_id)
    user.is_active = True
    db.commit()
    return AdminUserResponse.model_validate(user)


@admin_users_router.put("/{user_id}/role")
def set_user_role(
    user_id: int,
    request: AdminUserRoleUpdate,
    db: DbSessionDep,
    current_user: CurrentUserDep,
) -> AdminUserResponse:
    """Switch an account between regular and template. Templates can only read."""
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


@admin_users_router.put("/{user_id}/password")
def reset_user_password(
    user_id: int,
    request: AdminPasswordReset,
    db: DbSessionDep,
    current_user: CurrentUserDep,
) -> AdminUserResponse:
    """Set a new password for a regular, template, or the admin's own account."""
    require_admin(current_user)
    user = _get_user_or_404(db, user_id)
    if user.role == UserRole.ADMIN.value and user.id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin accounts cannot be changed here",
        )
    if user.role == UserRole.SANDBOX.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Demo session accounts cannot be changed here",
        )
    user.hashed_password = pwd_context.hash(request.password)
    db.commit()
    return AdminUserResponse.model_validate(user)
