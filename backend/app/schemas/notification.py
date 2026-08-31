from pydantic import BaseModel
from typing import Optional


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str
    question_id: Optional[str] = None
    action_url: Optional[str] = None
    is_read: bool
    created_at: str


class MarkNotificationReadRequest(BaseModel):
    is_read: bool = True