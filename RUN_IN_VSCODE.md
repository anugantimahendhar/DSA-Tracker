# Run DSA Tracker Premium in VS Code (Windows)

## 1. Supabase notification table
Open Supabase -> SQL Editor and run:

`backend/supabase/migrations/003_notifications.sql`

This is required once for the new notification bell.

## 2. Backend
Open a VS Code terminal in `backend`:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

API docs: `http://127.0.0.1:8000/api/v1/docs`

## 3. Frontend
Open another VS Code terminal in `frontend`:

```powershell
npm install
npm run dev
```

Then open the Vite URL shown in the terminal (normally `http://localhost:3000`).

## Notifications included
- User: notified when an admin publishes a new DSA problem.
- Admin: notified the first time a user successfully solves a problem.
- Bell badge with unread count.
- Mark one notification read by opening it.
- Mark all notifications read.
- Polls every 15 seconds and refreshes when the browser regains focus.

## Premium UI
- User experience: violet / indigo algorithm-lab visual identity.
- Admin experience: cyan / blue operations-console visual identity.
- Different navigation for admin and normal user.
- Project-wide Sora typography with JetBrains Mono for code/technical text.
