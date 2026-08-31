from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status
from app.api.dependencies import get_current_admin
from app.services.admin_service import admin_service
from app.repositories.question_repository import question_repository
from app.repositories.test_case_repository import test_case_repository
from app.schemas.admin import AdminStatsResponse
from app.schemas.question import (
    QuestionCreateRequest,
    QuestionUpdateRequest,
    TestCaseSchema
)

router = APIRouter(prefix="/admin", tags=["Admin Management"])


@router.get("/stats", response_model=AdminStatsResponse)
async def get_admin_stats(admin: Dict[str, Any] = Depends(get_current_admin)):
    return await admin_service.get_stats()


@router.get("/questions")
async def list_all_questions(admin: Dict[str, Any] = Depends(get_current_admin)):
    return await question_repository.list_questions(status=None, limit=500)


@router.post("/questions", status_code=status.HTTP_201_CREATED)
async def create_question(
    req: QuestionCreateRequest,
    admin: Dict[str, Any] = Depends(get_current_admin)
):
    return await admin_service.create_question(req, admin_id=admin["id"])


@router.put("/questions/{question_id}")
async def update_question(
    question_id: str,
    req: QuestionUpdateRequest,
    admin: Dict[str, Any] = Depends(get_current_admin)
):
    return await admin_service.update_question(question_id, req)


@router.delete("/questions/{question_id}")
async def delete_question(
    question_id: str,
    admin: Dict[str, Any] = Depends(get_current_admin)
):
    await question_repository.delete(question_id)
    return {"message": "Question deleted successfully."}


@router.get("/questions/{question_id}/test-cases", response_model=List[TestCaseSchema])
async def list_all_test_cases(
    question_id: str,
    admin: Dict[str, Any] = Depends(get_current_admin)
):
    tcs = await test_case_repository.list_for_question(question_id, include_hidden=True)
    return [TestCaseSchema(**tc) for tc in tcs]


@router.post("/questions/{question_id}/test-cases", status_code=status.HTTP_201_CREATED)
async def create_test_case(
    question_id: str,
    req: TestCaseSchema,
    admin: Dict[str, Any] = Depends(get_current_admin)
):
    data = req.model_dump()
    data["question_id"] = question_id
    return await test_case_repository.create(data)


@router.delete("/test-cases/{test_case_id}")
async def delete_test_case(
    test_case_id: str,
    admin: Dict[str, Any] = Depends(get_current_admin)
):
    await test_case_repository.delete(test_case_id)
    return {"message": "Test case deleted."}