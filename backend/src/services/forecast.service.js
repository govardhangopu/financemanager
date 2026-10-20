import * as baselineService from "./baseline.service.js";
import { buildProjectionTimeline } from "./projectionTimeline.service.js";

export const getForecast = async ({ userid, startDate, months }) => {
    const baseline = await baselineService.getBaseline(userid);
    const averageMonthlyNetFlow = baseline.averageMonthlyNetFlow;
    const projection = buildProjectionTimeline({
        startDate,
        months,
        startingCumulativeNetFlow: baseline.currentCumulativeNetFlow,
        averageMonthlyNetFlow,
        scheduledTransactions: baseline.scheduledTransactions
    });
    const finalCumulativeNetFlow = projection.at(-1)?.cumulativeNetFlow
        ?? baseline.currentCumulativeNetFlow;

    return {
        hasData: baseline.hasData
            || baseline.scheduledTransactions.length > 0
            || baseline.currentCumulativeNetFlow !== 0,
        months,
        startingCumulativeNetFlow: baseline.currentCumulativeNetFlow,
        averageMonthlyNetFlow,
        summary: { finalCumulativeNetFlow },
        projection
    };
};
