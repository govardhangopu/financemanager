import * as repo from "../repositories/goalProjection.repo.js";
import * as baselineService from "./baseline.service.js";
import { parseDateOnly } from "../utils/date.utils.js";
import { buildProjectionTimeline } from "./projectionTimeline.service.js";

const allocateForGoal = (cashPool, goals, goalid) => {
    let remainingCash = Math.max(0, Number(cashPool) || 0);

    for (const goal of goals) {
        const allocatedAmount = Math.min(Number(goal.target_amount), remainingCash);
        if (Number(goal.goalid) === Number(goalid)) return allocatedAmount;
        remainingCash -= allocatedAmount;
    }

    return 0;
};

export const getGoalProjection = async ({ userid, goalid }) => {
    const [goals, baseline] = await Promise.all([
        repo.fetchGoalsForAllocation(userid),
        baselineService.getBaseline(userid)
    ]);
    const goal = goals.find((item) => Number(item.goalid) === Number(goalid));

    if (!goal) throw new Error("Goal not found.");

    const currentCumulativeNetFlow = baseline.currentCumulativeNetFlow;
    const allocatedAmount = allocateForGoal(currentCumulativeNetFlow, goals, goalid);
    const targetAmount = Number(goal.target_amount);
    const goalIndex = goals.findIndex((item) => Number(item.goalid) === Number(goalid));
    const cumulativeTargetThroughGoal = goals
        .slice(0, goalIndex + 1)
        .reduce((sum, item) => sum + Number(item.target_amount), 0);
    const goalMetadata = {
        goalid: goal.goalid,
        name: goal.name,
        targetAmount,
        targetDate: goal.target_date,
        priorityOrder: goal.priority_order
    };

    if (
        !baseline.hasData
        && baseline.scheduledTransactions.length === 0
        && currentCumulativeNetFlow === 0
    ) {
        return {
            hasData: false,
            goal: goalMetadata,
            currentCumulativeNetFlow,
            allocatedAmount,
            projectedCumulativeNetFlow: null,
            requiredMonthlyNetFlow: null,
            monthsRemaining: null,
            onTrack: null,
            goalReached: false,
            deadlinePassed: false,
            projection: []
        };
    }

    const today = new Date();
    const todayString = today.toISOString().slice(0, 10);
    const { year: targetYear, month: targetMonth } = parseDateOnly(goal.target_date);
    const monthsToTarget =
        (targetYear - today.getFullYear()) * 12 +
        (targetMonth - today.getMonth());
    const targetDateString = String(goal.target_date).slice(0, 10);
    const monthsRemaining = Math.max(1, monthsToTarget + 1);

    if (allocatedAmount >= targetAmount) {
        return {
            hasData: true,
            goal: goalMetadata,
            currentCumulativeNetFlow,
            allocatedAmount,
            projectedCumulativeNetFlow: allocatedAmount,
            requiredMonthlyNetFlow: 0,
            shortfall: 0,
            monthlyGap: 0,
            monthsRemaining,
            projection: [],
            goalReachedAt: 0,
            goalReachedDate: null,
            monthsEarly: monthsRemaining,
            onTrack: true,
            goalReached: true,
            deadlinePassed: false
        };
    }

    if (targetDateString <= todayString) {
        const shortfall = Math.max(0, targetAmount - allocatedAmount);
        return {
            hasData: true,
            goal: goalMetadata,
            currentCumulativeNetFlow,
            allocatedAmount,
            projectedCumulativeNetFlow: allocatedAmount,
            requiredMonthlyNetFlow: 0,
            shortfall,
            monthlyGap: 0,
            monthsRemaining: 0,
            projection: [],
            onTrack: false,
            goalReached: false,
            deadlinePassed: true
        };
    }

    const timeline = buildProjectionTimeline({
        startDate: todayString,
        months: monthsRemaining,
        startingCumulativeNetFlow: currentCumulativeNetFlow,
        averageMonthlyNetFlow: baseline.averageMonthlyNetFlow,
        scheduledTransactions: baseline.scheduledTransactions,
        endDate: targetDateString
    });

    const projection = timeline.map((point) => ({
        ...point,
        totalCumulativeNetFlow: point.cumulativeNetFlow,
        cumulativeNetFlow: allocateForGoal(point.cumulativeNetFlow, goals, goalid)
    }));
    const projectedCumulativeNetFlow = projection.at(-1)?.cumulativeNetFlow ?? allocatedAmount;
    const requiredMonthlyNetFlow = Math.max(
        0,
        (cumulativeTargetThroughGoal - Math.max(0, currentCumulativeNetFlow)) / monthsRemaining
    );
    const shortfall = Math.max(0, targetAmount - projectedCumulativeNetFlow);
    const monthlyGap = Math.max(0, requiredMonthlyNetFlow - baseline.averageMonthlyNetFlow);
    const goalReachedAt = projection.find((point) => point.cumulativeNetFlow >= targetAmount);
    const monthsEarly = goalReachedAt
        ? Math.max(0, monthsRemaining - goalReachedAt.month)
        : 0;

    return {
        hasData: true,
        goal: goalMetadata,
        currentCumulativeNetFlow,
        allocatedAmount,
        projectedCumulativeNetFlow,
        requiredMonthlyNetFlow,
        shortfall,
        monthlyGap,
        goalReachedAt: goalReachedAt?.month ?? null,
        goalReachedDate: goalReachedAt?.date ?? null,
        monthsEarly,
        monthsRemaining,
        projection,
        onTrack: projectedCumulativeNetFlow >= targetAmount,
        goalReached: false,
        deadlinePassed: false
    };
};
