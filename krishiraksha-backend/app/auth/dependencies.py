from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional, Dict, Any
from app.auth.security import decode_access_token
from app.database import query_db

security_scheme = HTTPBearer(auto_error=False)


def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)) -> Dict[str, Any]:
    """
    Validates the Bearer JWT token from the Authorization header
    and returns the authenticated user payload.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user_id = payload.get("sub") or payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed access token.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user = query_db("""
        SELECT u.user_id, u.name, u.email, u.phone, u.avatar_url, r.role_name as role
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = ?;
    """, (user_id,), one=True)

    if not user:
        # Fallback to payload claims if database was freshly reset in demo
        return {
            "user_id": user_id,
            "name": payload.get("name", "User"),
            "email": payload.get("email", ""),
            "role": payload.get("role", "Farmer")
        }

    return dict(user)


def require_role(allowed_roles: List[str]):
    """
    Dependency factory to enforce server-side Role-Based Access Control (RBAC).
    Raises HTTP 403 Forbidden if user's role is not in allowed_roles.
    """
    def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = current_user.get("role")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of roles {allowed_roles}, but current role is '{user_role}'"
            )
        return current_user

    return role_checker
