from typing import List, Dict
from pydantic import BaseModel


class DifficultyProgress(BaseModel):
    easy_solved: int = 0
    easy_total: int = 0
    medium_solved: int = 0
    medium_total: int = 0
    hard_solved: int = 0
    hard_total: int = 0


class TopicProgress(BaseModel):
    topic: str
    solved: int
    total: int
    percentage: float


class UserProgressSummary(BaseModel):
    total_published: int
    total_solved: int
    total_attempted: int
    total_unsolved: int
    current_streak: int
    longest_streak: int
    difficulty: DifficultyProgress
    topics: List[TopicProgress]
    bookmark_count: int
    active_days_this_week: int