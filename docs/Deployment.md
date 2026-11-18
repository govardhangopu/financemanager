# Deployment and operations

## Current deployment

The application uses a React/Vite frontend, an Express API, and a MySQL database. This guide covers local setup and the environment configuration needed to run the app.

The frontend and API are separate services. The frontend calls the API origin configured in `VITE_API_URL`. The API connects to MySQL using the `MYSQL*` variables and must have production frontend/backend origins and OAuth callback URLs configured. CORS currently allows the local Vite origin and the known Vercel frontend hostname; update `backend/src/app.js` when deployment hostnames change.

## Local setup

1. Install a supported Node.js version, npm, and MySQL.
2. Create a fresh database using `backend/config/schema.sql` (the script creates/uses the `financemanager` database).
3. Copy `backend/.env.example` and `frontend/.env.example` to local `.env` files and fill in values. The backend falls back to `localhost`, MySQL's default port, and the `financemanager` database when connection settings are omitted; explicitly set `MYSQLHOST=localhost` for direct local use if needed.
4. Install packages with `npm ci --prefix backend` and `npm ci --prefix frontend` using the checked-in lockfiles.
5. Run the API with `npm run dev --prefix backend`, then the frontend with `npm run dev --prefix frontend`.

The backend uses `PORT` (defaults to 4000) and needs valid MySQL credentials before it starts serving. `MYSQLHOST` is a database host setting, not a Docker-only setting; a local run can point it at localhost while a container can receive a different host value through its own environment. The frontend's local API URL is in `frontend/.env.example`.

See [Backend README](../backend/README.md) and [Frontend README](../frontend/README.md) for service-specific setup. Keep secrets in deployment environment settings or ignored `.env` files. Never commit credentials.

## Important environment variables

| Variable | Used by | Purpose |
|---|---|---|
| `PORT` | Backend | HTTP listen port |
| `MYSQLHOST`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`, `MYSQLPORT` | Backend | MySQL connection |
| `JWT_SECRET` | Backend | Signs/verifies authentication tokens |
| `FRONTEND_URL`, `BACKEND_URL` | Backend | Origin and OAuth URL construction |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Backend | Google OAuth |
| `GOOGLE_CALLBACK_URL`, `GOOGLE_LINK_CALLBACK_URL` | Backend | OAuth callbacks |
| `RESEND_API_KEY` | Backend | Password reset email delivery |
| `VITE_API_URL` | Frontend | API base URL; public in the built app |

Use the checked-in `.env.example` files as the authoritative list. Some values are only necessary for the integration they configure, but current backend initialization may expect more than a minimal local setup.

## Schema changes and database safety

`schema.sql` creates a fresh schema; `CREATE TABLE IF NOT EXISTS` does not migrate existing columns. For production changes, back up first, prepare a reviewed migration, apply it to the target database, and deploy code compatible with that schema. The project does not currently have an automatic migration runner documented here.

