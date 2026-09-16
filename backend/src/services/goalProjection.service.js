import * as repo from "../repositories/goalProjection.repo.js";
import * as baselineService from "./baseline.service.js";
import { parseDateOnly } from "../utils/date.utils.js";

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
            monthsRemaining: 0,
            onTrack: currentCumulativeNetFlow >= targetAmount
        };
    }

    const projectedCumulativeNetFlow =
        currentCumulativeNetFlow +
        averageMonthlyNetFlow * monthsRemaining;

    const requiredMonthlyNetFlow =
        (targetAmount - currentCumulativeNetFlow) /
        monthsRemaining;

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
        monthsRemaining,
        onTrack:
            projectedCumulativeNetFlow >= targetAmount
    };
};