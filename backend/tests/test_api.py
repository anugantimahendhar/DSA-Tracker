import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_guest_can_list_and_view_questions():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/v1/questions")
        assert res.status_code == 200
        data = res.json()
        assert len(data) >= 8
        first_q = data[0]
        assert "title" in first_q
        assert "difficulty" in first_q

        detail_res = await client.get(f"/api/v1/questions/{first_q['id']}")
        assert detail_res.status_code == 200
        detail_data = detail_res.json()
        assert "description" in detail_data
        assert "visible_test_cases" in detail_data
        # Hidden tests should NOT be in visible_test_cases
        for tc in detail_data["visible_test_cases"]:
            assert tc["is_hidden"] is False


@pytest.mark.asyncio
async def test_guest_cannot_run_code_without_auth():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/v1/code/run", json={
            "question_id": "a0000000-0000-0000-0000-000000000001",
            "language": "python",
            "code": "print('hello')"
        })
        assert res.status_code == 401


@pytest.mark.asyncio
async def test_user_registration_and_login():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        email = "developer@dsatracker.dev"
        password = "SecurePassword123!"
        
        # Register
        reg_res = await client.post("/api/v1/auth/register", json={
            "email": email,
            "password": password,
            "default_language": "python"
        })
        assert reg_res.status_code in (201, 400)
        
        # Login
        login_res = await client.post("/api/v1/auth/login", json={
            "email": email,
            "password": password
        })
        assert login_res.status_code == 200
        login_data = login_res.json()
        token = login_data["session"]["access_token"]
        assert token is not None

        # Verify /auth/me
        me_res = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_res.status_code == 200
        assert me_res.json()["email"] == email


@pytest.mark.asyncio
async def test_code_run_and_submit_workflow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Login test user
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "developer@dsatracker.dev",
            "password": "SecurePassword123!"
        })
        token = login_res.json()["session"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        q1_id = "a0000000-0000-0000-0000-000000000001" # Two sum

        correct_solution = """import sys
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        comp = target - num
        if comp in seen:
            return f"{seen[comp]} {i}"
        seen[num] = i
    return ""

if __name__ == "__main__":
    lines = sys.stdin.read().splitlines()
    if lines:
        nums = list(map(int, lines[0].strip().split()))
        target = int(lines[1].strip())
        print(two_sum(nums, target))
"""

        # 1. Run Visible Tests
        run_res = await client.post("/api/v1/code/run", json={
            "question_id": q1_id,
            "language": "python",
            "code": correct_solution
        }, headers=headers)
        assert run_res.status_code == 200
        run_data = run_res.json()
        assert run_data["success"] is True
        assert run_data["passed_tests"] == run_data["total_tests"]

        # 2. Check Progress is now ATTEMPTED
        prog_res = await client.get(f"/api/v1/progress/{q1_id}", headers=headers)
        assert prog_res.status_code == 200
        assert prog_res.json()["status"] == "ATTEMPTED"

        # 3. Submit Correct Solution
        sub_res = await client.post("/api/v1/code/submit", json={
            "question_id": q1_id,
            "language": "python",
            "code": correct_solution
        }, headers=headers)
        assert sub_res.status_code == 200
        sub_data = sub_res.json()
        assert sub_data["status"] == "Accepted"
        assert sub_data["passed_count"] == sub_data["total_count"]

        # 4. Check Progress is now SOLVED
        prog_res_after = await client.get(f"/api/v1/progress/{q1_id}", headers=headers)
        assert prog_res_after.json()["status"] == "SOLVED"

        # 5. Subsequent failed submission should NOT revert SOLVED to ATTEMPTED
        fail_res = await client.post("/api/v1/code/submit", json={
            "question_id": q1_id,
            "language": "python",
            "code": "print('wrong answer')"
        }, headers=headers)
        assert fail_res.status_code == 200
        assert fail_res.json()["status"] in ("Wrong Answer", "Runtime Error")

        prog_res_final = await client.get(f"/api/v1/progress/{q1_id}", headers=headers)
        assert prog_res_final.json()["status"] == "SOLVED"  # INVARIANT PRESERVED!


@pytest.mark.asyncio
async def test_non_admin_cannot_access_admin_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Regular user login
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "developer@dsatracker.dev",
            "password": "SecurePassword123!"
        })
        token = login_res.json()["session"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Admin stats should 403
        admin_res = await client.get("/api/v1/admin/stats", headers=headers)
        assert admin_res.status_code == 403


@pytest.mark.asyncio
async def test_admin_can_access_admin_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Admin login
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "admin@dsatracker.dev",
            "password": "Admin123!"
        })
        token = login_res.json()["session"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        admin_res = await client.get("/api/v1/admin/stats", headers=headers)
        assert admin_res.status_code == 200
        data = admin_res.json()
        assert "total_questions" in data
        assert "difficulty_distribution" in data