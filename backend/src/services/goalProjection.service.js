import * as repo from "../repositories/goalProjection.repo.js";
import * as baselineService from "./baseline.service.js";
import { parseDateOnly } from "../utils/date.utils.js";
import { buildProjectionTimeline } from "./projectionTimeline.service.js";

export const getGoalProjection = async ({ userid, goalid }) => {
    const goals = await repo.fetchGoal(userid, goalid);

    if (goals.length === 0) {
        throw new Error("Goal not found.");
    }

    const goal = goals[0];

    const baseline = await baselineService.getBaseline(userid);
    const currentCumulativeNetFlow = baseline.currentCumulativeNetFlow;

    if (
        !baseline.hasData
        && baseline.scheduledTransactions.length === 0
        && baseline.currentCumulativeNetFlow === 0
    ) {
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
            onTrack: null,
            goalReached: false,
            deadlinePassed: false
        };
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const targetDate = parseDateOnly(goal.target_date);

    const monthsToTarget =
        (targetDate.year - currentYear) * 12 +
        (targetDate.month - currentMonth);
    const targetDateString = String(goal.target_date).slice(0, 10);
    const todayString = today.toISOString().slice(0, 10);
    const monthsRemaining = Math.max(1, monthsToTarget + 1);

    const targetAmount = Number(goal.target_amount);
    const averageMonthlyNetFlow = baseline.averageMonthlyNetFlow;

    if (currentCumulativeNetFlow >= targetAmount) {
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
            shortfall: 0,
            monthlyGap: 0,
            monthsRemaining,
            projection: [],
            goalReachedAt: 0,
            goalReachedDate: null,
            monthsEarly: monthsRemaining > 0 ? monthsRemaining : 0,
            onTrack: true,
            goalReached: true
        };
    }

    if (targetDateString <= todayString) {
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
            onTrack: currentCumulativeNetFlow >= targetAmount,
            deadlinePassed: true,
        };
    }

    const projection = buildProjectionTimeline({
        startDate: todayString,
        months: monthsRemaining,
        startingCumulativeNetFlow: currentCumulativeNetFlow,
        averageMonthlyNetFlow,
        scheduledTransactions: baseline.scheduledTransactions,
        endDate: targetDateString
    });

    const projectedCumulativeNetFlow = projection.at(-1)?.cumulativeNetFlow
        ?? currentCumulativeNetFlow;

    const requiredMonthlyNetFlow = (targetAmount - currentCumulativeNetFlow) / monthsRemaining;

    const shortfall = Math.max(0, targetAmount - projectedCumulativeNetFlow);

    const monthlyGap = Math.max(0, requiredMonthlyNetFlow - averageMonthlyNetFlow);

    const goalReachedAt = projection.find(point => point.cumulativeNetFlow >= targetAmount);

    const goalReachedDate = goalReachedAt?.date ?? null;

    const monthsEarly = goalReachedAt
        ? Math.max(0, monthsRemaining - goalReachedAt.month)
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
        onTrack: projectedCumulativeNetFlow >= targetAmount,
        goalReached: false,
        deadlinePassed: false,
    };
};
