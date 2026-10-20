import * as repo from "../repositories/baseline.repo.js";

export const getBaseline = async (userid) => {
    const [monthlyData, currentCumulativeNetFlow, scheduledTransactions] = await Promise.all([
        repo.fetchMonthlyNetFlow(userid),
        repo.fetchCurrentCumulativeNetFlow(userid),
        repo.fetchScheduledTransactions(userid)
    ]);

    if (monthlyData.length === 0) {
        return {
            hasData: false,
            monthlyNetFlow: [],
            averageMonthlyNetFlow: 0,
            currentCumulativeNetFlow,
            scheduledTransactions
        };
    }

    const normalized = monthlyData.map(row => ({
        month: row.month,
        netFlow: Number(row.net_flow)
    }));

    const total = normalized.reduce(
        (sum, row) => sum + row.netFlow,
        0
    );

    const averageMonthlyNetFlow = total / normalized.length;

    return {
        hasData: true,
        monthlyNetFlow: normalized,
        averageMonthlyNetFlow,
        currentCumulativeNetFlow,
        scheduledTransactions
    };
};
