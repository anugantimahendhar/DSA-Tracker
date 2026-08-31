from typing import Dict, Any, List
from app.core.exceptions import NotFoundException, BadRequestException
from app.integrations.judge0_client import judge0_client
from app.repositories.question_repository import question_repository
from app.repositories.test_case_repository import test_case_repository
from app.repositories.submission_repository import submission_repository
from app.repositories.progress_repository import progress_repository
from app.repositories.notification_repository import notification_repository
from app.integrations.supabase_client import supabase_service
from app.services.ai_service import ai_service
from app.schemas.compiler import (
    CodeRunResponse,
    TestCaseRunResult,
    CodeSubmitResponse
)


class ExecutionService:
    def __init__(self):
        self.runner = judge0_client

    def _normalize_output(self, text: str) -> str:
        if not text:
            return ""
        # Normalize newlines and strip leading/trailing whitespace
        lines = [line.rstrip() for line in text.replace("\r\n", "\n").replace("\r", "\n").split("\n")]
        return "\n".join(lines).strip()

    async def run_visible_tests(self, user_id: str, question_id: str, language: str, code: str) -> CodeRunResponse:
        question = await question_repository.get_by_id(question_id)
        if not question:
            raise NotFoundException("Question not found.")

        test_cases = await test_case_repository.list_for_question(question_id, include_hidden=False)
        if not test_cases:
            raise BadRequestException("No visible test cases available for this question.")

        results: List[TestCaseRunResult] = []
        passed_count = 0
        compile_output = None

        for tc in test_cases:
            exec_res = await self.runner.execute_code(
                source_code=code,
                language=language,
                stdin=tc.get("input", "")
            )

            if exec_res.get("compile_output"):
                compile_output = exec_res["compile_output"]

            actual = self._normalize_output(exec_res.get("stdout", ""))
            expected = self._normalize_output(tc.get("expected_output", ""))
            
            status_desc = exec_res.get("status_description", "Unknown")
            is_runtime_or_tle = status_desc not in ("Accepted", "")
            
            passed = (actual == expected) and not is_runtime_or_tle and not exec_res.get("stderr")
            if passed:
                passed_count += 1
                status = "Accepted"
            elif exec_res.get("compile_output"):
                status = "Compilation Error"
            elif status_desc == "Time Limit Exceeded":
                status = "Time Limit Exceeded"
            elif exec_res.get("stderr"):
                status = "Runtime Error"
            else:
                status = "Wrong Answer"

            results.append(TestCaseRunResult(
                test_case_id=tc.get("id", ""),
                input=tc.get("input", ""),
                expected_output=tc.get("expected_output", ""),
                actual_output=actual if not exec_res.get("stderr") else (actual + "\n" + exec_res.get("stderr", "")).strip(),
                passed=passed,
                status=status,
                runtime_ms=exec_res.get("time_ms", 0.0),
                error_message=exec_res.get("stderr") or exec_res.get("compile_output") or None
            ))

        # Mark user progress as ATTEMPTED
        await progress_repository.mark_attempted(user_id, question_id)

        return CodeRunResponse(
            success=(passed_count == len(test_cases)),
            total_tests=len(test_cases),
            passed_tests=passed_count,
            results=results,
            compile_output=compile_output
        )

    async def submit_code(self, user_id: str, question_id: str, language: str, code: str) -> CodeSubmitResponse:
        question = await question_repository.get_by_id(question_id)
        if not question:
            raise NotFoundException("Question not found.")

        # Get ALL test cases (both visible and hidden)
        all_test_cases = await test_case_repository.list_for_question(question_id, include_hidden=True)
        if not all_test_cases:
            raise BadRequestException("No test cases configured for this question.")

        passed_count = 0
        total_count = len(all_test_cases)
        final_status = "Accepted"
        total_time_ms = 0.0
        max_memory_kb = 0.0
        compile_output = None

        for tc in all_test_cases:
            exec_res = await self.runner.execute_code(
                source_code=code,
                language=language,
                stdin=tc.get("input", "")
            )

            total_time_ms += exec_res.get("time_ms", 0.0)
            max_memory_kb = max(max_memory_kb, exec_res.get("memory_kb", 0.0))

            if exec_res.get("compile_output"):
                compile_output = exec_res["compile_output"]
                final_status = "Compilation Error"
                break

            actual = self._normalize_output(exec_res.get("stdout", ""))
            expected = self._normalize_output(tc.get("expected_output", ""))
            status_desc = exec_res.get("status_description", "Unknown")

            if status_desc == "Time Limit Exceeded":
                final_status = "Time Limit Exceeded"
                break
            elif exec_res.get("stderr"):
                final_status = "Runtime Error"
                break
            elif actual != expected:
                final_status = "Wrong Answer"
                break
            else:
                passed_count += 1

        avg_time = (total_time_ms / max(1, passed_count + 1))

        # Update Progress
        previous_progress = await progress_repository.get_progress(user_id, question_id)
        first_solve = passed_count == total_count and final_status == "Accepted" and (not previous_progress or previous_progress.get("status") != "SOLVED")
        if passed_count == total_count and final_status == "Accepted":
            await progress_repository.mark_solved(user_id, question_id)
        else:
            await progress_repository.mark_attempted(user_id, question_id)

        # Store Submission Snapshot
        sub_data = {
            "user_id": user_id,
            "question_id": question_id,
            "language": language,
            "code": code,
            "status": final_status,
            "passed_count": passed_count,
            "total_count": total_count,
            "runtime_ms": avg_time,
            "memory_kb": max_memory_kb,
            "judge_reference": "sandbox-execution"
        }
        saved_sub = await submission_repository.create(sub_data)

        # Notify administrators only on the user's first accepted solve for this problem.
        if first_solve:
            try:
                service = supabase_service
                if not service.is_mock and service._admin_client:
                    admins_response = service._admin_client.table("profiles").select("id,email").eq("role", "admin").execute()
                    admins = admins_response.data or []
                    user_response = service._admin_client.table("profiles").select("email").eq("id", user_id).execute()
                    solver_email = (user_response.data or [{}])[0].get("email", "A user")
                    for admin in admins:
                        await notification_repository.create(
                            user_id=admin["id"],
                            title="Problem solved",
                            message=f"{solver_email} solved {question.get('title', 'a problem')}.",
                            notification_type="problem_solved",
                            question_id=question_id,
                            action_url=f"/problems/{question_id}"
                        )
                else:
                    for profile in service._mock_profiles.values():
                        if profile.get("role") == "admin":
                            await notification_repository.create(profile["id"], "Problem solved", f"A user solved {question.get('title', 'a problem')}.", "problem_solved", question_id, f"/problems/{question_id}")
            except Exception as exc:
                print("Failed to create solve notification:", exc)

        # AI evaluation runs after the deterministic judge. It never sees hidden test inputs.
        ai_evaluation = await ai_service.evaluate_submission(
            user_id=user_id,
            submission_id=saved_sub.get("id", ""),
            question=question,
            language=language,
            code=code,
            status=final_status,
            passed_count=passed_count,
            total_count=total_count
        )

        # Return strictly sanitized response - NO hidden test cases leaked!
        return CodeSubmitResponse(
            submission_id=saved_sub.get("id", ""),
            status=final_status,
            passed_count=passed_count,
            total_count=total_count,
            runtime_ms=avg_time,
            memory_kb=max_memory_kb,
            compile_output=compile_output,
            ai_evaluation=ai_evaluation
        )


execution_service = ExecutionService()