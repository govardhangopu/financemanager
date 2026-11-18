# Forecast and goals

This guide records the current implementation in `backend/src/services/baseline.service.js`, `forecast.service.js`, `goal.service.js`, `goalProjection.service.js`, and `projectionTimeline.service.js`.

## Shared baseline

Forecast and goal projections share the baseline service and the same current cumulative net flow, called **C₀** in the UI/design notes.

### 1. Historical monthly average

The SQL query groups net flow by calendar month over the six completed months before the current month. It averages the months that have transaction rows; months with no transactions are not added as zero months. Income contributes positively, expense negatively, and a row without a recognized category type contributes zero. The time-window boundary uses MySQL `CURDATE()` and the database server's time zone.

`hasData` for trend forecasting means that this monthly query returned at least one month. One month of history is enough: its net flow becomes the average. There is no special shrinkage or minimum-history threshold.

### 2. Current baseline C₀

The database query sums only rows with `date < CURDATE()`. Income is added and expense is subtracted. Transactions dated today are excluded from C₀, as are future-dated transactions.

### 3. Scheduled transactions

Rows with `date >= CURDATE()` are returned as scheduled cash flows. This includes transactions dated today. They are sorted by date and transaction ID and carry a signed `netFlow` value.

## Forecast projection

`GET /forecast?months=12&start_date=YYYY-MM-DD` returns the shared starting balance, historical monthly average, final balance, and a date-based projection.

The timeline begins from C₀. When historical monthly data exists, the historical average is distributed evenly across the calendar days of each projected month. Scheduled transactions are then applied on their exact dates. The API emits points on scheduled transaction dates and at month ends (or the requested range end) when baseline projection is active.

If the monthly history is empty, no zero-average trend is painted into empty months. The projection contains only the starting baseline plus explicit scheduled cash flows. The response sets `isScheduledOnly` when there are scheduled transactions but no monthly history; the frontend explains that trend forecasting requires past transactions.

### Forecast response shape

```json
{
  "hasData": true,
  "isScheduledOnly": false,
  "months": 12,
  "startingCumulativeNetFlow": 45000,
  "averageMonthlyNetFlow": 12500,
  "summary": { "finalCumulativeNetFlow": 195000 },
  "projection": [
    {
      "month": 1,
      "monthIndex": 0,
      "date": "2026-12-31",
      "monthlyNetFlow": 12500,
      "baselineNetFlow": 403.2258,
      "scheduledNetFlow": 0,
      "scheduledTransactions": [],
      "cumulativeNetFlow": 57500
    }
  ]
}
```

The numerical values are illustrative. `baselineNetFlow` is the daily share applied at that point; `monthlyNetFlow` repeats the full monthly average. Projection points can include scheduled-transaction detail.

## Goal allocation and projection

### Waterfall allocation

Goals are fetched in `priority_order ASC`, then `target_date ASC`, then `goalid ASC`. The backend allocates `max(0, C₀)` sequentially in that order. Each goal receives at most its target amount; any remaining balance flows to the next goal. Thus the total allocated to goals cannot exceed the available positive cash pool, and reorder changes the allocation.

The reorder endpoint accepts the full ordered list of goal IDs and persists their `priority_order`. The frontend supports drag reordering and recalculates the visible allocation.

### Individual goal projection

Each goal projection starts from the same C₀ and uses the same historical average and scheduled transactions as the forecast. At each timeline point, the cumulative net flow is passed through the same waterfall allocation; the chart's goal line is the amount allocated to that goal, not the full household cumulative total.

The API also returns goal metadata and fields such as `allocatedAmount`, `projectedCumulativeNetFlow`, `requiredMonthlyNetFlow`, `shortfall`, `monthlyGap`, `monthsRemaining`, `onTrack`, and goal-reached/deadline indicators. A goal already fully allocated at C₀ is treated as reached. A past target date returns a deadline-passed result.

### Goals overview chart

The overview combines each goal's allocated projection. Visibility is tracked by goal ID so reordering does not reset toggles. The parent limits the chart timeline to the maximum required by currently visible goals; both labels and data series are sliced to that horizon. During loading, the chart area is reserved and the goal list remains rendered.

The colors are selected from the frontend's goal palette and remain associated with a goal ID across reordering; they are presentation state, not database fields.

## Important boundaries

- Forecast and goals use C₀; they exclude today's transactions from C₀ but include them in scheduled flows.
- The history window is six completed calendar months, not a rolling 180-day window.
- No past history means scheduled-only forecast points, not a flat zero trend.
- An expense-heavy history can produce a negative C₀; waterfall goal allocation floors available cash at zero.
- Scenario projections use a separate monthly calculation and are not the same calculation as this daily forecast/goal timeline. See [Scenarios](FinancialScenarioEngine.md).
