from typing import Dict, Any
from fastapi import APIRouter, Depends
from app.api.dependencies import get_current_user
from app.repositories.notification_repository import notification_repository

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("")
async def get_notifications(current_user: Dict[str, Any] = Depends(get_current_user)):
    return await notification_repository.get_for_user(current_user["id"])

@router.put("/read-all")
async def mark_all_notifications_read(current_user: Dict[str, Any] = Depends(get_current_user)):
    await notification_repository.mark_all_read(current_user["id"])
    return {"message": "All notifications marked as read"}

@router.put("/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    return await notification_repository.mark_read(notification_id, current_user["id"])
