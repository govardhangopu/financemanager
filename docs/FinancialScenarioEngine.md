# Scenarios

This guide describes the scenario implementation in `backend/src/services/scenario.service.js`, `scenarioChange.service.js`, and `scenarioProjection.service.js`. The scenarios feature stores hypothetical changes and calculates an alternate monthly projection. It does not clone or rewrite transaction rows.

## What is stored

A scenario belongs to a user and has a name and metadata. Its child `scenario_changes` define adjustments. The current fields allow:

- `change_type`: `recurring` or `one_time`.
- `target_type`: `category`, `pattern`, or `new`.
- `direction`: `increase` or `decrease`.
- An amount, start date, optional end date, and optional category/pattern information.
- For a new recurring item, income or expense type information.

Recurring changes are modeled monthly and only while projection months fall within their start/end dates. One-time changes are applied to the month containing their start date. These records remain separate from the user's actual transactions. For the “pattern” target, V1 derives the adjustment from the target category's historical behavior.

## Projection behavior

The service derives a monthly historical baseline from the user's transaction history, then applies the scenario's monthly changes to form a projected series. Category and pattern changes are based on matching historical spending/income where available; a `new` change contributes as a new modeled line. Recurring category adjustments derive from that category's average monthly net flow. The result supports the scenario chart and comparison with the baseline.

The scenario projection is its own calculation. It is not the daily forecast timeline: it does not share the forecast's C₀ starting balance or its exact-date scheduled transaction events. The cumulative scenario series begins at zero in the current implementation. When no historical monthly baseline is available, the projection reports no baseline data rather than fabricating a trend.

## Categories removed after use

Deleting a category sets a linked scenario change's category reference to `NULL` through the foreign-key rule. The scenario change remains stored, but it can no longer resolve to the removed category's historical totals. The UI may retain the user's description/pattern text, but the deleted category itself is not reconstructed.

## Boundaries and interpretation

- Scenario calculations are hypothetical and do not mutate actual transactions, goals, or budgets.
- A recurring change is a monthly adjustment; it is not a generated list of dated transactions.
- A one-time change affects its month, rather than being plotted on its exact day.
- Scenario projections and forecast/goal projections have different starting-point and scheduling rules. Compare them as separate feature models, not as two views of an identical projection engine.
- The database's `scenario_changes` table is the current model. Earlier design diagrams that proposed scenario-owned transaction copies or `scenario_operations` are historical only.

For route and request details, see [API reference](APIReference.md). For shared forecast and goal calculations, see [Forecast and goals](ForecastAndGoals.md).
