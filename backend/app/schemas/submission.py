from typing import Optional
from pydantic import BaseModel


class SubmissionListItem(BaseModel):
    id: str
    question_id: str
    language: str
    status: str
    passed_count: int
    total_count: int
    runtime_ms: Optional[float] = None
    memory_kb: Optional[float] = None
    created_at: str


class SubmissionDetailResponse(SubmissionListItem):
    user_id: str
    code: str
    judge_reference: Optional[str] = None