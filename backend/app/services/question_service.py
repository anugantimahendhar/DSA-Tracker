from typing import List, Dict, Any, Optional
from app.core.exceptions import NotFoundException
from app.repositories.question_repository import question_repository
from app.repositories.test_case_repository import test_case_repository
from app.repositories.progress_repository import progress_repository
from app.repositories.bookmark_repository import bookmark_repository
from app.schemas.question import (
    QuestionListItem,
    QuestionDetailResponse,
    TestCaseSchema,
    ExampleSchema
)


class QuestionService:
    def __init__(self):
        self.q_repo = question_repository
        self.tc_repo = test_case_repository
        self.prog_repo = progress_repository
        self.bm_repo = bookmark_repository

    async def list_questions(
        self,
        user_id: Optional[str] = None,
        difficulty: Optional[str] = None,
        topic: Optional[str] = None,
        pattern: Optional[str] = None,
        search: Optional[str] = None,
        user_status: Optional[str] = None,
        bookmarked_only: bool = False,
        limit: int = 50,
        offset: int = 0
    ) -> List[QuestionListItem]:
        raw_questions = await self.q_repo.list_questions(
            status="Published",
            difficulty=difficulty,
            topic=topic,
            pattern=pattern,
            search=search,
            limit=200,
            offset=0
        )

        user_progress_map = {}
        bookmarked_set = set()

        if user_id:
            progresses = await self.prog_repo.list_user_progress(user_id)
            user_progress_map = {p["question_id"]: p.get("status", "NOT_STARTED") for p in progresses}
            bookmarked_list = await self.bm_repo.list_by_user(user_id)
            bookmarked_set = set(bookmarked_list)

        items: List[QuestionListItem] = []
        for q in raw_questions:
            qid = q["id"]
            status = user_progress_map.get(qid, "NOT_STARTED")
            is_bm = qid in bookmarked_set

            if user_status and status.upper() != user_status.upper():
                continue
            if bookmarked_only and not is_bm:
                continue

            items.append(QuestionListItem(
                id=qid,
                code=q.get("code", ""),
                title=q.get("title", ""),
                difficulty=q.get("difficulty", "Easy"),
                topic=q.get("topic", ""),
                pattern=q.get("pattern"),
                company_tags=q.get("company_tags", []),
                status=q.get("status", "Published"),
                user_status=status,
                is_bookmarked=is_bm
            ))

        return items[offset:offset + limit]

    async def get_question_detail(self, question_id: str, user_id: Optional[str] = None, is_admin: bool = False) -> QuestionDetailResponse:
        q = await self.q_repo.get_by_id(question_id)
        if not q or (q.get("status") != "Published" and not is_admin):
            raise NotFoundException("Question not found.")

        # Visible test cases only
        visible_tcs = await self.tc_repo.list_for_question(question_id, include_hidden=False)
        formatted_tcs = [
            TestCaseSchema(
                id=tc.get("id"),
                input=tc.get("input", ""),
                expected_output=tc.get("expected_output", ""),
                is_hidden=False,
                order_index=tc.get("order_index", 0)
            ) for tc in visible_tcs
        ]

        user_status = "NOT_STARTED"
        is_bookmarked = False

        if user_id:
            prog = await self.prog_repo.get_progress(user_id, question_id)
            if prog:
                user_status = prog.get("status", "NOT_STARTED")
            is_bookmarked = await self.bm_repo.is_bookmarked(user_id, question_id)

        # Gate explanation: visible only if solved or user is admin
        explanation = q.get("explanation")
        if not is_admin and user_status != "SOLVED":
            explanation = None

        return QuestionDetailResponse(
            id=q["id"],
            code=q.get("code", ""),
            title=q.get("title", ""),
            description=q.get("description", ""),
            constraints=q.get("constraints", ""),
            examples=[ExampleSchema(**ex) for ex in q.get("examples", [])],
            explanation=explanation,
            difficulty=q.get("difficulty", "Easy"),
            topic=q.get("topic", ""),
            pattern=q.get("pattern"),
            company_tags=q.get("company_tags", []),
            status=q.get("status", "Published"),
            starter_templates=q.get("starter_templates", {}),
            is_bookmarked=is_bookmarked,
            user_status=user_status,
            visible_test_cases=formatted_tcs
        )


question_service = QuestionService()