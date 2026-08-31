from datetime import datetime, date, timedelta
from typing import List, Dict, Any
from app.repositories.submission_repository import submission_repository
from app.repositories.question_repository import question_repository
from app.repositories.progress_repository import progress_repository
from app.schemas.analytics import (
    AnalyticsOverviewResponse,
    ErrorBreakdown,
    ActivityDay
)


class AnalyticsService:
    def __init__(self):
        self.sub_repo = submission_repository
        self.q_repo = question_repository
        self.prog_repo = progress_repository

    async def get_overview(self, user_id: str) -> AnalyticsOverviewResponse:
        submissions = await self.sub_repo.list_by_user(user_id, limit=500)
        questions = await self.q_repo.list_questions(status="Published", limit=500)
        progresses = await self.prog_repo.list_user_progress(user_id)

        total_submissions = len(submissions)
        accepted_submissions = len([s for s in submissions if s.get("status") == "Accepted"])
        acceptance_rate = round((accepted_submissions / total_submissions * 100) if total_submissions > 0 else 0, 1)

        # Error breakdown
        error_counts = {
            "Wrong Answer": 0,
            "Time Limit Exceeded": 0,
            "Runtime Error": 0,
            "Compilation Error": 0
        }
        for s in submissions:
            st = s.get("status")
            if st in error_counts:
                error_counts[st] += 1

        failed_total = total_submissions - accepted_submissions
        error_breakdown = [
            ErrorBreakdown(
                error_type=k,
                count=v,
                percentage=round((v / failed_total * 100) if failed_total > 0 else 0, 1)
            ) for k, v in error_counts.items()
        ]

        # Activity timeline for past 14 days
        today = date.today()
        activity_map: Dict[str, Dict[str, int]] = {}
        for i in range(13, -1, -1):
            d_str = str(today - timedelta(days=i))
            activity_map[d_str] = {"submissions": 0, "solved": 0}

        for s in submissions:
            d = (s.get("created_at") or "")[:10]
            if d in activity_map:
                activity_map[d]["submissions"] += 1
                if s.get("status") == "Accepted":
                    activity_map[d]["solved"] += 1

        timeline = [
            ActivityDay(
                date=d,
                submissions_count=v["submissions"],
                solved_count=v["solved"]
            ) for d, v in sorted(activity_map.items())
        ]

        # Topics strength analysis
        topic_totals: Dict[str, int] = {}
        topic_solved: Dict[str, int] = {}
        prog_map = {p["question_id"]: p.get("status") for p in progresses}

        for q in questions:
            t = q.get("topic", "General")
            topic_totals[t] = topic_totals.get(t, 0) + 1
            if prog_map.get(q["id"]) == "SOLVED":
                topic_solved[t] = topic_solved.get(t, 0) + 1

        strong_topics = []
        weak_topics = []
        for t, tot in topic_totals.items():
            sol = topic_solved.get(t, 0)
            pct = sol / tot if tot > 0 else 0
            if pct >= 0.5:
                strong_topics.append(t)
            else:
                weak_topics.append(t)

        total_solved = len([p for p in progresses if p.get("status") == "SOLVED"])

        return AnalyticsOverviewResponse(
            total_submissions=total_submissions,
            accepted_submissions=accepted_submissions,
            acceptance_rate=acceptance_rate,
            total_solved=total_solved,
            error_breakdown=error_breakdown,
            activity_timeline=timeline,
            weak_topics=weak_topics,
            strong_topics=strong_topics
        )


analytics_service = AnalyticsService()