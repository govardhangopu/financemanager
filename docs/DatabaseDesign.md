# Database design

The authoritative schema is [`backend/config/schema.sql`](../backend/config/schema.sql). This document summarizes the current MySQL tables and relationships; it does not define a future schema.

## Tables

| Table | Purpose and principal fields |
|---|---|
| `users` | Account identity: `userid`, `name`, unique `username`, nullable `password`, unique `email` |
| `oauth_accounts` | Optional Google identity: `id`, unique `userid`, unique `provider_user_id`, optional `provider_email` |
| `categories` | User-owned or shared classification: `categoryid`, `name`, `type` (`income`/`expense`), nullable `parent_categoryid`, nullable `userid` |
| `transactions` | Cash flow: `transactionid`, `userid`, `amount` (`DECIMAL(10,2)`), nullable `categoryid`, legacy `is_partial`, `date` (`DATETIME`) |
| `budgets` | User's spending plan: `budgetid`, `userid`, `status`, `target_amount`, `name`, `description`, `budget_type`, `start_date`, nullable `end_date` |
| `budget_categories` | Many-to-many link between budgets and selected categories |
| `budget_transactions` | Many-to-many transaction association table; see the implementation note below |
| `goals` | Savings target: `goalid`, `userid`, `name`, `target_amount`, `target_date`, `description`, `priority_order`, timestamps |
| `scenarios` | User-owned what-if plan: `scenarioid`, `userid`, `name`, `description`, timestamps |
| `scenario_changes` | Persistent scenario adjustment: `scenario_changeid`, change/target type, optional category/type, direction, amount, optional frequency, start/end dates, description, timestamps |
| `password_reset_tokens` | Hashed, expiring reset token: `userid`, `token_hash`, `expires_at`, optional `used_at`, `created_at` |

The `categories` and `transactions` tables still contain an `is_partial` column in the current schema and API. It is a legacy compatibility field, not a current product concept to use in new feature designs. Removing it safely requires a separate code and schema migration.

The schema's physical column names and table shapes are authoritative. For example, OAuth identity uses `oauth_accounts.id`, category hierarchy uses `parent_categoryid`, and transaction `description` is not a stored column in the current schema. The category table also contains legacy `is_partial`.

## Relationships and deletion behavior

- A user can own many transactions, budgets, goals, scenarios, categories, and password reset tokens. User-owned rows cascade on account deletion where the schema defines the foreign key.
- An OAuth account is one-to-one with a user and is deleted with that user.
- Categories form a parent/child tree. Deleting a parent cascades to child categories.
- A transaction's category is nullable. Deleting the category sets the transaction's `categoryid` to `NULL`, preserving the transaction.
- Budgets and categories are associated through `budget_categories`; deleting a budget or category removes the link.
- Budgets and transactions have a `budget_transactions` link table; deleting either linked row removes the association.
- A scenario owns many scenario changes. Deleting a scenario cascades to its changes.
- A scenario change's optional category is set to `NULL` if that category is deleted. The change remains stored and the scenario UI can identify it as unavailable/excluded.
- A goal belongs to a user and stores priority directly in `priority_order`.

See [CurrentERDiagram.mmd](diagrams/CurrentERDiagram.mmd) for the current relationship diagram.

## Scenario data model

The implementation uses `scenarios` and `scenario_changes`. It does not attach hypothetical transactions to a `scenarioid` column on `transactions`, and it does not use the proposed `scenario_operations` table shown in the historical diagram.

`scenario_changes` supports:

- `change_type`: `recurring` or `one_time`
- `target_type`: `category`, `pattern`, or `new`
- `direction`: `increase` or `decrease`
- `frequency`: currently `monthly` for recurring changes; `NULL` for one-time changes
- `type`: `income` or `expense` for `target_type = 'new'`; otherwise `NULL`
- `categoryid`: set for category/pattern changes; nullable to preserve a change after category deletion

For the exact physical column names, see `backend/config/schema.sql` (the child primary key is `scenario_changeid`; the time fields are `start_date` and `end_date`).

## Dates and timezone safety

`transactions.date` is a `DATETIME`; goal and budget dates are SQL `DATE`. Repositories format date-only values for API responses using `DATE_FORMAT(..., '%Y-%m-%d')`. Frontend and backend projection code should treat these values as calendar dates, not parse them as UTC timestamps and then shift them through a local timezone.

Forecast cutoffs use the database server's `CURDATE()`; therefore deployment timezone configuration is material to date-boundary behavior. Current rule details are in [Forecast and goals](ForecastAndGoals.md).

## Budget association implementation note

The schema and API contain `budget_transactions` association operations. Current budget spending and progress queries are calculated from selected expense categories and their descendants within the budget date window; they do not include the manually linked `budget_transactions` rows. Treat that association as a present schema/API surface with a calculation gap, not as part of the current progress formula.

## Schema changes

`schema.sql` creates a fresh database. It is not a migration runner: `CREATE TABLE IF NOT EXISTS` will not alter an already-created table. For schema changes, add and review a migration procedure, apply it to a disposable database, then update this document and the ER diagram.
