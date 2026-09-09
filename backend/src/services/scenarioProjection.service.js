import * as categoryRepo from "../repositories/category.repo.js";
import * as transactionRepo from "../repositories/transaction.repo.js";
import * as scenarioChangeRepo from "../repositories/scenarioChange.repo.js";
import * as baselineRepo from "../repositories/baseline.repo.js";

function parseDateOnly(dateValue) {
    const [year, month, day] = String(dateValue).split("T")[0].split("-").map(Number);

    return {
        year,
        month: month - 1,
        day
    };
}

function addMonthsToDateOnly(dateValue, months) {
    const { year, month } = parseDateOnly(dateValue);
    const date = new Date(year, month + months, 1);

    return {
        year: date.getFullYear(),
        month: date.getMonth()
    };
}

export const calculateNewRecurringFlowImpact = ({ change, projectionStartDate, months }) => {
    const result = [];

    const startDate = new Date(change.start_date);
    const endDate = change.end_date
        ? new Date(change.end_date)
        : null;

    const amount = Number(change.amount);

    for (let i = 0; i < months; i++) {
        const projectionDate = new Date(projectionStartDate);

        projectionDate.setMonth(
            projectionDate.getMonth() + i
        );

        const active =
            projectionDate >= startDate &&
            (!endDate || projectionDate <= endDate);

        let monthlyImpact = 0;

        if (active) {
            if (change.type === "income") {
                monthlyImpact = amount;
            } else if (change.type === "expense") {
                monthlyImpact = -amount;
            }
        }

        result.push({
            month: i + 1,
            monthlyImpact
        });
    }

    return result;
};

export const generateScenarioProjection = ({ baselineMonthlyNetFlow, change, projectionStartDate, months }) => {
    const impact = calculateNewRecurringFlowImpact({ change, projectionStartDate, months });

    const projection = [];

    let baselineCumulative = 0;
    let scenarioCumulative = 0;

    for (let i = 0; i < months; i++) {
        baselineCumulative += baselineMonthlyNetFlow;

        scenarioCumulative +=
            baselineMonthlyNetFlow + impact[i].monthlyImpact;

        projection.push({
            month: i + 1,
            baselineMonthlyNetFlow,
            scenarioMonthlyNetFlow:
                baselineMonthlyNetFlow +
                impact[i].monthlyImpact,
            baselineCumulativeNetFlow:
                baselineCumulative,
            scenarioCumulativeNetFlow:
                scenarioCumulative,
            monthlyImpact: impact[i].monthlyImpact
        });
    }

    return projection;
};

export const calculateTotalScenarioImpact = async ({
    userid,
    changes,
    projectionStartDate,
    months
}) => {
    const totalImpact = Array.from(
        { length: months },
        (_, index) => ({
            month: index + 1,
            monthlyImpact: 0
        })
    );

    for (const change of changes) {
        let impact;

        // New recurring financial flow
        if (
            change.change_type === "recurring" &&
            change.target_type === "new"
        ) {
            impact = calculateNewRecurringFlowImpact({
                change,
                projectionStartDate,
                months
            });
        }

        // Existing category recurring change
        if (
            change.change_type === "recurring" &&
            (
                change.target_type === "category" ||
                change.target_type === "pattern"
            )
        ) {
            if (change.target_type === "category") {
                impact = await calculateCategoryRecurringFlowImpact({
                    userid,
                    change,
                    projectionStartDate,
                    months
                });
            }

            if (change.target_type === "pattern") {
                impact = await calculatePatternRecurringFlowImpact({
                    userid,
                    change,
                    projectionStartDate,
                    months
                });
            }
        }

        // One-time event
        if (change.change_type === "one_time") {
            impact = calculateOneTimeFlowImpact({
                change,
                projectionStartDate,
                months
            });
        }

        if (!impact) continue;

        for (let i = 0; i < months; i++) {
            totalImpact[i].monthlyImpact +=
                impact[i].monthlyImpact;
        }
    }

    return totalImpact;
};

export const calculateOneTimeFlowImpact = ({ change, projectionStartDate, months }) => {
    const result = Array.from(
        { length: months },
        (_, index) => ({
            month: index + 1,
            monthlyImpact: 0
        })
    );

    const eventDate = parseDateOnly(change.start_date);

    for (let i = 0; i < months; i++) {
        const projectionDate = addMonthsToDateOnly(
            projectionStartDate,
            i
        );

        const sameMonth =
            projectionDate.year === eventDate.year &&
            projectionDate.month === eventDate.month;

        if (sameMonth) {
            if (change.type === "income") {
                result[i].monthlyImpact = Number(change.amount);
            } else if (change.type === "expense") {
                result[i].monthlyImpact = -Number(change.amount);
            }
        }
    }

    return result;
};

