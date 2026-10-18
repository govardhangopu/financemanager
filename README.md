# Finance Manager

A personal finance web application for tracking transactions, organizing categories and budgets, setting goals, and exploring forecasts and what-if scenarios.

## Features

- Create, update, and delete transactions and categories
- Organize budgets and review spending progress
- Set financial goals and view projections
- Explore forecasts and what-if scenarios
- View financial summaries and charts on the dashboard
- Sign in with a password or Google

## Technology

- Frontend: React, Vite, React Router, Axios, Chart.js
- Backend: Node.js, Express, MySQL
- Authentication: JWT and Google OAuth

## Local development

### Prerequisites

- Node.js and npm
- MySQL
- Google OAuth credentials and a Resend API key (required by the current backend configuration)

### Create a fresh database

From the repository root, import the baseline schema:

```bash
mysql --host=localhost --user=root --password < backend/config/schema.sql
```

This creates the `financemanager` database and all tables used by the current backend. Set `MYSQLDATABASE=financemanager` in `backend/.env`.

`schema.sql` is for creating a fresh database, not upgrading an existing one. The backend does not create or alter tables at startup. Back up an existing database and apply a reviewed migration before deploying schema changes; `CREATE TABLE IF NOT EXISTS` does not alter existing table definitions.

### Configure environment

Copy the examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Configure the MySQL connection and a strong `JWT_SECRET` in `backend/.env`. Configure the Google OAuth client credentials, callback URLs, frontend/backend URLs, and Resend API key for the current backend to initialize and for those integrations to work. Do not commit `.env` files.

The backend defaults to port `4000`; `frontend/.env.example` points to that port. If you change the backend port, update `VITE_API_URL` and the OAuth callback URLs accordingly.

### Install dependencies and start

From the repository root:

```bash
npm ci --prefix backend
npm ci --prefix frontend
```

Start the backend and frontend in separate terminals:

```bash
npm run dev --prefix backend
```

```bash
npm run dev --prefix frontend
```

The backend verifies its database connection before accepting requests. Open the URL printed by Vite.

## Repository structure

- `backend/` — Express API, SQL schema, and MySQL repositories
- `frontend/` — React application
- `docs/` — project design notes and diagrams
