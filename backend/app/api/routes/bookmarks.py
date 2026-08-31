from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from app.api.dependencies import get_current_user
from app.repositories.bookmark_repository import bookmark_repository
from app.schemas.bookmark import BookmarkToggleResponse

router = APIRouter(prefix="/bookmarks", tags=["Bookmarks"])


@router.get("", response_model=List[str])
async def list_bookmarked_ids(current_user: Dict[str, Any] = Depends(get_current_user)):
    return await bookmark_repository.list_by_user(current_user["id"])


@router.post("/{question_id}", response_model=BookmarkToggleResponse)
async def toggle_bookmark(
    question_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    is_bm = await bookmark_repository.toggle(current_user["id"], question_id)
    return BookmarkToggleResponse(question_id=question_id, is_bookmarked=is_bm)