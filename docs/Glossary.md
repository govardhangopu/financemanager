# Glossary

Terms below reflect the current product and code. Older design terms are marked historical where needed.

## Budget

A date-bounded spending plan with selected categories and calculated expense progress.

## C₀ (current cumulative net flow)

The signed total of historical income minus expenses through the day before today. Forecast and goal projections use this as their shared starting baseline.

## Category

A hierarchical classification for transactions, such as income or expense and a specific label such as salary or food.

## Demo mode

A browser-local experience using synthetic records and the frontend's local data adapter. Demo edits are not persisted to the production API.

## Goal waterfall

A sequential allocation of available positive C₀ among goals ordered by priority, capped at each goal's target. Remaining cash passes to the next goal.

## Historical monthly average

The arithmetic average of monthly net flow over the six completed calendar months before the current month, including only months with transaction rows.

## Net flow

Income less expenses, with income positive and expenses negative.

## Scheduled transaction

A transaction dated today or later. The forecast treats it as a deterministic future cash flow and applies it on its date.

## Scenario

A persisted set of hypothetical recurring or one-time changes used to calculate a separate monthly projection. Scenarios do not copy transaction records and do not modify real financial data.

## `is_partial` (legacy)

A field/filter retained from an early implementation. It is not a current product feature. The application still carries compatibility references that require a schema/API/frontend migration to remove safely.

## Historical design terms

“Reality,” “temporary dataset,” “Scenario Operation” (`ADD`/`MODIFY`/`REMOVE`), and “Analytics Engine” refer to an earlier scenario architecture proposal. They do not describe the implemented scenario projection. See [Scenarios](FinancialScenarioEngine.md) and [Decision log](DecisionLog.md).
