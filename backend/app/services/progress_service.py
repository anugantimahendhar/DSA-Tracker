from datetime import datetime, date, timedelta, timezone
from typing import List, Dict, Any, Set
from app.repositories.question_repository import question_repository
from app.repositories.progress_repository import progress_repository
from app.repositories.submission_repository import submission_repository
from app.repositories.bookmark_repository import bookmark_repository
from app.schemas.progress import (
    UserProgressSummary,
    DifficultyProgress,
    TopicProgress
)


class ProgressService:
    def __init__(self):
        self.q_repo = question_repository
        self.prog_repo = progress_repository
        self.sub_repo = submission_repository
        self.bm_repo = bookmark_repository

    def _calculate_streaks(self, active_dates: Set[str]) -> (int, int):
        if not active_dates:
            return 0, 0

        # Sort dates descending
        sorted_dates = sorted([datetime.fromisoformat(d).date() for d in active_dates], reverse=True)
        if not sorted_dates:
            return 0, 0

        today = date.today()
        yesterday = today - timedelta(days=1)

        # Calculate current streak
        current_streak = 0
        latest_date = sorted_dates[0]

        if latest_date in (today, yesterday):
            expected_date = latest_date
            for d in sorted_dates:
                if d == expected_date:
                    current_streak += 1
                    expected_date = expected_date - timedelta(days=1)
                elif d > expected_date:
                    continue  # Same day duplicates
                else:
                    break

        # Calculate longest streak
        all_sorted = sorted(list(set(sorted_dates)))
        longest_streak = 0
        cur = 0
        prev_d = None
        for d in all_sorted:
            if prev_d is None or d == prev_d + timedelta(days=1):
                cur += 1
            else:
                cur = 1
            longest_streak = max(longest_streak, cur)
            prev_d = d

        return current_streak, max(current_streak, longest_streak)

    async def get_summary(self, user_id: str) -> UserProgressSummary:
        questions = await self.q_repo.list_questions(status="Published", limit=1000)
        progresses = await self.prog_repo.list_user_progress(user_id)
        submissions = await self.sub_repo.list_by_user(user_id=user_id, limit=200)
        bookmarks = await self.bm_repo.list_by_user(user_id)

        prog_map = {p["question_id"]: p.get("status", "NOT_STARTED") for p in progresses}

        # Difficulty aggregation
        diff_prog = {
            "Easy": {"solved": 0, "total": 0},
            "Medium": {"solved": 0, "total": 0},
            "Hard": {"solved": 0, "total": 0}
        }
        topic_prog: Dict[str, Dict[str, int]] = {}

        total_solved = 0
        total_attempted = 0

        for q in questions:
            qid = q["id"]
            diff = q.get("difficulty", "Easy")
            top = q.get("topic", "General")

            if diff in diff_prog:
                diff_prog[diff]["total"] += 1

            if top not in topic_prog:
                topic_prog[top] = {"solved": 0, "total": 0}
            topic_prog[top]["total"] += 1

            st = prog_map.get(qid, "NOT_STARTED")
            if st == "SOLVED":
                total_solved += 1
                if diff in diff_prog:
                    diff_prog[diff]["solved"] += 1
                topic_prog[top]["solved"] += 1
            elif st == "ATTEMPTED":
                total_attempted += 1

        # Calculate active dates from submissions and progress
        active_dates = set()
        for s in submissions:
            created = s.get("created_at")
            if created:
                active_dates.add(created[:10])
        for p in progresses:
            last_att = p.get("last_attempted_at")
            if last_att:
                active_dates.add(last_att[:10])

        current_streak, longest_streak = self._calculate_streaks(active_dates)

        # Active days this week
        today = date.today()
        start_of_week = today - timedelta(days=today.weekday())
        week_days = {str(start_of_week + timedelta(days=i)) for i in range(7)}
        active_this_week = len(active_dates.intersection(week_days))

        topic_list = [
            TopicProgress(
                topic=t,
                solved=v["solved"],
                total=v["total"],
                percentage=round((v["solved"] / v["total"] * 100) if v["total"] > 0 else 0, 1)
            ) for t, v in topic_prog.items()
        ]
        topic_list.sort(key=lambda x: x.percentage, reverse=True)

        return UserProgressSummary(
            total_published=len(questions),
            total_solved=total_solved,
            total_attempted=total_attempted,
            total_unsolved=max(0, len(questions) - total_solved),
            current_streak=current_streak,
            longest_streak=longest_streak,
            difficulty=DifficultyProgress(
                easy_solved=diff_prog["Easy"]["solved"],
                easy_total=diff_prog["Easy"]["total"],
                medium_solved=diff_prog["Medium"]["solved"],
                medium_total=diff_prog["Medium"]["total"],
                hard_solved=diff_prog["Hard"]["solved"],
                hard_total=diff_prog["Hard"]["total"]
            ),
            topics=topic_list,
            bookmark_count=len(bookmarks),
            active_days_this_week=active_this_week
        )


progress_service = ProgressService()