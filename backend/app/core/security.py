import jwt
from typing import Dict, Any
from app.core.config import settings
from app.core.exceptions import UnauthorizedException

DEV_JWT_SECRET = "dsa-tracker-dev-jwt-secret-key-for-local-testing-32bytes"


def verify_supabase_jwt(token: str) -> Dict[str, Any]:
    """
    Verifies a Supabase JWT token.
    Decodes the claims and returns the payload dict.
    """
    try:
        from app.integrations.supabase_client import supabase_service
        
        if not supabase_service.is_mock and settings.SUPABASE_JWT_SECRET and "placeholder" not in settings.SUPABASE_JWT_SECRET and "your-supabase" not in settings.SUPABASE_JWT_SECRET:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False, "verify_signature": True}
            )
        else:
            # Local dev / mock mode
            try:
                payload = jwt.decode(
                    token,
                    DEV_JWT_SECRET,
                    algorithms=["HS256"],
                    options={"verify_aud": False, "verify_signature": True}
                )
            except Exception:
                payload = jwt.decode(
                    token,
                    options={"verify_signature": False, "verify_aud": False}
                )
        
        user_id = payload.get("sub") or payload.get("id")
        if not user_id:
            raise UnauthorizedException("Invalid token: missing subject claim.")
        return payload
    except Exception as e:
        if isinstance(e, UnauthorizedException):
            raise e
        raise UnauthorizedException(f"Could not validate credentials: {str(e)}")