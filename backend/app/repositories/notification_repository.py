import uuid
from typing import List, Dict, Any
from datetime import datetime, timezone
from app.integrations.supabase_client import supabase_service

class NotificationRepository:
    def __init__(self):
        self.service = supabase_service
        if not hasattr(self.service, "_mock_notifications"):
            self.service._mock_notifications = {}

    async def create(self, user_id: str, title: str, message: str, notification_type: str = "info", question_id: str | None = None, action_url: str | None = None) -> Dict[str, Any]:
        data = {"id": str(uuid.uuid4()), "user_id": user_id, "title": title, "message": message, "type": notification_type, "question_id": question_id, "action_url": action_url, "is_read": False, "created_at": datetime.now(timezone.utc).isoformat()}
        if not self.service.is_mock and self.service._admin_client:
            payload = {k: v for k, v in data.items() if k != "id"}
            res = self.service._admin_client.table("notifications").insert(payload).execute()
            return res.data[0]
        self.service._mock_notifications[data["id"]] = data
        return data

    async def get_for_user(self, user_id: str) -> List[Dict[str, Any]]:
        if not self.service.is_mock and self.service._admin_client:
            res = self.service._admin_client.table("notifications").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(50).execute()
            return res.data or []
        rows = [n for n in self.service._mock_notifications.values() if n.get("user_id") == user_id]
        return sorted(rows, key=lambda n: n.get("created_at", ""), reverse=True)[:50]

    async def mark_read(self, notification_id: str, user_id: str) -> Dict[str, Any] | None:
        if not self.service.is_mock and self.service._admin_client:
            res = self.service._admin_client.table("notifications").update({"is_read": True}).eq("id", notification_id).eq("user_id", user_id).execute()
            return res.data[0] if res.data else None
        item = self.service._mock_notifications.get(notification_id)
        if item and item.get("user_id") == user_id:
            item["is_read"] = True
            return item
        return None

    async def mark_all_read(self, user_id: str):
        if not self.service.is_mock and self.service._admin_client:
            self.service._admin_client.table("notifications").update({"is_read": True}).eq("user_id", user_id).eq("is_read", False).execute()
            return
        for item in self.service._mock_notifications.values():
            if item.get("user_id") == user_id:
                item["is_read"] = True

notification_repository = NotificationRepository()
