import * as baselineService from "./baseline.service.js";
import { addMonthsToDateOnly } from "../utils/date.utils.js";

export const getForecast = async ({
    userid,
    startDate,
    months
}) => {
    const baseline = await baselineService.getBaseline(userid);

    if (!baseline.hasData) {
        return {
            hasData: false,
            months,
            averageMonthlyNetFlow: 0,
            summary: {
                finalCumulativeNetFlow: 0
            },
            projection: []
        };
    }

    const averageMonthlyNetFlow =
        baseline.averageMonthlyNetFlow;

    const projection = [];

    let cumulativeNetFlow = 0;

    for (let i = 0; i < months; i++) {
        const { year, month } =
            addMonthsToDateOnly(startDate, i);

        const formattedMonth = String(
            month + 1
        ).padStart(2, "0");

        cumulativeNetFlow += averageMonthlyNetFlow;

        projection.push({
            month: `${year}-${formattedMonth}`,
            monthlyNetFlow: averageMonthlyNetFlow,
            cumulativeNetFlow
        });
    }

    return {
        hasData: true,
        months,
        averageMonthlyNetFlow,
        summary: {
            finalCumulativeNetFlow:
                cumulativeNetFlow
        },
        projection
    };
};