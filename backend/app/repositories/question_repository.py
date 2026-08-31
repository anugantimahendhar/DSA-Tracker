import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from app.integrations.supabase_client import supabase_service


class QuestionRepository:
    def __init__(self):
        self.service = supabase_service

    async def list_questions(
        self,
        status: Optional[str] = "Published",
        difficulty: Optional[str] = None,
        topic: Optional[str] = None,
        pattern: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        if not self.service.is_mock and self.service._admin_client:
            query = self.service._admin_client.table("questions").select("*")
            if status:
                query = query.eq("status", status)
            if difficulty:
                query = query.eq("difficulty", difficulty)
            if topic:
                query = query.eq("topic", topic)
            if pattern:
                query = query.eq("pattern", pattern)
            if search:
                query = query.ilike("title", f"%{search}%")
            query = query.order("created_at", desc=False).range(offset, offset + limit - 1)
            res = query.execute()
            return res.data or []

        # Mock store query
        results = list(self.service._mock_questions.values())
        if status:
            results = [q for q in results if q.get("status") == status]
        if difficulty:
            results = [q for q in results if q.get("difficulty", "").lower() == difficulty.lower()]
        if topic:
            results = [q for q in results if q.get("topic", "").lower() == topic.lower()]
        if pattern:
            results = [q for q in results if q.get("pattern", "").lower() == pattern.lower()]
        if search:
            s = search.lower()
            results = [q for q in results if s in q.get("title", "").lower() or s in q.get("description", "").lower()]
        
        return results[offset:offset + limit]

    async def get_by_id(self, question_id: str) -> Optional[Dict[str, Any]]:
        if not self.service.is_mock and self.service._admin_client:
            try:
                res = self.service._admin_client.table("questions").select("*").eq("id", question_id).single().execute()
                return res.data
            except Exception:
                return None
        return self.service._mock_questions.get(question_id)

    async def get_by_code(self, code: str) -> Optional[Dict[str, Any]]:
        if not self.service.is_mock and self.service._admin_client:
            try:
                res = self.service._admin_client.table("questions").select("*").eq("code", code).single().execute()
                return res.data
            except Exception:
                return None
        for q in self.service._mock_questions.values():
            if q.get("code", "").upper() == code.upper():
                return q
        return None

    async def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        data["id"] = str(uuid.uuid4())
        data["created_at"] = datetime.now(timezone.utc).isoformat()
        data["updated_at"] = datetime.now(timezone.utc).isoformat()
        if "status" not in data:
            data["status"] = "Draft"
        if "starter_templates" not in data:
            data["starter_templates"] = {}
        if "examples" not in data:
            data["examples"] = []
        if "company_tags" not in data:
            data["company_tags"] = []

        if not self.service.is_mock and self.service._admin_client:
            res = self.service._admin_client.table("questions").insert(data).execute()
            return res.data[0]

        self.service._mock_questions[data["id"]] = data
        return data

    async def update(self, question_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        if not self.service.is_mock and self.service._admin_client:
            res = self.service._admin_client.table("questions").update(updates).eq("id", question_id).execute()
            return res.data[0] if res.data else None

        if question_id in self.service._mock_questions:
            self.service._mock_questions[question_id].update(updates)
            return self.service._mock_questions[question_id]
        return None

    async def delete(self, question_id: str) -> bool:
        if not self.service.is_mock and self.service._admin_client:
            self.service._admin_client.table("questions").delete().eq("id", question_id).execute()
            return True
        if question_id in self.service._mock_questions:
            del self.service._mock_questions[question_id]
            # remove associated test cases
            self.service._mock_test_cases = [tc for tc in self.service._mock_test_cases if tc.get("question_id") != question_id]
            return True
        return False


question_repository = QuestionRepository()