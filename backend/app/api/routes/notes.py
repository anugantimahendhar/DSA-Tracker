from typing import Dict, Any
from fastapi import APIRouter, Depends
from app.api.dependencies import get_current_user
from app.repositories.note_repository import note_repository
from app.schemas.note import NoteSaveRequest, NoteResponse

router = APIRouter(prefix="/notes", tags=["Notes"])


@router.get("/{question_id}", response_model=NoteResponse)
async def get_note(
    question_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    note = await note_repository.get_note(current_user["id"], question_id)
    if not note:
        return NoteResponse(question_id=question_id, content="", updated_at="")
    return NoteResponse(
        question_id=question_id,
        content=note.get("content", ""),
        updated_at=note.get("updated_at", "")
    )


@router.post("", response_model=NoteResponse)
async def save_note(
    req: NoteSaveRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    saved = await note_repository.save_note(current_user["id"], req.question_id, req.content)
    return NoteResponse(
        question_id=req.question_id,
        content=saved.get("content", ""),
        updated_at=saved.get("updated_at", "")
    )