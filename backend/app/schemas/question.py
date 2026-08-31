from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class ExampleSchema(BaseModel):
    input: str
    output: str
    explanation: Optional[str] = None


class TestCaseSchema(BaseModel):
    id: Optional[str] = None
    input: str
    expected_output: str
    is_hidden: bool = False
    order_index: int = 0


class QuestionListItem(BaseModel):
    id: str
    code: str
    title: str
    difficulty: str
    topic: str
    pattern: Optional[str] = None
    company_tags: List[str] = []
    status: str
    user_status: Optional[str] = "NOT_STARTED"
    is_bookmarked: bool = False


class QuestionDetailResponse(BaseModel):
    id: str
    code: str
    title: str
    description: str
    constraints: str
    examples: List[ExampleSchema] = []
    explanation: Optional[str] = None
    difficulty: str
    topic: str
    pattern: Optional[str] = None
    company_tags: List[str] = []
    status: str
    starter_templates: Dict[str, str] = {}
    is_bookmarked: bool = False
    user_status: Optional[str] = "NOT_STARTED"
    visible_test_cases: List[TestCaseSchema] = []


class QuestionCreateRequest(BaseModel):
    code: str = Field(..., min_length=2)
    title: str = Field(..., min_length=2)
    description: str = Field(..., min_length=5)
    constraints: str = Field(..., min_length=2)
    examples: List[ExampleSchema] = []
    explanation: Optional[str] = None
    difficulty: str = Field(..., pattern="^(Easy|Medium|Hard)$")
    topic: str
    pattern: Optional[str] = None
    company_tags: List[str] = []
    status: str = Field("Draft", pattern="^(Draft|Published|Unpublished|Deactivated)$")
    starter_templates: Dict[str, str] = {}


class QuestionUpdateRequest(BaseModel):
    code: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    constraints: Optional[str] = None
    examples: Optional[List[ExampleSchema]] = None
    explanation: Optional[str] = None
    difficulty: Optional[str] = None
    topic: Optional[str] = None
    pattern: Optional[str] = None
    company_tags: Optional[List[str]] = None
    status: Optional[str] = None
    starter_templates: Optional[Dict[str, str]] = None