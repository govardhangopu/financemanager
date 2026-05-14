# Finance Manager

A web application for managing personal and organizational finances. Track expenses, income, budgets, and view financial reports through a React frontend and Express API.

## Repository structure

- `backend/` — Express API server using MySQL
- `frontend/` — React app built with Vite

## Features

- Add, edit, and delete transactions
- Create and Track your own Budgets
- Simulate Budgets using Partial Budgeting Feature
- Categorize expenses and income
- Visualize financial data with charts
- User authentication with JWT

## Installation

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with the following values:

```env
PORT=5000
DB_HOST=
DB_USER=
DB_PASS=
DB_NAME=
JWT_SECRET=
```

Start the backend:

```bash
npm start
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/` with the backend URL:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend for development:

```bash
npm run dev
```

## Running locally

1. Start the backend in `backend/`.
2. Start the frontend in `frontend/`.
3. Open the local URL shown by Vite.

## Database setup

The backend uses MySQL. Run the schema file at `backend/config/schema.sql` against your MySQL server to create the required database and tables.

## Usage

- Log in or create an account.
- Add your financial transactions.
- View summaries and reports.

## Contributing

Contributions are welcome! Please open issues or submit pull requests.

## License

This project is licensed under the MIT License.