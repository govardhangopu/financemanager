# API reference

The API is an Express service. All feature routes below are mounted under the path shown. Protected routes require the application's JWT authentication. The frontend uses `VITE_API_URL` as the API origin.

This is a route map, not a substitute for the validation and response code in `backend/src/routes/` and `backend/src/controllers/`. Request bodies are JSON unless noted. Database mutation endpoints commonly return MySQL result metadata; read endpoints return feature objects or arrays. The current global error handler responds with status 500 and `{ "message": "..." }` for forwarded errors, including some input-validation errors.

## Health

| Method | Path | Auth | Purpose |
|---|---|---:|---|
| GET | `/` | No | Check API and database availability (`SELECT 1`) |

## Users and authentication — `/users`

| Method | Path | Auth | Purpose |
|---|---|---:|---|
| POST | `/signup` | No | Create an account |
| POST | `/login` | No | Sign in and receive authentication data |
| GET | `/auth/status` | Yes | Read signed-in user status |
| PUT | `/password` | Yes | Change password |
| PUT | `/password/set` | Yes | Set a password for an account without one |
| POST | `/password/forgot` | No | Request a password reset email |
| GET | `/password/reset/verify` | No | Verify a reset token |
| POST | `/password/reset` | No | Reset a password using a token |
| PATCH | `/profile` | Yes | Update profile details |
| DELETE | `/account` | Yes | Delete the signed-in account |
| GET | `/google` | No | Start Google sign-in |
| GET | `/google/callback` | No | Google sign-in callback |
| GET | `/google/link/start` | Yes | Start linking Google to the signed-in account |
| GET | `/google/link` | No | OAuth state handoff |
| GET | `/google/link/callback` | No | Google account-link callback |
| DELETE | `/google/link` | Yes | Unlink Google |

## Transactions — `/transactions` (all routes require auth)

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | List the user's transactions; supports the legacy `is_partial` query filter |
| POST | `/` | Create a transaction |
| PUT | `/` | Update a transaction (ID is supplied in the body) |
| DELETE | `/:id` | Delete a transaction |

Transactions are categorized as income or expense through their category. A transaction may have no category after its category is deleted. See [Transactions, categories, and budgets](TransactionsCategoriesBudgets.md).

## Categories — `/categories` (all routes require auth)

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | List available categories for the user; supports legacy `is_partial` filter |
| POST | `/` | Create a category |
| PUT | `/` | Update a category (ID is supplied in the body) |
| DELETE | `/:id` | Delete a category; linked transactions are retained with a null category |

## Budgets — `/budgets` (all routes require auth)

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | List budgets |
| POST | `/` | Create a budget |
| GET | `/:budgetid` | Read one budget |
| PUT | `/` | Update a budget (ID is supplied in the body) |
| DELETE | `/:budgetid` | Delete a budget |
| GET | `/:budgetid/progress` | Read budget spending and progress |
| GET | `/:budgetid/transactions` | Read transactions in the budget period/category scope |
| GET | `/:budgetid/categories` | Read budget categories |
| POST | `/:budgetid/category/:categoryid` | Associate a category |
| DELETE | `/:budgetid/category/:categoryid` | Remove a category association |
| POST | `/:budgetid/transaction/:transactionid` | Associate a transaction |
| DELETE | `/:budgetid/transaction/:transactionid` | Remove a transaction association |

## Scenarios — `/scenarios` (all routes require auth)

| Method | Path | Purpose |
|---|---|---|
| GET, POST | `/` | List or create scenarios |
| GET, PUT, DELETE | `/:scenarioid` | Read, update, or delete a scenario |
| GET, POST | `/:scenarioid/changes` | List or add changes |
| GET | `/:scenarioid/changes/:scenario_changeid` | Read one change |
| PUT, DELETE | `/:scenarioid/changes/:scenario_changeid` | Update or delete one change |
| GET | `/:scenarioid/projection?months=12&start_date=YYYY-MM-DD` | Read a saved scenario projection |
| POST | `/:scenarioid/projection` | Calculate a projection; body may provide `months`, `start_date`, and an array of `changes` |

Scenario changes describe recurring or one-time income/expense adjustments against a category, pattern, or new item. They do not create a scenario copy of the transaction table. See [Scenarios](FinancialScenarioEngine.md).

## Baseline and forecast

| Method | Path | Auth | Purpose |
|---|---|---:|---|
| GET | `/baseline?months=12` | Yes | Read average monthly baseline projection; `months` is bounded to 1–120 |
| GET | `/forecast?months=12&start_date=YYYY-MM-DD` | Yes | Build forecast; `months` is bounded to 1–120 |

See [Forecast and goals](ForecastAndGoals.md) for calculation and response examples.

## Goals — `/goals` (all routes require auth)

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | List goals with waterfall allocation |
| POST | `/` | Create a goal |
| PUT | `/:goalid` | Update a goal |
| DELETE | `/:goalid` | Delete a goal |
| PUT | `/reorder` | Persist priority order; body is `{ "goalIds": [12, 7, 9] }` |
| GET | `/:goalid/projection` | Read one goal's projection |

The reorder list should contain the user's complete ordered set of goal IDs. Goal response fields and chart behavior are described in [Forecast and goals](ForecastAndGoals.md).

## Demo mode

The public demo uses a frontend-local adapter and synthetic data. It does not call these authenticated endpoints for demo mutations. This keeps demo edits isolated to the browser. See [Authentication and demo](AuthenticationAndDemo.md).
