import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from app.integrations.supabase_client import supabase_service


class BookmarkRepository:
    def __init__(self):
        self.service = supabase_service

    async def list_by_user(self, user_id: str) -> List[str]:
        """Returns list of question_ids bookmarked by user"""
        if not self.service.is_mock and self.service._admin_client:
            res = self.service._admin_client.table("bookmarks").select("question_id").eq("user_id", user_id).execute()
            return [r["question_id"] for r in res.data or []]

        return [b["question_id"] for b in self.service._mock_bookmarks.values() if b.get("user_id") == user_id]

    async def is_bookmarked(self, user_id: str, question_id: str) -> bool:
        if not self.service.is_mock and self.service._admin_client:
            res = self.service._admin_client.table("bookmarks").select("id").eq("user_id", user_id).eq("question_id", question_id).execute()
            return bool(res.data)

        key = f"{user_id}_{question_id}"
        return key in self.service._mock_bookmarks

    async def toggle(self, user_id: str, question_id: str) -> bool:
        """Toggles bookmark status. Returns True if now bookmarked, False if unbookmarked"""
        now_bookmarked = not await self.is_bookmarked(user_id, question_id)
        key = f"{user_id}_{question_id}"

        if not self.service.is_mock and self.service._admin_client:
            if now_bookmarked:
                self.service._admin_client.table("bookmarks").insert({"user_id": user_id, "question_id": question_id}).execute()
            else:
                self.service._admin_client.table("bookmarks").delete().eq("user_id", user_id).eq("question_id", question_id).execute()
            return now_bookmarked

        if now_bookmarked:
            self.service._mock_bookmarks[key] = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "question_id": question_id,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        else:
            self.service._mock_bookmarks.pop(key, None)
        return now_bookmarked


bookmark_repository = BookmarkRepository()