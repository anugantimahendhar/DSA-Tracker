# DSA Tracker — Production-Quality MVP

A modern, high-performance Data Structures and Algorithms practice and progress tracking platform.

**Core Workflow**: `DISCOVER → PRACTICE → RUN → SUBMIT → TRACK → REVISE → IMPROVE`

---

## 🌟 Key Features

1. **Problem Explorer & Multi-Dimensional Filtering**:
   - Filter by Topic (Arrays, Hashing, Trees, Graphs, DP, etc.), Difficulty (Easy, Medium, Hard), Status (Solved, Attempted, Not Started), Pattern, and Bookmark status.
   - Fast keyword search across titles and descriptions.

2. **Monaco Code Editor & Live Multi-Language Execution**:
   - Full Monaco Editor with syntax highlighting, automatic indentation, and code reset.
   - Multi-language support: **Python 3**, **JavaScript (Node.js)**, **C++ (GCC)**, and **Java (OpenJDK)**.
   - Dual-layer sandboxed code runner: Judge0 API with sandboxed local runner fallback.
   - **Privacy Guarantee**: Hidden test cases are evaluated strictly on the backend and are never returned or exposed to the client.

3. **Debounced Autosave Drafts**:
   - Automatically saves and persists code drafts per `user + question + language` with a 1.5-second debounce.

4. **Guaranteed Progress Tracking Invariants**:
   - Solving a problem permanently marks it `SOLVED`. Subsequent failed submissions will **never** revert a solved question back to `ATTEMPTED`.
   - Real-time streaks (current streak, longest streak) and weekly active days tracker.

5. **Revision Queue & Retention System**:
   - Classifies problems into `Needs Revision`, `Comfortable`, and `Mastered`.
   - Flags problems as **Struggled** if they have 2+ failed attempts.
   - Highlights problems due for review today.

6. **Transparent Performance Analytics**:
   - Interactive charts powered by Recharts (Submissions activity timeline, error breakdown distribution: Wrong Answer, TLE, Runtime Error, Compile Error).
   - Topic mastery and strengths/growth areas breakdown.

7. **Personal Notes & Bookmarks**:
   - Private personal notes per question with 1-click saving and autosave.
   - Star bookmarking to curate custom practice lists.

8. **Admin Question Bank & Test Case Management**:
   - Role-based access control (`admin` vs `user`) enforced by FastAPI backend (403 Forbidden for unauthorized requests).
   - Admin questions CRUD with draft vs published states.
   - Visible test cases vs Hidden test cases management.

---

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Monaco Editor (`@monaco-editor/react`), TanStack Query, React Router, Lucide React, Recharts, Canvas Confetti, Axios.
- **Backend**: Python 3.14, FastAPI, Pydantic v2, Uvicorn, Pytest, HTTPX, PyJWT.
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS) + In-memory mock engine for local testing.

---

## 🚀 Getting Started

### 1. Backend Server
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # Windows (or source venv/bin/activate on Linux/Mac)
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Root: `http://127.0.0.1:8000`
- Interactive Swagger Docs: `http://127.0.0.1:8000/docs`

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
- Web UI: `http://127.0.0.1:5173`

---

## 🔑 Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@dsatracker.dev` | `Admin123!` |
| **Developer / User** | `developer@dsatracker.dev` | `SecurePassword123!` |

*Guest users can browse problems and visible test cases without logging in. Clicking 'Run' or 'Submit' prompts login via the unified Auth Modal.*

---

## 🧪 Testing

Run the full automated integration test suite:
```bash
backend\venv\Scripts\pytest.exe -v
```
---

## DSA Tracker01 — AI + 3D Upgrade

This copy adds the requested AI-assisted authoring, AI submission scoring, scoreboard, Google redirect sign-in, signed-in profile details, and a black/white 3D visual system.

### AI Question Summary (Admin)

Open **Admin → Create New Problem**. Type only a short title/question such as `Longest palindromic substring`, then click **AI Summary — Fill Complete Question**. The backend fills the problem code, full description, constraints, explanation, difficulty, topic, pattern, tags, starter templates, examples, and suggested test cases. The admin should review generated content before publishing.

The AI endpoint is `POST /api/v1/ai/generate-question`. If `GEMINI_API_KEY` is configured, the server calls Gemini and requests structured JSON. If no key is configured or the provider is temporarily unavailable, the app uses a deterministic smart fallback so the UI still works; the fallback is intentionally conservative and may require more admin editing.

### AI Submission Score + Scoreboard

After **Submit**, the normal judge remains the source of truth for correctness. The AI/rules layer never receives hidden test inputs. It produces a transparent score from `0–10` using test pass percentage, code-quality signals, and a small difficulty adjustment. The submission modal displays the score and feedback, and the points are accumulated in **Scoreboard**. Daily submission activity automatically feeds the existing streak calculation.

For persistent scores in Supabase, run `backend/supabase/migrations/002_ai_scoring_leaderboard.sql` after the existing initial migration. Without that optional table the development server falls back to in-memory scores.

### Enable Live Gemini

Add these to `backend/.env`:

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=your_current_supported_gemini_model
```

The model name is configurable because provider model availability changes over time.

### Enable Google Redirect Login

The login/register modal now shows **OR → Continue with Google**. It uses Supabase OAuth and redirects back to `${window.location.origin}/dashboard` after Google authentication.

1. In **Supabase → Authentication → Providers**, enable Google and add the Google OAuth client ID/secret.
2. In Google Cloud, add the Supabase callback URL shown by Supabase (normally `https://<project-ref>.supabase.co/auth/v1/callback`) as an **Authorized redirect URI**.
3. In **Supabase → Authentication → URL Configuration**, set the local Site URL to `http://localhost:5173` and add `http://localhost:5173/dashboard` to Redirect URLs. Add your production domain equivalents when deployed.
4. Keep `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `frontend/.env`.

### Run This Project

Backend (Windows PowerShell):

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Frontend (new terminal):

```powershell
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173`.


## Notification upgrade
This version includes a user/admin notification center. Before using notifications with Supabase, run `backend/supabase/migrations/003_notifications.sql` in the Supabase SQL editor (or apply it through your normal migration workflow). Users receive a notification when an admin publishes a new problem; admins receive a notification the first time a user solves a problem. The bell polls every 15 seconds and also refreshes when the browser regains focus.
