import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from app.integrations.supabase_client import supabase_service


class NoteRepository:
    def __init__(self):
        self.service = supabase_service

    async def get_note(self, user_id: str, question_id: str) -> Optional[Dict[str, Any]]:
        if not self.service.is_mock and self.service._admin_client:
            try:
                res = self.service._admin_client.table("notes").select("*").eq("user_id", user_id).eq("question_id", question_id).single().execute()
                return res.data
            except Exception:
                return None

        key = f"{user_id}_{question_id}"
        return self.service._mock_notes.get(key)

    async def save_note(self, user_id: str, question_id: str, content: str) -> Dict[str, Any]:
        now = datetime.now(timezone.utc).isoformat()
        if not self.service.is_mock and self.service._admin_client:
            res = self.service._admin_client.table("notes").upsert({
                "user_id": user_id,
                "question_id": question_id,
                "content": content,
                "updated_at": now
            }, on_conflict="user_id,question_id").execute()
            return res.data[0]

        key = f"{user_id}_{question_id}"
        note = {
            "id": self.service._mock_notes.get(key, {}).get("id", str(uuid.uuid4())),
            "user_id": user_id,
            "question_id": question_id,
            "content": content,
            "created_at": self.service._mock_notes.get(key, {}).get("created_at", now),
            "updated_at": now
        }
        self.service._mock_notes[key] = note
        return note


note_repository = NoteRepository()