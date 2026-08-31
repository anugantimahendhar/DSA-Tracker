from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from app.api.dependencies import get_current_user
from app.core.exceptions import NotFoundException, ForbiddenException
from app.repositories.submission_repository import submission_repository
from app.schemas.submission import SubmissionListItem, SubmissionDetailResponse

router = APIRouter(prefix="/submissions", tags=["Submissions"])


@router.get("/question/{question_id}", response_model=List[SubmissionListItem])
async def list_question_submissions(
    question_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    submissions = await submission_repository.list_by_user(
        user_id=current_user["id"],
        question_id=question_id,
        limit=20
    )
    return [SubmissionListItem(**s) for s in submissions]


@router.get("/{submission_id}", response_model=SubmissionDetailResponse)
async def get_submission(
    submission_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    sub = await submission_repository.get_by_id(submission_id)
    if not sub:
        raise NotFoundException("Submission not found.")
    
    # Verify owner or admin
    if sub.get("user_id") != current_user["id"] and current_user.get("role") != "admin":
        raise ForbiddenException("You cannot access this submission.")
    
    return SubmissionDetailResponse(**sub)