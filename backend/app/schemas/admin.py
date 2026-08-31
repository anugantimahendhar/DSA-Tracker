from typing import List, Dict
from pydantic import BaseModel


class AdminStatsResponse(BaseModel):
    total_questions: int
    published_questions: int
    draft_questions: int
    total_users: int
    total_submissions: int
    difficulty_distribution: Dict[str, int]
    topic_distribution: Dict[str, int]