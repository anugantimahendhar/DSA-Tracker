from typing import List, Dict
from pydantic import BaseModel


class ErrorBreakdown(BaseModel):
    error_type: str
    count: int
    percentage: float


class ActivityDay(BaseModel):
    date: str
    submissions_count: int
    solved_count: int


class AnalyticsOverviewResponse(BaseModel):
    total_submissions: int
    accepted_submissions: int
    acceptance_rate: float
    total_solved: int
    error_breakdown: List[ErrorBreakdown]
    activity_timeline: List[ActivityDay]
    weak_topics: List[str]
    strong_topics: List[str]