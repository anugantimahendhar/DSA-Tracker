from typing import Optional, Dict, Any
from fastapi import Depends, Header
from app.core.security import verify_supabase_jwt
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.repositories.user_repository import user_repository


async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise UnauthorizedException("Missing or invalid Authorization header.")
    
    token = authorization.split(" ")[1]
    payload = verify_supabase_jwt(token)
    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("Invalid user payload: missing subject claim.")
    
    user = await user_repository.get_by_id(user_id)
    if not user:
        email = payload.get("email", "user@dsatracker.dev")
        metadata = payload.get("user_metadata") or {}
        role = metadata.get("role") or "user"
        default_lang = metadata.get("default_language", "python")
        user = await user_repository.sync_or_create_profile(user_id=user_id, email=email, role=role, default_language=default_lang)

    return user


async def get_current_admin(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    if current_user.get("role") != "admin":
        raise ForbiddenException("Admin authorization required.")
    return current_user


async def get_optional_user(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        token = authorization.split(" ")[1]
        payload = verify_supabase_jwt(token)
        user_id = payload.get("sub")
        if user_id:
            user = await user_repository.get_by_id(user_id)
            if not user:
                email = payload.get("email", "user@dsatracker.dev")
                metadata = payload.get("user_metadata") or {}
                role = metadata.get("role") or payload.get("role") or "user"
                default_lang = metadata.get("default_language", "python")
                user = await user_repository.sync_or_create_profile(user_id=user_id, email=email, role=role, default_language=default_lang)
            return user
    except Exception:
        return None
    return None