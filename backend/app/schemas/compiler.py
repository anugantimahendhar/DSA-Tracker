from typing import List, Optional
from app.schemas.ai import AISubmissionEvaluation
from pydantic import BaseModel, Field


class CodeRunRequest(BaseModel):
    question_id: str
    language: str
    code: str


class TestCaseRunResult(BaseModel):
    test_case_id: str
    input: str
    expected_output: str
    actual_output: str
    passed: bool
    status: str
    runtime_ms: float
    error_message: Optional[str] = None


class CodeRunResponse(BaseModel):
    success: bool
    total_tests: int
    passed_tests: int
    results: List[TestCaseRunResult]
    compile_output: Optional[str] = None


class CodeSubmitRequest(BaseModel):
    question_id: str
    language: str
    code: str


class CodeSubmitResponse(BaseModel):
    submission_id: str
    status: str  # Accepted, Wrong Answer, Time Limit Exceeded, Runtime Error, Compilation Error
    passed_count: int
    total_count: int
    runtime_ms: float
    memory_kb: float
    compile_output: Optional[str] = None
    ai_evaluation: Optional[AISubmissionEvaluation] = None


class DraftSaveRequest(BaseModel):
    question_id: str
    language: str
    code: str


class DraftResponse(BaseModel):
    question_id: str
    language: str
    code: str
    updated_at: str