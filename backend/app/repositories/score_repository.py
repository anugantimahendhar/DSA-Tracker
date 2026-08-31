import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.integrations.supabase_client import supabase_service


class ScoreRepository:
    def __init__(self):
        self.service = supabase_service
        if not hasattr(self.service, "_mock_ai_scores"):
            self.service._mock_ai_scores = []

    async def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        payload = dict(data)
        payload["id"] = str(uuid.uuid4())
        payload["created_at"] = datetime.now(timezone.utc).isoformat()
        if not self.service.is_mock and self.service._admin_client:
            try:
                res = self.service._admin_client.table("ai_submission_scores").insert(payload).execute()
                return res.data[0]
            except Exception:
                # Keep the app functional if the optional migration has not been applied yet.
                pass
        self.service._mock_ai_scores.append(payload)
        return payload

    async def list_all(self) -> List[Dict[str, Any]]:
        if not self.service.is_mock and self.service._admin_client:
            try:
                res = self.service._admin_client.table("ai_submission_scores").select("*").order("created_at", desc=True).execute()
                return res.data or []
            except Exception:
                pass
        return list(self.service._mock_ai_scores)

    async def list_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        scores = await self.list_all()
        return [s for s in scores if s.get("user_id") == user_id]

    async def get_by_submission(self, submission_id: str) -> Optional[Dict[str, Any]]:
        scores = await self.list_all()
        return next((s for s in scores if s.get("submission_id") == submission_id), None)


score_repository = ScoreRepository()
