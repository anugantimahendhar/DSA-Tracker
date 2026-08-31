from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from app.api.dependencies import get_optional_user
from app.services.question_service import question_service
from app.schemas.question import QuestionListItem, QuestionDetailResponse

router = APIRouter(prefix="/questions", tags=["Questions"])


@router.get("", response_model=List[QuestionListItem])
async def list_questions(
    difficulty: Optional[str] = Query(None),
    topic: Optional[str] = Query(None),
    pattern: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    user_status: Optional[str] = Query(None),
    bookmarked_only: bool = Query(False),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    user_id = current_user.get("id") if current_user else None
    return await question_service.list_questions(
        user_id=user_id,
        difficulty=difficulty,
        topic=topic,
        pattern=pattern,
        search=search,
        user_status=user_status,
        bookmarked_only=bookmarked_only,
        limit=limit,
        offset=offset
    )


@router.get("/{question_id}", response_model=QuestionDetailResponse)
async def get_question(
    question_id: str,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    user_id = current_user.get("id") if current_user else None
    is_admin = (current_user.get("role") == "admin") if current_user else False
    return await question_service.get_question_detail(question_id, user_id=user_id, is_admin=is_admin)