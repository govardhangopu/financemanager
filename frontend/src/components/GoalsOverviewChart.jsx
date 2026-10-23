import { useMemo } from "react";
import { useTheme } from "../context/ThemeContext";
import { GenericChart } from "./GenericChart";
import "../styles/GoalsOverviewChart.css";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

const goalColors = [
    "#646cff",
    "#f97316",
    "#22c55e",
    "#ec4899",
    "#06b6d4",
    "#a855f7",
    "#eab308",
    "#ef4444",
    "#14b8a6",
    "#84cc16",
];

const goalColor = (goal) => {
    const identity = String(goal.goalid ?? `${goal.name}-${goal.targetDate}`);
    let hash = 0;

    for (const character of identity) {
        hash = (hash * 31 + character.charCodeAt(0)) % goalColors.length;
    }

    return goalColors[hash];
};

const getGoalKey = (goal) =>
    String(goal.goalid ?? `${goal.name ?? "goal"}-${goal.targetDate ?? "date"}`);

const formatTargetDate = (value) => {
    if (!value) return "Date unavailable";

    const date = new Date(`${value}T00:00:00`);

    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
};

const getTargetMonthKey = (value) => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return null;
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year
        || date.getUTCMonth() !== month - 1
        || date.getUTCDate() !== day
    ) {
        return null;
    }

    return value.slice(0, 7);
};

const getValidTargetAmount = (goal) => {
    if (
        goal.targetAmount === null
        || goal.targetAmount === undefined
        || goal.targetAmount === ""
    ) {
        return null;
    }

    const amount = Number(goal.targetAmount);
    return Number.isFinite(amount) && amount > 0 ? amount : null;
};

const getTargetEndIndex = (goal, timeline) => {
    const targetMonth = getTargetMonthKey(goal.targetDate);

    if (!targetMonth || timeline.length === 0) {
        return null;
    }

    const firstMonth = timeline[0].key;
    const lastMonth = timeline[timeline.length - 1].key;

    if (targetMonth < firstMonth) {
        return null;
    }

    const targetIndex = timeline.findIndex((month) => month.key === targetMonth);
    if (targetIndex === -1 && targetMonth <= lastMonth) {
        return null;
    }

    return {
        index: targetIndex === -1 ? timeline.length - 1 : targetIndex,
        hasDeadlineMarker: targetIndex !== -1,
    };
};

const getUnavailableProjectionMessage = (goal) => {
    if (goal.projectionStatus?.hasData === false) {
        return "Projection unavailable: no transaction history";
    }

    return "Projection unavailable";
};

