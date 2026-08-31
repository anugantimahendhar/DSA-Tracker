import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from app.integrations.supabase_client import supabase_service


class DraftRepository:
    def __init__(self):
        self.service = supabase_service

    async def get_draft(self, user_id: str, question_id: str, language: str) -> Optional[Dict[str, Any]]:
        if not self.service.is_mock and self.service._admin_client:
            try:
                res = self.service._admin_client.table("code_drafts").select("*")\
                    .eq("user_id", user_id)\
                    .eq("question_id", question_id)\
                    .eq("language", language)\
                    .single().execute()
                return res.data
            except Exception:
                return None
        
        key = f"{user_id}_{question_id}_{language}"
        return self.service._mock_drafts.get(key)

    async def save_draft(self, user_id: str, question_id: str, language: str, code: str) -> Dict[str, Any]:
        now = datetime.now(timezone.utc).isoformat()
        if not self.service.is_mock and self.service._admin_client:
            data = {
                "user_id": user_id,
                "question_id": question_id,
                "language": language,
                "code": code,
                "updated_at": now
            }
            res = self.service._admin_client.table("code_drafts").upsert(
                data, on_conflict="user_id,question_id,language"
            ).execute()
            return res.data[0]

        key = f"{user_id}_{question_id}_{language}"
        draft = {
            "id": self.service._mock_drafts.get(key, {}).get("id", str(uuid.uuid4())),
            "user_id": user_id,
            "question_id": question_id,
            "language": language,
            "code": code,
            "updated_at": now
        }
        self.service._mock_drafts[key] = draft
        return draft


draft_repository = DraftRepository()