# Finance Manager backend

The backend is a Node.js/Express API backed by MySQL. The repository-wide setup is in the [root README](../README.md), and complete API, schema, and deployment notes are in [`docs/`](../docs/README.md).

## Local development

From the repository root:

```bash
npm ci --prefix backend
npm run dev --prefix backend
```

The API listens on `PORT` or defaults to port `4000`. It checks the database connection before serving. Create a fresh MySQL database from `config/schema.sql`; the backend does not automatically migrate an existing database at startup. `npm start` runs the production server entry point.

Configure values from `.env.example` in `backend/.env`. The required groups include MySQL connection values and a strong `JWT_SECRET`; Google OAuth URLs/credentials and `RESEND_API_KEY` configure account integrations. Keep `.env` out of version control. `MYSQLHOST` is used by the application regardless of whether the backend itself runs directly on the host or inside a container.

## Useful entry points

- `src/app.js` — Express app, middleware, CORS, and route mounting.
- `src/routes/` — HTTP route definitions.
- `src/controllers/` — request/response handling.
- `src/services/` — feature calculations and business logic.
- `src/repositories/` — database access.
- `config/schema.sql` — fresh-database schema.

The root `GET /` route checks API/database availability. Feature routes and auth requirements are listed in [API reference](../docs/APIReference.md).
