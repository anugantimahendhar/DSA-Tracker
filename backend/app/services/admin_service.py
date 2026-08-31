from typing import Dict, Any, List

from app.core.exceptions import BadRequestException, NotFoundException
from app.repositories.question_repository import question_repository
from app.repositories.test_case_repository import test_case_repository
from app.repositories.submission_repository import submission_repository
from app.repositories.notification_repository import notification_repository
from app.integrations.supabase_client import supabase_service
from app.schemas.admin import AdminStatsResponse
from app.schemas.question import QuestionCreateRequest, QuestionUpdateRequest


class AdminService:
    def __init__(self):
        self.q_repo = question_repository
        self.tc_repo = test_case_repository
        self.sub_repo = submission_repository
        self.service = supabase_service

    async def get_stats(self) -> AdminStatsResponse:
        all_questions = await self.q_repo.list_questions(status=None, limit=1000)

        diff_dist: Dict[str, int] = {"Easy": 0, "Medium": 0, "Hard": 0}
        topic_dist: Dict[str, int] = {}
        published = 0
        drafts = 0

        for q in all_questions:
            d = q.get("difficulty", "Easy")
            diff_dist[d] = diff_dist.get(d, 0) + 1

            t = q.get("topic", "General")
            topic_dist[t] = topic_dist.get(t, 0) + 1

            if q.get("status") == "Published":
                published += 1
            elif q.get("status") == "Draft":
                drafts += 1

        total_users = len(self.service._mock_profiles)
        total_submissions = len(self.service._mock_submissions)

        return AdminStatsResponse(
            total_questions=len(all_questions),
            published_questions=published,
            draft_questions=drafts,
            total_users=total_users,
            total_submissions=total_submissions,
            difficulty_distribution=diff_dist,
            topic_distribution=topic_dist
        )

    async def create_question(
        self,
        req: QuestionCreateRequest,
        admin_id: str
    ) -> Dict[str, Any]:

        existing = await self.q_repo.get_by_code(req.code)

        if existing:
            raise BadRequestException(
                f"A question with code '{req.code}' already exists."
            )

        data = req.model_dump()
        data["created_by"] = admin_id

        return await self.q_repo.create(data)

    async def update_question(
        self,
        question_id: str,
        req: QuestionUpdateRequest
    ) -> Dict[str, Any]:

        existing = await self.q_repo.get_by_id(question_id)

        if not existing:
            raise NotFoundException("Question not found.")

        updates = {
            k: v
            for k, v in req.model_dump().items()
            if v is not None
        }

        if "code" in updates and updates["code"] != existing.get("code"):
            code_exists = await self.q_repo.get_by_code(updates["code"])

            if code_exists and code_exists["id"] != question_id:
                raise BadRequestException(
                    f"Code '{updates['code']}' is already in use."
                )

        # If publishing, validate requirements
        if updates.get("status") == "Published":

            test_cases = await self.tc_repo.list_for_question(
                question_id,
                include_hidden=True
            )

            has_visible = any(
                not tc.get("is_hidden")
                for tc in test_cases
            )

            has_hidden = any(
                tc.get("is_hidden")
                for tc in test_cases
            )

            if not has_visible:
                raise BadRequestException(
                    "Cannot publish: at least one visible test case is required."
                )

            if not has_hidden:
                raise BadRequestException(
                    "Cannot publish: at least one hidden test case is required."
                )

        updated = await self.q_repo.update(question_id, updates)

        final_question = updated or existing

        # ------------------------------------------
        # NEW PROBLEM PUBLISHED NOTIFICATION
        # ------------------------------------------
        was_published = existing.get("status") == "Published"
        is_now_published = final_question.get("status") == "Published"

        if not was_published and is_now_published:
            print("NOTIFICATION TRIGGERED FOR QUESTION:", question_id)

            try:
                users_response = (
                    self.service._admin_client
                    .table("profiles")
                    .select("id")
                    .eq("role", "user")
                    .execute()
                )

                users = users_response.data or []

                question_title = final_question.get(
                    "title",
                    "New DSA Problem"
                )

                difficulty = final_question.get(
                    "difficulty",
                    ""
                )

                for user in users:
                    await notification_repository.create(
                        user_id=user["id"],
                        title="New Problem Available",
                        message=f"{question_title} ({difficulty}) is now available.",
                        notification_type="new_problem",
                        question_id=question_id,
                        action_url=f"/problems/{question_id}"
                    )

            except Exception as exc:
                print(
                    "Failed to create publish notifications:",
                    exc
                )

        return final_question


admin_service = AdminService()