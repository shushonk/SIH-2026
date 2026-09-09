from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import uuid
from datetime import datetime
from app.database import query_db, execute_db
from app.auth.security import hash_password, verify_password, create_access_token
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

ROLE_MAP = {
    "farmer": "role_farmer",
    "expert": "role_expert",
    "officer": "role_officer",
    "admin": "role_admin"
}

ROLE_NAMES = {
    "role_farmer": "Farmer",
    "role_expert": "Expert",
    "role_officer": "Officer",
    "role_admin": "Admin"
}


class SignupRequest(BaseModel):
    name: str
    email: str
    phone: Optional[str] = "+91 98000 00000"
    password: str
    role: str  # Farmer, Expert, Officer (Admin is not self-service)


class LoginRequest(BaseModel):
    identifier: str  # email or phone
    password: str


class DemoLoginRequest(BaseModel):
    role: str  # Farmer, Expert, Officer, Admin


class ForgotPasswordRequest(BaseModel):
    identifier: str


@router.post("/signup")
def signup(req: SignupRequest):
    """
    Self-service signup for Farmer, Expert, or Officer.
    Admin accounts are strictly administrative and cannot be self-created.
    """
    role_key = req.role.strip().lower()
    if role_key == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin accounts cannot be self-registered. Please contact system operations."
        )

    role_id = ROLE_MAP.get(role_key)
    if not role_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Allowed roles: Farmer, Expert, Officer."
        )

    # Check existing user
    existing = query_db(
        "SELECT * FROM users WHERE email = ? OR phone = ?;",
        (req.email.strip().lower(), req.phone.strip()),
        one=True
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email or phone number already exists."
        )

    user_id = f"usr_{uuid.uuid4().hex[:8]}"
    pwd_hash = hash_password(req.password)
    avatar_url = f"https://ui-avatars.com/api/?name={req.name.replace(' ', '+')}&background=059669&color=fff"

    execute_db("""
        INSERT INTO users (user_id, name, email, phone, password_hash, role_id, avatar_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        user_id,
        req.name.strip(),
        req.email.strip().lower(),
        req.phone.strip(),
        pwd_hash,
        role_id,
        avatar_url,
        datetime.utcnow().isoformat()
    ))

    # Generate JWT
    role_display = ROLE_NAMES.get(role_id, "Farmer")
    token = create_access_token({
        "sub": user_id,
        "user_id": user_id,
        "name": req.name.strip(),
        "email": req.email.strip().lower(),
        "role": role_display
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "user_id": user_id,
            "name": req.name.strip(),
            "email": req.email.strip().lower(),
            "phone": req.phone.strip(),
            "role": role_display,
            "avatar_url": avatar_url
        }
    }


@router.post("/login")
def login(req: LoginRequest):
    """
    Authenticate user by email or phone + password.
    Returns signed PyJWT token with 7-day validity.
    """
    clean_id = req.identifier.strip().lower()
    user = query_db("""
        SELECT u.user_id, u.name, u.email, u.phone, u.password_hash, u.avatar_url, r.role_name as role
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE lower(u.email) = ? OR u.phone = ?;
    """, (clean_id, clean_id), one=True)

    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please verify your email/phone and password."
        )

    token = create_access_token({
        "sub": user["user_id"],
        "user_id": user["user_id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"]
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "user_id": user["user_id"],
            "name": user["name"],
            "email": user["email"],
            "phone": user["phone"],
            "role": user["role"],
            "avatar_url": user["avatar_url"]
        }
    }


@router.post("/demo-login")
def demo_login(req: DemoLoginRequest):
    """
    1-Click Demo Login for hackathon judges:
    Authenticates directly into seeded accounts with a fully-signed, real cryptographic JWT token.
    """
    target_role = req.role.strip().capitalize()
    role_email_map = {
        "Farmer": "farmer@krishiraksha.org",
        "Expert": "expert@krishiraksha.org",
        "Officer": "officer@krishiraksha.org",
        "Admin": "admin@krishiraksha.gov.in"
    }
    target_email = role_email_map.get(target_role, "farmer@krishiraksha.org")

    user = query_db("""
        SELECT u.user_id, u.name, u.email, u.phone, u.avatar_url, r.role_name as role
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE lower(u.email) = ?;
    """, (target_email,), one=True)

    if not user:
        raise HTTPException(status_code=404, detail="Demo account not found")

    token = create_access_token({
        "sub": user["user_id"],
        "user_id": user["user_id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"]
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "user_id": user["user_id"],
            "name": user["name"],
            "email": user["email"],
            "phone": user["phone"],
            "role": user["role"],
            "avatar_url": user["avatar_url"]
        }
    }


@router.get("/me")
def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Return the profile of the currently verified JWT token bearer."""
    return current_user


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    """
    Stubbed password reset flow:
    Validates user existence and simulates sending a secure reset link.
    """
    clean_id = req.identifier.strip().lower()
    user = query_db("""
        SELECT user_id, email, name FROM users
        WHERE lower(email) = ? OR phone = ?;
    """, (clean_id, clean_id), one=True)

    if not user:
        # Avoid user enumeration in production; return generic confirmation
        return {
            "success": True,
            "message": "If an account exists with this identifier, a password reset instruction has been dispatched."
        }

    return {
        "success": True,
        "message": f"Password reset instructions have been dispatched to {user['email']}.",
        "reset_token_simulated": f"rst_{uuid.uuid4().hex[:12]}"
    }


@router.get("/roles")
def list_available_roles():
    """List role taxonomy for registration forms."""
    return [
        {"id": "Farmer", "label": "Farmer (Cultivator)", "description": "Observation submission, plot health passport, and IPM next steps."},
        {"id": "Expert", "label": "Agricultural Expert (ICAR / Agronomist)", "description": "Uncertainty case triage, differential review, and ground-truth verification."},
        {"id": "Officer", "label": "Extension / Government Officer", "description": "Regional outbreak clusters, ranked inspection queues, and intervention tracking."}
    ]
