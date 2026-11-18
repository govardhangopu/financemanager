# Decision log

This log captures current product/architecture decisions and makes clear where code has not yet converged on the intended model. It is a concise project record, not a substitute for feature documentation.

## Current decisions

### Forecast and goals share one starting baseline

Both features use C₀: signed net flow from transactions dated before today. Transactions dated today and later are excluded from that baseline and treated as scheduled forecast flows. Historical trend uses the six completed months before the current month.

### Goals use sequential allocation

Goal progress is allocated from the shared positive cash pool in priority order. Each goal is capped at its target, preventing the same amount from being shown as fully accumulated for every goal. Goal order is user-adjustable and drives the waterfall.

### Scenarios store changes, not transaction copies

Scenarios and `scenario_changes` store hypothetical adjustments. The current service computes monthly effects directly; it does not construct a temporary transaction ledger. Scenario projections remain separate from forecast/goal C₀ and scheduled-date calculations.

### Demo is browser-local

The demo uses synthetic records and a local adapter, so users can explore data-backed screens without creating or mutating server-side user data. Identity/settings operations remain account-only.

### Date-only API values are preserved

Database dates are formatted as `YYYY-MM-DD` at the SQL boundary where calendar dates are returned. This avoids JavaScript timezone conversion moving a date to the previous or next day.

## Known implementation differences and follow-up

- **`is_partial`:** It was an early feature and is no longer intended as product behavior. References remain in the current schema/API/frontend; removing them needs a coordinated migration. It should not be reintroduced into product copy.
- **Budget transaction links:** `budget_transactions` is supported by schema/routes, but the current progress aggregation uses date and selected-category scope rather than requiring those explicit links. Clarify desired semantics before changing it.
- **Scenario starting point:** Scenario cumulative projections currently start from zero and do not incorporate scheduled future transactions, unlike forecast/goals.
- **Historical average:** Months with no transactions do not count as zero-valued months; the mean uses months that returned transaction rows.

## Historical design

The previous docs described immutable “Reality,” scenario operations (`ADD`/`MODIFY`/`REMOVE`), temporary transaction datasets, and a shared analytics engine. That proposal was not the implemented architecture and has been superseded by the direct monthly scenario-change model. See the historical diagram only for archival context.
