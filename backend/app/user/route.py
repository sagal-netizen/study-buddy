from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.security import create_access_token

from .repository import (
    create_user,
    get_user_by_email,
    get_user_by_id,
    get_all_users,
    delete_user,
    update_user_role,
    verify_password,
)


router = APIRouter()


# =========================
# DATABASE DEPENDENCY
# =========================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================
# DATA MODELS
# =========================

class RegisterUser(BaseModel):
    name: str
    email: str
    password: str
    role: str = "student"


class LoginUser(BaseModel):
    email: str
    password: str


class UpdateRole(BaseModel):
    role: str


# =========================
# REGISTER
# =========================

@router.post("/users/register")
def register_user(
    user: RegisterUser,
    db: Session = Depends(get_db)
):
    existing_user = get_user_by_email(
        db,
        user.email
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    if user.role not in ["student", "admin"]:
        raise HTTPException(
            status_code=400,
            detail="Role must be student or admin"
        )

    new_user = create_user(
        db,
        user.name,
        user.email,
        user.password,
        user.role
    )

    return {
        "message": "User registered successfully",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role
        }
    }


# =========================
# LOGIN
# =========================

@router.post("/users/login")
def login_user(
    user: LoginUser,
    db: Session = Depends(get_db)
):
    existing_user = get_user_by_email(
        db,
        user.email
    )

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    password_valid = verify_password(
        user.password,
        existing_user.password
    )

    if not password_valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token_data = {
        "user_id": existing_user.id,
        "email": existing_user.email,
        "role": existing_user.role
    }

    access_token = create_access_token(
        token_data
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": existing_user.id,
            "name": existing_user.name,
            "email": existing_user.email,
            "role": existing_user.role
        }
    }


# =========================
# GET ALL USERS
# =========================

@router.get("/users")
def list_users(
    db: Session = Depends(get_db)
):
    users = get_all_users(db)

    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
        for user in users
    ]


# =========================
# GET SINGLE USER
# =========================

@router.get("/users/{user_id}")
def get_single_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = get_user_by_id(
        db,
        user_id
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    }


# =========================
# UPDATE USER ROLE
# =========================

@router.put("/users/{user_id}/role")
def change_user_role(
    user_id: int,
    data: UpdateRole,
    db: Session = Depends(get_db)
):
    if data.role not in [
        "student",
        "admin"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Role must be student or admin"
        )

    user = update_user_role(
        db,
        user_id,
        data.role
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "message": "User role updated successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }


# =========================
# DELETE USER
# =========================

@router.delete("/users/{user_id}")
def remove_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = delete_user(
        db,
        user_id
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "message": "User deleted successfully"
    }