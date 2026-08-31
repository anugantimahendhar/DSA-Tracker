from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from app.schemas.question import ExampleSchema, TestCaseSchema


class AIQuestionGenerateRequest(BaseModel):
    question: str = Field(..., min_length=2, description="Question title or short DSA prompt")


class AIQuestionDraft(BaseModel):
    code: str
    title: str
    description: str
    constraints: str
    examples: List[ExampleSchema] = []
    explanation: str
    difficulty: str
    topic: str
    pattern: Optional[str] = None
    company_tags: List[str] = []
    starter_templates: Dict[str, str] = {}
    suggested_test_cases: List[TestCaseSchema] = []
    generated_by: str = "fallback"


class AISubmissionEvaluation(BaseModel):
    score: float = Field(..., ge=0, le=10)
    points_awarded: float = Field(..., ge=0, le=10)
    difficulty: str
    correctness_percent: float
    code_quality: float = Field(..., ge=0, le=10)
    feedback: str
    generated_by: str = "rules"


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: str
    email: str
    total_points: float
    average_score: float
    scored_submissions: int
    solved_count: int
    current_streak: int = 0


class LeaderboardResponse(BaseModel):
    items: List[LeaderboardEntry]
    current_user_rank: Optional[int] = None
