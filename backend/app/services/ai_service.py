import json
import math
import re
from typing import Dict, Any, List
import httpx
from app.core.config import settings
from app.schemas.ai import AIQuestionDraft, AISubmissionEvaluation, LeaderboardEntry, LeaderboardResponse
from app.schemas.question import ExampleSchema, TestCaseSchema
from app.repositories.score_repository import score_repository
from app.repositories.user_repository import user_repository
from app.repositories.progress_repository import progress_repository
from app.integrations.supabase_client import supabase_service


class AIService:
    TOPIC_KEYWORDS = {
        "Arrays": ["array", "subarray", "prefix", "two sum", "stock", "matrix"],
        "Strings": ["string", "substring", "palindrome", "anagram", "character"],
        "Hashing": ["hash", "frequency", "map", "two sum", "duplicate"],
        "Linked Lists": ["linked list", "node", "cycle"],
        "Stack": ["stack", "parentheses", "bracket", "monotonic"],
        "Queue": ["queue", "deque", "bfs"],
        "Binary Search": ["binary search", "sorted", "lower bound", "upper bound"],
        "Trees": ["tree", "bst", "binary tree", "ancestor", "traversal"],
        "Heap": ["heap", "priority queue", "kth", "top k"],
        "Graphs": ["graph", "vertex", "edge", "bfs", "dfs", "shortest path"],
        "Recursion": ["recursion", "recursive"],
        "Backtracking": ["backtracking", "permutation", "combination", "n-queens", "sudoku"],
        "Greedy": ["greedy", "interval", "minimum coins"],
        "Dynamic Programming": ["dynamic programming", "dp", "knapsack", "longest common", "lis"],
    }

    async def _gemini_json(self, system_instruction: str, prompt: str) -> Dict[str, Any] | None:
        if not settings.GEMINI_API_KEY:
            return None
        model = settings.GEMINI_MODEL
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "system_instruction": {"parts": [{"text": system_instruction}]},
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"responseMimeType": "application/json", "temperature": 0.2},
        }
        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                res = await client.post(url, json=payload)
                res.raise_for_status()
                data = res.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text)
        except Exception:
            return None

    def _slug_code(self, text: str) -> str:
        code = re.sub(r"[^A-Za-z0-9]+", "-", text.strip()).strip("-").upper()
        return (code[:38] or "AI-QUESTION")

    def _topic(self, question: str) -> str:
        q = question.lower()
        scores = [(sum(1 for k in keys if k in q), topic) for topic, keys in self.TOPIC_KEYWORDS.items()]
        best = max(scores, default=(0, "Arrays"))
        return best[1] if best[0] else "Arrays"

    def _difficulty(self, question: str) -> str:
        q = question.lower()
        hard = ["dynamic programming", "dp", "graph", "shortest path", "trie", "segment tree", "backtracking", "n-queens"]
        medium = ["binary search", "linked list", "tree", "heap", "sliding window", "two pointer", "interval"]
        if any(k in q for k in hard):
            return "Hard"
        if any(k in q for k in medium):
            return "Medium"
        return "Easy"

    def _pattern(self, question: str, topic: str) -> str:
        q = question.lower()
        patterns = [
            ("sliding window", "Sliding Window"), ("two pointer", "Two Pointers"),
            ("binary search", "Binary Search"), ("bfs", "Breadth-First Search"),
            ("dfs", "Depth-First Search"), ("dynamic programming", "Dynamic Programming"),
            ("backtracking", "Backtracking"), ("heap", "Heap / Priority Queue"),
            ("hash", "Hash Map"), ("frequency", "Hash Map"),
        ]
        for key, value in patterns:
            if key in q:
                return value
        return {"Arrays": "Iteration / Hashing", "Strings": "String Processing", "Trees": "Tree Traversal", "Graphs": "Graph Traversal"}.get(topic, topic)

    def _fallback_question(self, question: str) -> AIQuestionDraft:
        title = question.strip().rstrip("?.")
        topic = self._topic(title)
        difficulty = self._difficulty(title)
        pattern = self._pattern(title, topic)
        code = self._slug_code(title)
        description = (
            f"Solve the following DSA problem: **{title}**.\n\n"
            "Read the input, apply an efficient algorithm, and return the required result. "
            "Your solution should handle normal inputs as well as boundary cases. Aim for the best practical time and space complexity for the selected topic."
        )
        constraints = "1 <= input size <= 10^5\nInput values are within 32-bit signed integer range unless the problem statement implies otherwise.\nHandle empty/minimum-size and duplicate-value edge cases where applicable."
        examples = [ExampleSchema(input="Sample input", output="Expected output", explanation="Replace this generated sample with a verified example before publishing.")]
        explanation = (
            f"### Approach\nThis problem is classified under **{topic}** and commonly uses the **{pattern}** pattern. "
            "Identify the invariant, choose the matching data structure, process each element/state only as often as necessary, and verify boundary conditions.\n\n"
            "### Complexity\nUse the most efficient standard approach for this problem. Review the final time and space complexity after confirming the exact input/output contract."
        )
        templates = {
            "python": "import sys\n\ndef solve():\n    data = sys.stdin.read().strip()\n    # TODO: implement solution\n    pass\n\nif __name__ == '__main__':\n    solve()\n",
            "javascript": "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8').trim();\n// TODO: implement solution\n",
            "cpp": "#include <bits/stdc++.h>\nusing namespace std;\nint main(){ ios::sync_with_stdio(false); cin.tie(nullptr); /* TODO */ return 0; }\n",
            "java": "import java.util.*;\npublic class Main { public static void main(String[] args) { Scanner sc = new Scanner(System.in); /* TODO */ } }\n",
        }
        tests = [
            TestCaseSchema(input="Sample input", expected_output="Expected output", is_hidden=False, order_index=0),
            TestCaseSchema(input="Edge-case input", expected_output="Expected output", is_hidden=True, order_index=1),
        ]
        return AIQuestionDraft(code=code, title=title, description=description, constraints=constraints, examples=examples,
                               explanation=explanation, difficulty=difficulty, topic=topic, pattern=pattern,
                               company_tags=[], starter_templates=templates, suggested_test_cases=tests, generated_by="smart-fallback")

    async def generate_question(self, question: str) -> AIQuestionDraft:
        prompt = f"""Turn this short DSA question into a complete publish-ready problem draft: {question}\nReturn JSON with: code, title, description, constraints, examples (input/output/explanation), explanation, difficulty (Easy/Medium/Hard), topic, pattern, company_tags, starter_templates for python/javascript/cpp/java, suggested_test_cases (input, expected_output, is_hidden, order_index). Do not invent company tags unless strongly known. Include at least 2 examples and at least 3 test cases with both visible and hidden cases."""
        data = await self._gemini_json("You are a DSA problem author. Produce precise, safe, deterministic JSON only.", prompt)
        if data:
            try:
                data["generated_by"] = f"gemini:{settings.GEMINI_MODEL}"
                return AIQuestionDraft(**data)
            except Exception:
                pass
        return self._fallback_question(question)

    def _quality_score(self, code: str, language: str) -> float:
        if not code.strip():
            return 0.0
        score = 5.0
        lines = [l for l in code.splitlines() if l.strip()]
        if len(lines) >= 6:
            score += 1.0
        if len(lines) >= 12:
            score += 0.5
        if any(k in code.lower() for k in ["def ", "function ", "class ", "map", "set", "dict", "vector", "unordered_map"]):
            score += 1.0
        if any(k in code.lower() for k in ["todo", "pass\n", "debug", "system.out.println(\"test", "console.log('test"]):
            score -= 1.0
        if len(code) > 6000:
            score -= 0.5
        return max(0.0, min(10.0, score))

    async def evaluate_submission(self, *, user_id: str, submission_id: str, question: Dict[str, Any], language: str,
                                  code: str, status: str, passed_count: int, total_count: int) -> AISubmissionEvaluation:
        correctness = (passed_count / max(1, total_count)) * 100.0
        quality = self._quality_score(code, language)
        difficulty = question.get("difficulty", "Easy")
        diff_bonus = {"Easy": 0.0, "Medium": 0.4, "Hard": 0.8}.get(difficulty, 0.0)
        # Correctness dominates. Quality and difficulty provide small, transparent adjustments.
        score = (correctness / 100.0) * 8.0 + (quality / 10.0) * 1.2 + diff_bonus
        if status != "Accepted":
            score = min(score, 8.4)
        score = round(max(0.0, min(10.0, score)), 1)
        feedback = f"Passed {passed_count}/{total_count} tests ({correctness:.0f}%). Code-quality signal: {quality:.1f}/10."
        generated_by = "rules"

        ai_data = await self._gemini_json(
            "You are a concise DSA code reviewer. Never claim hidden test inputs. Return JSON only.",
            f"Question: {question.get('title')}\nDifficulty: {difficulty}\nLanguage: {language}\nJudge status: {status}\nPassed: {passed_count}/{total_count}\nCode:\n{code[:10000]}\nReturn JSON with feedback (max 3 sentences) and code_quality from 0 to 10. Do not change the judge correctness result."
        )
        if ai_data:
            try:
                quality = max(0.0, min(10.0, float(ai_data.get("code_quality", quality))))
                score = round(max(0.0, min(10.0, (correctness / 100.0) * 8.0 + (quality / 10.0) * 1.2 + diff_bonus)), 1)
                if status != "Accepted":
                    score = min(score, 8.4)
                feedback = str(ai_data.get("feedback") or feedback)
                generated_by = f"gemini:{settings.GEMINI_MODEL}"
            except Exception:
                pass

        evaluation = AISubmissionEvaluation(score=score, points_awarded=score, difficulty=difficulty,
                                             correctness_percent=round(correctness, 1), code_quality=round(quality, 1),
                                             feedback=feedback, generated_by=generated_by)
        await score_repository.create({
            "submission_id": submission_id, "user_id": user_id, "question_id": question.get("id"),
            "score": evaluation.score, "points_awarded": evaluation.points_awarded,
            "difficulty": difficulty, "correctness_percent": evaluation.correctness_percent,
            "code_quality": evaluation.code_quality, "feedback": evaluation.feedback,
            "generated_by": evaluation.generated_by,
        })
        return evaluation

    async def leaderboard(self, current_user_id: str | None = None, limit: int = 50) -> LeaderboardResponse:
        scores = await score_repository.list_all()
        grouped: Dict[str, Dict[str, Any]] = {}
        for s in scores:
            uid = s.get("user_id")
            g = grouped.setdefault(uid, {"points": 0.0, "scores": [], "questions": set()})
            g["points"] += float(s.get("points_awarded", s.get("score", 0)) or 0)
            g["scores"].append(float(s.get("score", 0) or 0))
            if s.get("score", 0) >= 8.0:
                g["questions"].add(s.get("question_id"))

        entries: List[LeaderboardEntry] = []
        for uid, g in grouped.items():
            profile = await user_repository.get_by_id(uid)
            if not profile or profile.get("role") == "admin":
                continue
            prog = await progress_repository.list_user_progress(uid)
            solved = len([p for p in prog if p.get("status") == "SOLVED"])
            # Compute current streak from progress activity dates.
            dates = sorted({(p.get("last_attempted_at") or "")[:10] for p in prog if p.get("last_attempted_at")}, reverse=True)
            current_streak = 0
            if dates:
                from datetime import date, timedelta
                latest = date.fromisoformat(dates[0])
                if latest in (date.today(), date.today() - timedelta(days=1)):
                    expected = latest
                    for dstr in dates:
                        d = date.fromisoformat(dstr)
                        if d == expected:
                            current_streak += 1
                            expected -= timedelta(days=1)
                        elif d < expected:
                            break
            entries.append(LeaderboardEntry(rank=0, user_id=uid, email=profile.get("email", "Learner"),
                                            total_points=round(g["points"], 1), average_score=round(sum(g["scores"])/max(1, len(g["scores"])), 1),
                                            scored_submissions=len(g["scores"]), solved_count=solved, current_streak=current_streak))
        entries.sort(key=lambda e: (e.total_points, e.average_score, e.solved_count), reverse=True)
        for i, e in enumerate(entries[:limit], 1):
            e.rank = i
        current_rank = next((i for i, e in enumerate(entries, 1) if e.user_id == current_user_id), None)
        return LeaderboardResponse(items=entries[:limit], current_user_rank=current_rank)


ai_service = AIService()