export function GoalsOverviewChart({ chartData, selectedGoalIds, onSelectionChange, isLoading = false }) {
    const { theme } = useTheme();
    const allLabels = chartData?.labels ?? [];
    const timeline = chartData?.timeline ?? [];
    const goals = chartData?.goals ?? [];
    const usableProjectionGoals = useMemo(() => goals.filter((goal) =>
        goal.projectionStatus?.hasData === true
        && Array.isArray(goal.data)
        && goal.data.some(Number.isFinite)
    ), [goals]);
    const selectedGoalKeys = selectedGoalIds ?? new Set(goals.map(getGoalKey));
    const goalKeys = goals.map(getGoalKey);

    const allGoalsSelected = goalKeys.every((key) => selectedGoalKeys.has(key));
    const noGoalsSelected = goalKeys.every((key) => !selectedGoalKeys.has(key));
    const themeColors = theme === "light"
        ? {
            text: "#52617A",
            strongText: "#142444",
            grid: "#C5D0E2",
        }
        : {
            text: "#CBD5E1",
            strongText: "#FFFFFF",
            grid: "rgba(148, 163, 184, 0.18)",
        };

    const visibleGoals = useMemo(() => usableProjectionGoals.filter((goal) =>
        selectedGoalKeys.has(getGoalKey(goal))
    ), [usableProjectionGoals, selectedGoalKeys]);

    const { labels, activeTimeline } = useMemo(() => {
        const activeHorizonEndIndex = visibleGoals.reduce((latestIndex, goal) => {
            const lastProjectionIndex = goal.data.reduce(
                (lastIndex, value, index) => Number.isFinite(value) ? index : lastIndex,
                -1
            );
            const targetEnd = getTargetEndIndex(goal, timeline);
            return Math.max(latestIndex, lastProjectionIndex, targetEnd?.index ?? -1);
        }, 0);
        const activeTimelineLength = visibleGoals.length > 0 ? activeHorizonEndIndex + 1 : 0;
        return {
            labels: allLabels.slice(0, activeTimelineLength),
            activeTimeline: timeline.slice(0, activeTimelineLength),
        };
    }, [allLabels, timeline, visibleGoals]);
    const activeTimelineLength = labels.length;

    const projectionDatasets = useMemo(() => visibleGoals.map((goal) => {
        const color = goalColor(goal);

        return {
            label: `${goal.name || "Goal"} — projected cumulative net flow`,
            data: goal.data.slice(0, activeTimelineLength),
            borderColor: color,
            backgroundColor: color,
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 6,
            tension: 0.25,
            spanGaps: false,
            goalid: goal.goalid,
            targetAmount: goal.targetAmount,
            targetDate: goal.targetDate,
        };
    }), [visibleGoals, labels.length]);

    const targetDatasets = useMemo(() => visibleGoals.flatMap((goal) => {
        const targetAmount = getValidTargetAmount(goal);
        const targetEnd = getTargetEndIndex(goal, timeline);

        if (targetAmount === null || targetEnd === null) {
            return [];
        }

        const color = goalColor(goal);
        const data = activeTimeline.map((_, index) =>
            index <= targetEnd.index ? targetAmount : null
        );

        return [{
            label: `${goal.name || "Goal"} — target amount reference`,
            data,
            borderColor: color,
            backgroundColor: color,
            borderWidth: 1.5,
            borderDash: [6, 5],
            pointRadius: data.map((_, index) =>
                targetEnd.hasDeadlineMarker && index === targetEnd.index ? 5 : 0
            ),
            pointHoverRadius: data.map((_, index) =>
                targetEnd.hasDeadlineMarker && index === targetEnd.index ? 7 : 0
            ),
            pointStyle: "triangle",
            pointBorderWidth: 2,
            pointBackgroundColor: color,
            pointBorderColor: color,
            spanGaps: false,
            goalid: goal.goalid,
            targetAmount,
            targetDate: goal.targetDate,
            targetReference: true,
        }];
    }), [visibleGoals, activeTimeline, timeline]);

    const datasets = [...projectionDatasets, ...targetDatasets];

    const options = {
        interaction: {
            mode: "index",
            intersect: false,
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Month",
                    color: themeColors.text,
                },
                ticks: {
                    color: themeColors.text,
                    autoSkip: true,
                    maxTicksLimit: 12,
                    maxRotation: 0,
                },
                grid: {
                    color: themeColors.grid,
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Projected cumulative net flow (INR)",
                    color: themeColors.text,
                },
                ticks: {
                    color: themeColors.text,
                    callback: (value) => currencyFormatter.format(value),
                },
                grid: {
                    color: themeColors.grid,
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        if (context.dataset.targetReference) {
                            return `Target amount reference: ${currencyFormatter.format(context.raw)} (deadline: ${formatTargetDate(context.dataset.targetDate)})`;
                        }

                        return `${context.dataset.label}: ${currencyFormatter.format(context.raw)}`;
                    },
                },
            },
        },
    };

    return (
        <section className="goals-overview-chart">
            <header className="goals-overview-chart-header">
                <div>
                    <h2>Goals overview</h2>
                    <p>
                        Compare projected cumulative net flow with goal targets.
                        Dashed target references end at each deadline; they do
                        not indicate a required amount at every point.
                    </p>
                </div>
            </header>

            <div className="goals-overview-selection" role="group" aria-label="Choose goals to show">
                <div className="goals-overview-selection-actions">
                    <button
                        type="button"
                        onClick={() => onSelectionChange?.(new Set(goalKeys))}
                        disabled={allGoalsSelected}
                    >
                        Select all
                    </button>
                    <button
                        type="button"
                        onClick={() => onSelectionChange?.(new Set())}
                        disabled={noGoalsSelected}
                    >
                        Clear selection
                    </button>
                </div>

                <fieldset className="goals-overview-selection-list">
                    <legend>Goals shown in chart</legend>
                    {goals.map((goal) => {
                        const key = getGoalKey(goal);
                        const color = goalColor(goal);

                        return (
                            <label key={key} className="goals-overview-selection-item">
                                <input
                                    type="checkbox"
                                    checked={selectedGoalKeys.has(key)}
                                        onChange={() => {
                                            const nextSelection = new Set(selectedGoalKeys);
                                            if (nextSelection.has(key)) nextSelection.delete(key);
                                            else nextSelection.add(key);
                                            onSelectionChange?.(nextSelection);
                                    }}
                                    style={{ accentColor: color }}
                                />
                                <span
                                    className="goals-overview-target-color"
                                    style={{ backgroundColor: color }}
                                    aria-hidden="true"
                                />
                                <span className="goals-overview-selection-name">
                                    {goal.name || "Goal"}
                                    {!isLoading && !usableProjectionGoals.includes(goal) && (
                                        <small>{getUnavailableProjectionMessage(goal)}</small>
                                    )}
                                </span>
                            </label>
                        );
                    })}
                </fieldset>
            </div>

            <div className="goals-overview-chart-plot">
                {isLoading ? (
                    <div className="goals-overview-skeleton" role="status" aria-label="Loading goals chart">
                        <span className="goals-overview-skeleton-line wide" />
                        <span className="goals-overview-skeleton-line medium" />
                        <span className="goals-overview-skeleton-chart" />
                    </div>
                ) : visibleGoals.length > 0 && labels.length > 0 ? (
                    <GenericChart
                        type="line"
                        labels={labels}
                        datasets={datasets}
                        options={options}
                    />
                ) : usableProjectionGoals.length > 0 ? (
                    <p className="goals-overview-chart-no-selection" role="status">
                        {visibleGoals.length === 0
                            ? "No goals selected. Select a goal above to show its projection."
                            : "No timeline is available for the selected projections."}
                    </p>
                ) : (
                    <p className="goals-overview-chart-no-selection" role="status">
                        No usable projections are available yet. Add transaction
                        history to see projected cumulative net flow.
                    </p>
                )}
            </div>

        </section>
    );
}
