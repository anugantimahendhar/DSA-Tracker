from typing import Dict, Any
from fastapi import APIRouter, Depends
from app.api.dependencies import get_current_user
from app.services.progress_service import progress_service
from app.repositories.progress_repository import progress_repository
from app.schemas.progress import UserProgressSummary

router = APIRouter(prefix="/progress", tags=["User Progress"])


@router.get("", response_model=UserProgressSummary)
async def get_progress_summary(current_user: Dict[str, Any] = Depends(get_current_user)):
    return await progress_service.get_summary(current_user["id"])


@router.get("/{question_id}")
async def get_question_progress(
    question_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    prog = await progress_repository.get_progress(current_user["id"], question_id)
    if not prog:
        return {"status": "NOT_STARTED", "attempts_count": 0}
    return prog