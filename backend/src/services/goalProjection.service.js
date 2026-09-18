import * as repo from "../repositories/goalProjection.repo.js";
import * as baselineService from "./baseline.service.js";
import { parseDateOnly, addMonthsToDateOnly } from "../utils/date.utils.js";

export const getGoalProjection = async ({ userid, goalid }) => {
    const goals = await repo.fetchGoal(userid, goalid);

    if (goals.length === 0) {
        throw new Error("Goal not found.");
    }

    const goal = goals[0];

    const currentCumulativeNetFlow =
        await repo.fetchCurrentCumulativeNetFlow(userid);

    const baseline = await baselineService.getBaseline(userid);

    if (!baseline.hasData) {
        return {
            hasData: false,
            goal: {
                goalid: goal.goalid,
                name: goal.name,
                targetAmount: Number(goal.target_amount),
                targetDate: goal.target_date
            },
            currentCumulativeNetFlow,
            projectedCumulativeNetFlow: null,
            requiredMonthlyNetFlow: null,
            monthsRemaining: null,
            onTrack: null
        };
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const targetDate = parseDateOnly(goal.target_date);

    const monthsRemaining =
        (targetDate.year - currentYear) * 12 +
        (targetDate.month - currentMonth);

    const targetAmount = Number(goal.target_amount);
    const averageMonthlyNetFlow =
        baseline.averageMonthlyNetFlow;

    if (monthsRemaining <= 0) {
        const shortfall = Math.max(0, targetAmount - currentCumulativeNetFlow);

        return {
            hasData: true,
            goal: {
                goalid: goal.goalid,
                name: goal.name,
                targetAmount,
                targetDate: goal.target_date
            },
            currentCumulativeNetFlow,
            projectedCumulativeNetFlow: currentCumulativeNetFlow,
            requiredMonthlyNetFlow: 0,
            shortfall,
            monthlyGap: 0,
            monthsRemaining: 0,
            onTrack: currentCumulativeNetFlow >= targetAmount
        };
    }

    const projectedCumulativeNetFlow =
        currentCumulativeNetFlow +
        averageMonthlyNetFlow * monthsRemaining;

    const requiredMonthlyNetFlow = (targetAmount - currentCumulativeNetFlow) / monthsRemaining;

    const shortfall = Math.max(0, targetAmount - projectedCumulativeNetFlow);

    const monthlyGap = Math.max(0, requiredMonthlyNetFlow - averageMonthlyNetFlow);

    const projection = [];

    for (let month = 1; month <= monthsRemaining; month++) {
        projection.push({
            month,
            cumulativeNetFlow:
                currentCumulativeNetFlow +
                averageMonthlyNetFlow * month
        });
    }

    const goalReachedAt = projection.find(point => point.cumulativeNetFlow >= targetAmount);

    const goalReachedDate = goalReachedAt
        ? (() => {
            const { year, month } = addMonthsToDateOnly(
                new Date().toISOString().split("T")[0],
                goalReachedAt.month
            );

            return `${year}-${String(month + 1).padStart(2, "0")}-01`;
        })()
        : null;

    const monthsEarly = goalReachedAt
        ? monthsRemaining - goalReachedAt.month
        : 0;

    return {
        hasData: true,
        goal: {
            goalid: goal.goalid,
            name: goal.name,
            targetAmount,
            targetDate: goal.target_date
        },
        currentCumulativeNetFlow,
        projectedCumulativeNetFlow,
        requiredMonthlyNetFlow,
        shortfall,
        monthlyGap,
        goalReachedAt: goalReachedAt ? goalReachedAt.month : null,
        goalReachedDate,
        monthsEarly,
        monthsRemaining,
        projection,
        onTrack:
            projectedCumulativeNetFlow >= targetAmount
    };
};