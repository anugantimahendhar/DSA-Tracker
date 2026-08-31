from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from app.api.dependencies import get_current_user
from app.services.revision_service import revision_service
from app.repositories.revision_repository import revision_repository
from app.schemas.revision import RevisionItem, RevisionUpdateRequest

router = APIRouter(prefix="/revision", tags=["Revision Queue"])


@router.get("", response_model=List[RevisionItem])
async def list_revision_queue(current_user: Dict[str, Any] = Depends(get_current_user)):
    return await revision_service.list_revision_queue(current_user["id"])


@router.post("/status", response_model=RevisionItem)
async def update_revision_status(
    req: RevisionUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    await revision_repository.update_status(
        user_id=current_user["id"],
        question_id=req.question_id,
        status=req.status,
        due_date=req.due_date
    )
    items = await revision_service.list_revision_queue(current_user["id"])
    for it in items:
        if it.question_id == req.question_id:
            return it
    return items[0] if items else None