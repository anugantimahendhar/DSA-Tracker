import uuid
import jwt
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from app.integrations.supabase_client import supabase_service
from app.core.security import DEV_JWT_SECRET


class UserRepository:
    def __init__(self):
        self.service = supabase_service

    async def get_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        if not self.service.is_mock and self.service._admin_client:
            try:
                res = self.service._admin_client.table("profiles").select("*").eq("id", user_id).single().execute()
                return res.data
            except Exception:
                return None
        return self.service._mock_profiles.get(user_id)

    async def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        if not self.service.is_mock and self.service._admin_client:
            try:
                res = self.service._admin_client.table("profiles").select("*").eq("email", email).single().execute()
                return res.data
            except Exception:
                return None
        for prof in self.service._mock_profiles.values():
            if prof.get("email", "").lower() == email.lower():
                return prof
        return None

    async def sync_or_create_profile(self, user_id: str, email: str, role: str = "user", default_language: str = "python") -> Dict[str, Any]:
        existing = await self.get_by_id(user_id)
        if existing:
            return existing
        
        if not self.service.is_mock and self.service._admin_client:
            try:
                prof_data = {
                    "id": user_id,
                    "email": email,
                    "role": role,
                    "default_language": default_language,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
                res = self.service._admin_client.table("profiles").upsert(prof_data).execute()
                if res.data:
                    return res.data[0]
            except Exception:
                pass

        profile = {
            "id": user_id,
            "email": email,
            "role": role,
            "default_language": default_language,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        self.service._mock_profiles[user_id] = profile
        return profile

    async def create_user(self, email: str, password: str, role: str = "user", default_language: str = "python") -> Dict[str, Any]:
        if not self.service.is_mock and self.service._admin_client:
            auth_res = self.service._admin_client.auth.admin.create_user({
                "email": email,
                "password": password,
                "email_confirm": True,
                "user_metadata": {"role": role, "default_language": default_language}
            })
            user_id = auth_res.user.id
            prof_res = self.service._admin_client.table("profiles").select("*").eq("id", user_id).single().execute()
            return prof_res.data
        
        user_id = str(uuid.uuid4())
        profile = {
            "id": user_id,
            "email": email,
            "role": role,
            "default_language": default_language,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        self.service._mock_profiles[user_id] = profile
        self.service._mock_users[email.lower()] = {
            "id": user_id,
            "password": password,
            "profile": profile
        }
        return profile

    async def authenticate(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        if not self.service.is_mock and self.service._anon_client:
            try:
                res = self.service._anon_client.auth.sign_in_with_password({"email": email, "password": password})
                if res.user:
                    prof = await self.get_by_id(res.user.id)
                    return {"user": prof, "session": {"access_token": res.session.access_token if res.session else ""}}
            except Exception:
                return None
        
        user_entry = self.service._mock_users.get(email.lower())
        if user_entry and user_entry.get("password") == password:
            profile = user_entry["profile"]
            token = jwt.encode(
                {"sub": profile["id"], "email": profile["email"], "role": profile["role"]},
                DEV_JWT_SECRET,
                algorithm="HS256"
            )
            return {"user": profile, "session": {"access_token": token}}
        return None

    async def update_profile(self, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        if not self.service.is_mock and self.service._admin_client:
            res = self.service._admin_client.table("profiles").update(updates).eq("id", user_id).execute()
            return res.data[0] if res.data else None
        
        if user_id in self.service._mock_profiles:
            self.service._mock_profiles[user_id].update(updates)
            return self.service._mock_profiles[user_id]
        return None


user_repository = UserRepository()