import * as baselineRepo from "../repositories/baseline.repo.js";

export const generateBaselineProjection = ({ monthlyNetFlow, months }) => {
    if (!Array.isArray(monthlyNetFlow) || monthlyNetFlow.length === 0) {
        return [];
    }

    const monthlyAmount =
        monthlyNetFlow.reduce(
            (sum, row) => sum + Number(row.netFlow ?? row.net_flow),
            0
        ) / monthlyNetFlow.length;

    const projection = [];
    let cumulativeNetFlow = 0;

    for (let i = 1; i <= months; i++) {
        cumulativeNetFlow += monthlyAmount;

        projection.push({
            month: i,
            monthlyNetFlow: monthlyAmount,
            cumulativeNetFlow
        });
    }

    return projection;
};

export const getBaselineProjection = async (userid, months = 12) => {
    const monthlyData = await baselineRepo.fetchMonthlyNetFlow(userid);

    if (monthlyData.length === 0) {
        return {
            hasData: false,
            months,
            monthlyNetFlow: 0,
            projection: []
        };
    }

    const normalized = monthlyData.map(row => ({
        month: row.month,
        netFlow: Number(row.net_flow)
    }));

    const monthlyNetFlow =
        normalized.reduce(
            (sum, row) => sum + row.netFlow,
            0
        ) / normalized.length;

    const projection = generateBaselineProjection({
        monthlyNetFlow: normalized,
        months
    });

    return {
        hasData: true,
        months,
        monthlyNetFlow,
        projection
    };
};