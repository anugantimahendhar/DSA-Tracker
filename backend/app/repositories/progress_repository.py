import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from app.integrations.supabase_client import supabase_service


class ProgressRepository:
    def __init__(self):
        self.service = supabase_service

    async def get_progress(self, user_id: str, question_id: str) -> Optional[Dict[str, Any]]:
        if not self.service.is_mock and self.service._admin_client:
            try:
                res = self.service._admin_client.table("user_progress").select("*")\
                    .eq("user_id", user_id)\
                    .eq("question_id", question_id)\
                    .single().execute()
                return res.data
            except Exception:
                return None

        key = f"{user_id}_{question_id}"
        return self.service._mock_progress.get(key)

    async def list_user_progress(self, user_id: str) -> List[Dict[str, Any]]:
        if not self.service.is_mock and self.service._admin_client:
            res = self.service._admin_client.table("user_progress").select("*").eq("user_id", user_id).execute()
            return res.data or []

        return [p for p in self.service._mock_progress.values() if p.get("user_id") == user_id]

    async def mark_attempted(self, user_id: str, question_id: str) -> Dict[str, Any]:
        existing = await self.get_progress(user_id, question_id)
        now = datetime.now(timezone.utc).isoformat()
        
        if existing:
            # If already SOLVED, keep SOLVED, just increment attempts & update last_attempted_at
            status = existing.get("status", "ATTEMPTED")
            attempts = existing.get("attempts_count", 0) + 1
            updates = {
                "attempts_count": attempts,
                "last_attempted_at": now,
                "updated_at": now
            }
            if not self.service.is_mock and self.service._admin_client:
                res = self.service._admin_client.table("user_progress").update(updates).eq("id", existing["id"]).execute()
                return res.data[0]
            
            existing.update(updates)
            return existing
        
        # New record
        data = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "question_id": question_id,
            "status": "ATTEMPTED",
            "attempts_count": 1,
            "first_solved_at": None,
            "last_attempted_at": now,
            "created_at": now,
            "updated_at": now
        }
        if not self.service.is_mock and self.service._admin_client:
            res = self.service._admin_client.table("user_progress").insert(data).execute()
            return res.data[0]

        key = f"{user_id}_{question_id}"
        self.service._mock_progress[key] = data
        return data

    async def mark_solved(self, user_id: str, question_id: str) -> Dict[str, Any]:
        existing = await self.get_progress(user_id, question_id)
        now = datetime.now(timezone.utc).isoformat()

        if existing:
            attempts = existing.get("attempts_count", 0) + 1
            first_solved = existing.get("first_solved_at") or now
            updates = {
                "status": "SOLVED",
                "attempts_count": attempts,
                "first_solved_at": first_solved,
                "last_attempted_at": now,
                "updated_at": now
            }
            if not self.service.is_mock and self.service._admin_client:
                res = self.service._admin_client.table("user_progress").update(updates).eq("id", existing["id"]).execute()
                return res.data[0]

            existing.update(updates)
            return existing

        data = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "question_id": question_id,
            "status": "SOLVED",
            "attempts_count": 1,
            "first_solved_at": now,
            "last_attempted_at": now,
            "created_at": now,
            "updated_at": now
        }
        if not self.service.is_mock and self.service._admin_client:
            res = self.service._admin_client.table("user_progress").insert(data).execute()
            return res.data[0]

        key = f"{user_id}_{question_id}"
        self.service._mock_progress[key] = data
        return data


progress_repository = ProgressRepository()