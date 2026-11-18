# Transactions, categories, and budgets

This guide summarizes the persisted transaction, category, and budget behavior. Database fields and keys are listed in [Database design](DatabaseDesign.md); HTTP routes are in [API reference](APIReference.md).

## Transactions

Transactions belong to a user and contain an amount, date, a category reference, and the legacy `is_partial` field. Category type determines whether an amount contributes as income or expense in net-flow calculations. A missing/deleted category is allowed by the schema; such a row does not have a recognized income/expense sign in baseline calculations. The current database does not store a transaction description field; UI labels are generally derived from the associated category.

Dates are stored in MySQL as date/datetime values. Queries that return date-only values use `DATE_FORMAT(..., '%Y-%m-%d')` so JavaScript's timezone conversion does not shift the calendar day. Future-dated rows are supported: the forecast treats rows from today onward as scheduled events.

The `is_partial` field/filter is a legacy compatibility surface from an early version. It is not a supported product concept. The code/schema still expose it, so removing it fully requires a coordinated schema, API, and frontend migration; documentation does not treat it as an active feature.

When a category is deleted, its transactions remain and their category reference becomes `NULL`. The transaction row is not deleted with the category.

## Categories

Categories classify transactions and can form a parent/child hierarchy. A category can be shared (nullable owner) or owned by a user. Deleting a parent cascades to child categories; transaction category references are set to `NULL`, preserving those transactions.

Income and expense are category-level classifications used by financial summaries. Category names are not a safe substitute for the category type when computing signed net flow.

## Budgets

A budget has a date window and may be linked to categories and transactions. Its displayed status is determined from the current date and budget window:

- **Upcoming:** today is before the start date.
- **Active:** today falls within the budget date window.
- **Completed:** today is after the end date.

The current spending/progress calculation queries expense transactions in the budget's date range and selected category hierarchy, then caps displayed progress at 100%. Although the schema and API support `budget_transactions` associations, current progress/spent aggregation is based on dates and category scope rather than requiring an explicit row in that link table. The association endpoints therefore exist separately from the primary progress query.

This is a useful behavior to revisit if product expectations are that manually linked transactions alone should count, or if category hierarchy inclusion should be selectable. The present documentation records the implemented query behavior rather than assuming those alternatives.

## Deletion and consistency

Foreign-key rules preserve transaction history when categories are removed and cascade user-owned data when an account is deleted. Budget/category/transaction associations are separate join rows and follow their declared foreign-key deletion rules. Check the current schema before changing these semantics.
