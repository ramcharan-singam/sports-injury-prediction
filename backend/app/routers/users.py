from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.postgres import User, UserRole
from app.schemas import UserOut, UserRegister, UserUpdate
from app.core.security import hash_password, require_role

router = APIRouter(prefix="/api/users", tags=["Users (Admin Only)"])

@router.get("", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.ADMIN))
):
    """Admin and Coach endpoint: List user accounts for platform management & access grant selection."""
    return db.query(User).order_by(User.created_at.desc()).all()

@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user_account(
    user_in: UserRegister,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    """Admin-only endpoint: Create new user account."""
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address already registered."
        )
    
    hashed_pwd = hash_password(user_in.password)
    user = User(
        name=user_in.name,
        email=user_in.email,
        password=hashed_pwd,
        role=user_in.role,
        phone=user_in.phone,
        profile_image=user_in.profile_image
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/{user_id}", response_model=UserOut)
def get_user_account(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    """Admin-only endpoint: Fetch single user account."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.put("/{user_id}", response_model=UserOut)
def update_user_account(
    user_id: UUID,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    """Admin-only endpoint: Update user account details or role."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    update_data = user_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_account(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    """Admin-only endpoint: Deactivate/delete user account."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    db.delete(user)
    db.commit()
    return None
