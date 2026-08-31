import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_bookmarks_and_notes_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Login
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "developer@dsatracker.dev",
            "password": "SecurePassword123!"
        })
        token = login_res.json()["session"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        q_id = "a0000000-0000-0000-0000-000000000002"

        # 1. Toggle bookmark ON
        bm_res = await client.post(f"/api/v1/bookmarks/{q_id}", headers=headers)
        assert bm_res.status_code == 200
        assert bm_res.json()["is_bookmarked"] is True

        # 2. Check bookmarks list
        list_bm = await client.get("/api/v1/bookmarks", headers=headers)
        assert q_id in list_bm.json()

        # 3. Save Personal Note
        note_res = await client.post("/api/v1/notes", json={
            "question_id": q_id,
            "content": "Remember to handle odd length strings."
        }, headers=headers)
        assert note_res.status_code == 200
        assert note_res.json()["content"] == "Remember to handle odd length strings."

        # 4. Fetch Note
        get_note_res = await client.get(f"/api/v1/notes/{q_id}", headers=headers)
        assert get_note_res.status_code == 200
        assert get_note_res.json()["content"] == "Remember to handle odd length strings."


@pytest.mark.asyncio
async def test_revision_queue_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "developer@dsatracker.dev",
            "password": "SecurePassword123!"
        })
        token = login_res.json()["session"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        q_id = "a0000000-0000-0000-0000-000000000003"

        # Update revision status to Needs Revision
        rev_res = await client.post("/api/v1/revision/status", json={
            "question_id": q_id,
            "status": "Needs Revision"
        }, headers=headers)
        assert rev_res.status_code == 200

        # List revision queue
        list_rev = await client.get("/api/v1/revision", headers=headers)
        assert list_rev.status_code == 200
        items = list_rev.json()
        assert any(item["question_id"] == q_id for item in items)


@pytest.mark.asyncio
async def test_admin_question_crud_and_publishing_validation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Admin login
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "admin@dsatracker.dev",
            "password": "Admin123!"
        })
        token = login_res.json()["session"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Create Draft Question
        create_res = await client.post("/api/v1/admin/questions", json={
            "code": "CUSTOM-INVERT-BT",
            "title": "Invert Binary Tree",
            "description": "Given the root of a binary tree, invert the tree, and return its root.",
            "constraints": "Number of nodes is [0, 100].",
            "examples": [{"input": "4 2 7 1 3 6 9", "output": "4 7 2 9 6 3 1", "explanation": "Inverted tree"}],
            "difficulty": "Easy",
            "topic": "Trees",
            "pattern": "DFS",
            "company_tags": ["Google"],
            "status": "Draft",
            "starter_templates": {"python": "class Solution:\n    pass"}
        }, headers=headers)
        assert create_res.status_code == 201
        created_q = create_res.json()
        q_id = created_q["id"]

        # 2. Attempt to publish without test cases -> should fail (validation rule!)
        pub_fail = await client.put(f"/api/v1/admin/questions/{q_id}", json={
            "status": "Published"
        }, headers=headers)
        assert pub_fail.status_code == 400

        # 3. Add visible test case
        tc1_res = await client.post(f"/api/v1/admin/questions/{q_id}/test-cases", json={
            "input": "4 2 7",
            "expected_output": "4 7 2",
            "is_hidden": False,
            "order_index": 1
        }, headers=headers)
        assert tc1_res.status_code == 201

        # 4. Add hidden test case
        tc2_res = await client.post(f"/api/v1/admin/questions/{q_id}/test-cases", json={
            "input": "1 2",
            "expected_output": "1 null 2",
            "is_hidden": True,
            "order_index": 2
        }, headers=headers)
        assert tc2_res.status_code == 201

        # 5. Now publish should succeed!
        pub_success = await client.put(f"/api/v1/admin/questions/{q_id}", json={
            "status": "Published"
        }, headers=headers)
        assert pub_success.status_code == 200
        assert pub_success.json()["status"] == "Published"

        # 6. Delete question
        del_res = await client.delete(f"/api/v1/admin/questions/{q_id}", headers=headers)
        assert del_res.status_code == 200