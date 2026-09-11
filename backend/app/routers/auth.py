import hashlib
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.postgres import User, ActivationToken, UserRole
from app.schemas import UserRegister, UserLogin, TokenResponse, UserOut, ActivateAccountPayload
from app.core.security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """
    User self-registration for Coach, Physiotherapist, Sports Scientist, and Admin.
    Athletes CANNOT self-register (rejected with a clear error message).
    """
    if user_in.role == UserRole.ATHLETE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Athletes cannot self-register. Your Coach must register your account and send an activation link."
        )

    email_clean = user_in.email.strip().lower()
    existing_user = db.query(User).filter(User.email.ilike(email_clean)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists."
        )
    
    hashed_pwd = hash_password(user_in.password.strip())
    user = User(
        name=user_in.name.strip(),
        email=email_clean,
        password=hashed_pwd,
        role=user_in.role,
        account_status="active",
        phone=getattr(user_in, 'phone', None),
        profile_image=getattr(user_in, 'profile_image', None)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token_data = {"user_id": str(user.user_id), "role": user.role.value}
    access_token = create_access_token(data=token_data)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user
    )

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    User login.
    If account_status is "pending_activation", rejects with a clear activation error.
    """
    email_clean = credentials.email.strip().lower()
    user = db.query(User).filter(User.email.ilike(email_clean)).first()

    if not user or not verify_password(credentials.password.strip(), user.password or ""):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password. Please verify your credentials."
        )
    
    if user.account_status == "pending_activation":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account not yet activated — check your activation link or ask your Coach to resend it."
        )

    token_data = {"user_id": str(user.user_id), "role": user.role.value}
    access_token = create_access_token(data=token_data)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user
    )

@router.get("/verify-token")
def verify_activation_token(token: str, db: Session = Depends(get_db)):
    """
    Public token validation endpoint.
    Checks if token is valid, unused, and not expired (> 48 hours).
    Parses full activation URLs or raw token strings.
    """
    token_str = token.strip()
    if not token_str:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token parameter is required."
        )

    # Extract token if user passed a full URL e.g. http://localhost:3000/activate?token=XYZ
    if "token=" in token_str:
        token_str = token_str.split("token=")[-1].split("&")[0]

    token_hash = hashlib.sha256(token_str.encode()).hexdigest()
    act_token = db.query(ActivationToken).filter(ActivationToken.token_hash == token_hash).first()

    if not act_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid activation link or code. Please check the code or ask your Coach to resend a new link."
        )

    user = db.query(User).filter(User.user_id == act_token.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated athlete account not found."
        )

    # Check if already activated
    if act_token.used_at is not None or user.account_status == "active":
        return {
            "valid": False,
            "already_activated": True,
            "email": user.email,
            "name": user.name,
            "message": "Account is already activated! Password has been created for this account.",
            "extracted_token": token_str
        }

    if act_token.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This activation link expired after 48 hours. Access Denied. Please ask your coach to resend a new activation link."
        )

    return {
        "valid": True,
        "already_activated": False,
        "email": user.email,
        "name": user.name,
        "expires_at": act_token.expires_at.isoformat(),
        "extracted_token": token_str
    }

@router.post("/activate")
def activate_account(payload: ActivateAccountPayload, db: Session = Depends(get_db)):
    """
    Public activation endpoint. Accepts token & new_password.
    Validates token expiration and single-use status.
    """
    token_str = payload.token.strip()
    if "token=" in token_str:
        token_str = token_str.split("token=")[-1].split("&")[0]

    if not token_str:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Activation token is required."
        )
    
    if len(payload.new_password.strip()) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    token_hash = hashlib.sha256(token_str.encode()).hexdigest()
    act_token = db.query(ActivationToken).filter(ActivationToken.token_hash == token_hash).first()

    if not act_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid activation token."
        )

    user = db.query(User).filter(User.user_id == act_token.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account associated with this token was not found."
        )

    if act_token.used_at is not None or user.account_status == "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is already activated. Password has already been set — please sign in."
        )

    if act_token.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This activation link has expired after 48 hours. Please ask your coach to issue a new activation link."
        )

    # Activate account & store hashed password
    user.password = hash_password(payload.new_password.strip())
    user.account_status = "active"
    act_token.used_at = datetime.utcnow()

    db.commit()

    return {
        "message": "Account activated successfully! You may now sign in with your new password.",
        "email": user.email
    }

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
