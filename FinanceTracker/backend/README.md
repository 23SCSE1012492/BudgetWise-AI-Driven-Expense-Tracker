# Finance Tracker Backend (Node/Express + SQLite)

This backend implements a minimal REST API for the Personal Finance Tracker project. It uses:
- Node.js + Express
- Sequelize ORM with SQLite (file DB) for easy local development
- JWT-based authentication
- Bcrypt for password hashing

Quick start
-----------
1. Copy `.env.example` to `.env` and edit values (at minimum set `JWT_SECRET`).
2. Install dependencies:

```powershell
cd backend
npm install
```

3. Start the server:

```powershell
npm run dev   # requires nodemon
# or
npm start
```

4. The API will be available on `http://localhost:4000` by default.

Endpoints (summary)
-------------------
- `POST /api/auth/register` — register { name, email, password }
- `POST /api/auth/login` — login { email, password }
- `GET /api/users/me` — get profile (auth)
- `PUT /api/users/me` — update profile (auth)
- `GET /api/transactions` — list transactions (auth)
- `POST /api/transactions` — create transaction (auth)
- `PUT /api/transactions/:id` — update transaction (auth)
- `DELETE /api/transactions/:id` — delete transaction (auth)

Notes & next steps
------------------
- This scaffold is intentionally simple to integrate quickly with the client-side app.
- For production use, switch to PostgreSQL/MySQL, add migrations, rate-limiting, input validation, and stricter error handling.
- Add endpoints for budgets, goals, analytics, export (CSV/PDF), and cloud backup integrations.

Packaging the backend
---------------------
You can create a zip archive of the `backend/` folder for distribution or upload. A helper PowerShell script is included at the repository root: `package-backend.ps1`.

From the project root (Windows PowerShell) run:

```powershell
.\package-backend.ps1
# or specify custom paths
.\package-backend.ps1 -Source .\backend -Destination .\backend.zip
```

The script creates `backend.zip` containing the `backend/` folder. If a file with the same name exists it will be overwritten.
