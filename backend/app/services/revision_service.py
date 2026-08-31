from datetime import date
from typing import List, Dict, Any
from app.repositories.revision_repository import revision_repository
from app.repositories.question_repository import question_repository
from app.repositories.submission_repository import submission_repository
from app.schemas.revision import RevisionItem


class RevisionService:
    def __init__(self):
        self.rev_repo = revision_repository
        self.q_repo = question_repository
        self.sub_repo = submission_repository

    async def list_revision_queue(self, user_id: str) -> List[RevisionItem]:
        revisions = await self.rev_repo.list_by_user(user_id)
        questions = await self.q_repo.list_questions(status="Published", limit=500)
        q_map = {q["id"]: q for q in questions}

        items: List[RevisionItem] = []
        for r in revisions:
            qid = r.get("question_id")
            q = q_map.get(qid)
            if not q:
                continue

            failed_cnt = await self.sub_repo.get_failed_count_recent(user_id, qid)

            items.append(RevisionItem(
                id=r.get("id", ""),
                question_id=qid,
                question_title=q.get("title", ""),
                question_code=q.get("code", ""),
                difficulty=q.get("difficulty", "Easy"),
                topic=q.get("topic", "General"),
                status=r.get("status", "Needs Revision"),
                due_date=r.get("due_date", str(date.today())),
                last_reviewed_at=r.get("last_reviewed_at", ""),
                failed_attempts_count=failed_cnt
            ))

        return items


revision_service = RevisionService()