export const calculateCategoryBaseline = async ({ userid, categoryid }) => {
    const categories = await categoryRepo.fetchDescendants(
        userid,
        categoryid
    );

    if (categories.length === 0) {
        throw new Error("Category not found.");
    }

    const categoryids = categories.map(
        category => category.categoryid
    );

    const monthlyData =
        await transactionRepo.fetchMonthlyNetFlowByCategories(
            userid,
            categoryids
        );

    if (monthlyData.length === 0) {
        return {
            categoryids,
            averageMonthlyNetFlow: 0,
            hasData: false
        };
    }

    const total = monthlyData.reduce(
        (sum, row) => sum + Number(row.net_flow),
        0
    );

    return {
        categoryids,
        averageMonthlyNetFlow:
            total / monthlyData.length,
        hasData: true
    };
};

export const calculateCategoryRecurringFlowImpact = async ({
    userid,
    change,
    projectionStartDate,
    months
}) => {
    const baseline = await calculateCategoryBaseline({
        userid,
        categoryid: change.categoryid
    });

    const category = await categoryRepo.fetchById(
        userid,
        change.categoryid
    );

    if (category.length === 0) {
        throw new Error("Category not found.");
    }

    const categoryType = category[0].type;

    const result = [];

    const startDate = new Date(change.start_date);
    const endDate = change.end_date
        ? new Date(change.end_date)
        : null;

    const amount = Number(change.amount);

    let monthlyImpact = 0;

    if (baseline.hasData) {
        if (change.direction === "increase") {
            monthlyImpact =
                categoryType === "income"
                    ? amount
                    : -amount;
        } else {
            monthlyImpact =
                categoryType === "income"
                    ? -amount
                    : amount;
        }
    }

    for (let i = 0; i < months; i++) {
        const projectionDate = new Date(projectionStartDate);

        projectionDate.setMonth(
            projectionDate.getMonth() + i
        );

        const active =
            projectionDate >= startDate &&
            (!endDate || projectionDate <= endDate);

        result.push({
            month: i + 1,
            monthlyImpact: active ? monthlyImpact : 0
        });
    }

    return result;
};

export const calculatePatternRecurringFlowImpact = async ({ userid, change, projectionStartDate, months }) => {
    // For V1, a pattern is derived from the target category.
    // We use the category's historical monthly behavior
    // and apply the requested relative change.

    return await calculateCategoryRecurringFlowImpact({ userid, change, projectionStartDate, months });
};

// FETCH
export const getScenarioProjection = async ({
    userid,
    scenarioid,
    projectionStartDate,
    months,
    changes = null
}) => {
    const monthlyData =
        await baselineRepo.fetchMonthlyNetFlow(userid);

    if (monthlyData.length === 0) {
        return {
            hasData: false,
            months,
            baselineMonthlyNetFlow: 0,
            summary: {
                totalImpact: 0,
                baselineFinalCumulative: 0,
                scenarioFinalCumulative: 0
            },
            projection: []
        };
    }

    const normalized = monthlyData.map(row => ({
        month: row.month,
        netFlow: Number(row.net_flow)
    }));

    const baselineMonthlyNetFlow =
        normalized.reduce(
            (sum, row) => sum + row.netFlow,
            0
        ) / normalized.length;

    const scenarioChanges = changes ?? await scenarioChangeRepo.fetchAll(scenarioid);

    const totalImpact =
        await calculateTotalScenarioImpact({
            userid,
            changes: scenarioChanges,
            projectionStartDate,
            months
        });

    const projection = [];

    let baselineCumulative = 0;
    let scenarioCumulative = 0;

    for (let i = 0; i < months; i++) {
        baselineCumulative += baselineMonthlyNetFlow;

        const scenarioMonthlyNetFlow =
            baselineMonthlyNetFlow +
            totalImpact[i].monthlyImpact;

        scenarioCumulative += scenarioMonthlyNetFlow;

        const date = new Date(projectionStartDate);

        date.setMonth(date.getMonth() + i);

        const year = date.getFullYear();
        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        projection.push({
            month: `${year}-${month}`,

            baselineMonthlyNetFlow,

            scenarioMonthlyNetFlow,

            monthlyImpact:
                totalImpact[i].monthlyImpact,

            baselineCumulativeNetFlow:
                baselineCumulative,

            scenarioCumulativeNetFlow:
                scenarioCumulative
        });
    }

    const finalProjection =
        projection[projection.length - 1];

    return {
        hasData: true,
        months,
        baselineMonthlyNetFlow,

        summary: {
            totalImpact:
                finalProjection.scenarioCumulativeNetFlow -
                finalProjection.baselineCumulativeNetFlow,

            baselineFinalCumulative:
                finalProjection.baselineCumulativeNetFlow,

            scenarioFinalCumulative:
                finalProjection.scenarioCumulativeNetFlow
        },

        projection
    };
};