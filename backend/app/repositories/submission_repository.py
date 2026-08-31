import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from app.integrations.supabase_client import supabase_service


class SubmissionRepository:
    def __init__(self):
        self.service = supabase_service

    async def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        data["id"] = str(uuid.uuid4())
        data["created_at"] = datetime.now(timezone.utc).isoformat()

        if not self.service.is_mock and self.service._admin_client:
            res = self.service._admin_client.table("submissions").insert(data).execute()
            return res.data[0]

        self.service._mock_submissions.append(data)
        return data

    async def list_by_user(self, user_id: str, question_id: Optional[str] = None, limit: int = 20) -> List[Dict[str, Any]]:
        if not self.service.is_mock and self.service._admin_client:
            query = self.service._admin_client.table("submissions").select("*").eq("user_id", user_id)
            if question_id:
                query = query.eq("question_id", question_id)
            query = query.order("created_at", desc=True).limit(limit)
            res = query.execute()
            return res.data or []

        res = [s for s in self.service._mock_submissions if s.get("user_id") == user_id]
        if question_id:
            res = [s for s in res if s.get("question_id") == question_id]
        res.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return res[:limit]

    async def get_by_id(self, submission_id: str) -> Optional[Dict[str, Any]]:
        if not self.service.is_mock and self.service._admin_client:
            try:
                res = self.service._admin_client.table("submissions").select("*").eq("id", submission_id).single().execute()
                return res.data
            except Exception:
                return None

        for s in self.service._mock_submissions:
            if s.get("id") == submission_id:
                return s
        return None

    async def get_failed_count_recent(self, user_id: str, question_id: str) -> int:
        submissions = await self.list_by_user(user_id=user_id, question_id=question_id, limit=5)
        failed = [s for s in submissions if s.get("status") != "Accepted"]
        return len(failed)


submission_repository = SubmissionRepository()