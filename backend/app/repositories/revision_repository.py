import uuid
from datetime import datetime, date, timedelta, timezone
from typing import List, Dict, Any, Optional
from app.integrations.supabase_client import supabase_service


class RevisionRepository:
    def __init__(self):
        self.service = supabase_service

    async def list_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        if not self.service.is_mock and self.service._admin_client:
            res = self.service._admin_client.table("revisions").select("*").eq("user_id", user_id).order("due_date").execute()
            return res.data or []

        res = [r for r in self.service._mock_revisions.values() if r.get("user_id") == user_id]
        res.sort(key=lambda x: x.get("due_date", ""))
        return res

    async def get_revision(self, user_id: str, question_id: str) -> Optional[Dict[str, Any]]:
        if not self.service.is_mock and self.service._admin_client:
            try:
                res = self.service._admin_client.table("revisions").select("*").eq("user_id", user_id).eq("question_id", question_id).single().execute()
                return res.data
            except Exception:
                return None

        key = f"{user_id}_{question_id}"
        return self.service._mock_revisions.get(key)

    async def update_status(self, user_id: str, question_id: str, status: str, due_date: Optional[str] = None) -> Dict[str, Any]:
        now = datetime.now(timezone.utc).isoformat()
        if not due_date:
            # Default due dates based on status
            today = date.today()
            if status == "Needs Revision":
                due_date = str(today + timedelta(days=1))
            elif status == "Comfortable":
                due_date = str(today + timedelta(days=3))
            else: # Mastered
                due_date = str(today + timedelta(days=7))

        if not self.service.is_mock and self.service._admin_client:
            res = self.service._admin_client.table("revisions").upsert({
                "user_id": user_id,
                "question_id": question_id,
                "status": status,
                "due_date": due_date,
                "last_reviewed_at": now,
                "updated_at": now
            }, on_conflict="user_id,question_id").execute()
            return res.data[0]

        key = f"{user_id}_{question_id}"
        rev = {
            "id": self.service._mock_revisions.get(key, {}).get("id", str(uuid.uuid4())),
            "user_id": user_id,
            "question_id": question_id,
            "status": status,
            "due_date": due_date,
            "last_reviewed_at": now,
            "created_at": self.service._mock_revisions.get(key, {}).get("created_at", now),
            "updated_at": now
        }
        self.service._mock_revisions[key] = rev
        return rev


revision_repository = RevisionRepository()