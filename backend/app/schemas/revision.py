from typing import Optional
from pydantic import BaseModel


class RevisionItem(BaseModel):
    id: str
    question_id: str
    question_title: str
    question_code: str
    difficulty: str
    topic: str
    status: str  # Needs Revision, Comfortable, Mastered
    due_date: str
    last_reviewed_at: str
    failed_attempts_count: int = 0


class RevisionUpdateRequest(BaseModel):
    question_id: str
    status: str
    due_date: Optional[str] = None