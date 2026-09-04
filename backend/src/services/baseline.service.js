import * as repo from "../repositories/baseline.repo.js";

export const getBaseline = async (userid) => {
    const monthlyData = await repo.fetchMonthlyNetFlow(userid);

    if (monthlyData.length === 0) {
        return {
            hasData: false,
            monthlyNetFlow: [],
            averageMonthlyNetFlow: 0
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
        averageMonthlyNetFlow
    };
};