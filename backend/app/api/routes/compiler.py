from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Query
from app.api.dependencies import get_current_user
from app.services.execution_service import execution_service
from app.repositories.draft_repository import draft_repository
from app.schemas.compiler import (
    CodeRunRequest,
    CodeRunResponse,
    CodeSubmitRequest,
    CodeSubmitResponse,
    DraftSaveRequest,
    DraftResponse
)

router = APIRouter(prefix="/code", tags=["Compiler & Execution"])


@router.post("/run", response_model=CodeRunResponse)
async def run_code(
    req: CodeRunRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    return await execution_service.run_visible_tests(
        user_id=current_user["id"],
        question_id=req.question_id,
        language=req.language,
        code=req.code
    )


@router.post("/submit", response_model=CodeSubmitResponse)
async def submit_code(
    req: CodeSubmitRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    return await execution_service.submit_code(
        user_id=current_user["id"],
        question_id=req.question_id,
        language=req.language,
        code=req.code
    )


@router.post("/drafts", response_model=DraftResponse)
async def save_draft(
    req: DraftSaveRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    draft = await draft_repository.save_draft(
        user_id=current_user["id"],
        question_id=req.question_id,
        language=req.language,
        code=req.code
    )
    return DraftResponse(
        question_id=draft["question_id"],
        language=draft["language"],
        code=draft["code"],
        updated_at=draft.get("updated_at", "")
    )


@router.get("/drafts/{question_id}")
async def get_draft(
    question_id: str,
    language: str = Query(..., description="Programming language of the draft"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    draft = await draft_repository.get_draft(
        user_id=current_user["id"],
        question_id=question_id,
        language=language
    )
    if not draft:
        return {"code": None, "language": language}
    return draft