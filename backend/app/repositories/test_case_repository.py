import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from app.integrations.supabase_client import supabase_service


class TestCaseRepository:
    def __init__(self):
        self.service = supabase_service

    async def list_for_question(self, question_id: str, include_hidden: bool = False) -> List[Dict[str, Any]]:
        if not self.service.is_mock and self.service._admin_client:
            query = self.service._admin_client.table("test_cases").select("*").eq("question_id", question_id)
            if not include_hidden:
                query = query.eq("is_hidden", False)
            query = query.order("order_index", desc=False)
            res = query.execute()
            return res.data or []

        cases = [tc for tc in self.service._mock_test_cases if tc.get("question_id") == question_id]
        if not include_hidden:
            cases = [tc for tc in cases if not tc.get("is_hidden", False)]
        return sorted(cases, key=lambda x: x.get("order_index", 0))

    async def get_by_id(self, test_case_id: str) -> Optional[Dict[str, Any]]:
        if not self.service.is_mock and self.service._admin_client:
            try:
                res = self.service._admin_client.table("test_cases").select("*").eq("id", test_case_id).single().execute()
                return res.data
            except Exception:
                return None
        for tc in self.service._mock_test_cases:
            if tc.get("id") == test_case_id:
                return tc
        return None

    async def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        data["id"] = str(uuid.uuid4())
        data["created_at"] = datetime.now(timezone.utc).isoformat()
        if "is_hidden" not in data:
            data["is_hidden"] = False
        if "order_index" not in data:
            data["order_index"] = 1

        if not self.service.is_mock and self.service._admin_client:
            res = self.service._admin_client.table("test_cases").insert(data).execute()
            return res.data[0]

        self.service._mock_test_cases.append(data)
        return data

    async def update(self, test_case_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not self.service.is_mock and self.service._admin_client:
            res = self.service._admin_client.table("test_cases").update(updates).eq("id", test_case_id).execute()
            return res.data[0] if res.data else None

        for tc in self.service._mock_test_cases:
            if tc.get("id") == test_case_id:
                tc.update(updates)
                return tc
        return None

    async def delete(self, test_case_id: str) -> bool:
        if not self.service.is_mock and self.service._admin_client:
            self.service._admin_client.table("test_cases").delete().eq("id", test_case_id).execute()
            return True

        self.service._mock_test_cases = [tc for tc in self.service._mock_test_cases if tc.get("id") != test_case_id]
        return True


test_case_repository = TestCaseRepository()