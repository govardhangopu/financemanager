const getProjectionMonth = (projectionPoint) => {
    const month = Number.isInteger(projectionPoint?.monthIndex)
        ? projectionPoint.monthIndex
        : projectionPoint?.month;
    const value = projectionPoint?.cumulativeNetFlow;

    if (!Number.isInteger(month) || month < 0 || !Number.isFinite(value)) {
        return null;
    }

    return { month, value };
};

const getGoalMetadata = ({ goal, projection }) => {
    const projectionGoal = projection?.goal;

    return {
        goalid: goal?.goalid ?? projectionGoal?.goalid,
        name: goal?.name ?? projectionGoal?.name,
        targetAmount: projectionGoal?.targetAmount ?? goal?.target_amount,
        targetDate: projectionGoal?.targetDate ?? goal?.target_date,
        projectionStatus: projection
            ? {
                hasData: projection.hasData,
                onTrack: projection.onTrack,
                goalReached: projection.goalReached,
                deadlinePassed: projection.deadlinePassed,
            }
            : null,
    };
};

export function prepareGoalProjectionChartData(goalProjections = [], now = new Date()) {
    const entries = goalProjections.map((entry) => {
        const projection = entry?.projection ?? null;
        const points = Array.isArray(projection?.projection)
            ? projection.projection
                .map(getProjectionMonth)
                .filter((point) => point !== null)
            : [];

        return {
            goal: entry?.goal ?? null,
            projection,
            points,
        };
    });

    const latestProjectionMonth = entries.reduce((latestMonth, entry) => {
        if (entry.projection?.hasData !== true) {
            return latestMonth;
        }

        return entry.points.reduce(
            (latest, point) => Math.max(latest, point.month),
            latestMonth
        );
    }, 0);

    const timeline = Array.from(
        { length: latestProjectionMonth + (entries.some((entry) => entry.projection?.hasData === true) ? 1 : 0) },
        (_, index) => {
            const date = new Date(now.getFullYear(), now.getMonth() + index, 1);
            const year = date.getFullYear();
            const month = date.getMonth();

            return {
                year,
                month: month + 1,
                key: `${year}-${String(month + 1).padStart(2, "0")}`,
                label: date.toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                }),
            };
        }
    );

    const goals = entries.map((entry) => {
        const metadata = getGoalMetadata(entry);
        const data = Array(timeline.length).fill(null);

        if (
            entry.projection?.hasData === true
            && Number.isFinite(entry.projection.allocatedAmount ?? entry.projection.currentCumulativeNetFlow)
        ) {
            data[0] = entry.projection.allocatedAmount ?? entry.projection.currentCumulativeNetFlow;

            entry.points.forEach(({ month, value }) => {
                if (month < data.length) {
                    data[month] = value;
                }
            });
        }

        return {
            ...metadata,
            data,
        };
    });

    const datasets = goals.map((goal) => ({
        goalid: goal.goalid,
        label: goal.name,
        targetAmount: goal.targetAmount,
        targetDate: goal.targetDate,
        projectionStatus: goal.projectionStatus,
        data: goal.data,
    }));

    return {
        labels: timeline.map((month) => month.label),
        timeline,
        goals,
        datasets,
    };
}
