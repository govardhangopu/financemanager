import { useCallback, useEffect, useState, useRef } from "react";
import { createGoal, deleteGoal, getGoalProjection, getGoals, updateGoal } from "../api/goalApi";
import { GoalsOverviewChart } from "../components/GoalsOverviewChart";
import { GenericChart } from "../components/GenericChart";
import { AnimatePresence, motion } from "motion/react";
import { prepareGoalProjectionChartData } from "../utils/goalProjectionChartData";
import "../styles/Goals.css";

function GoalDescription({ description }) {
    const descriptionRef = useRef(null);
    const [isTruncated, setIsTruncated] = useState(false);

    useEffect(() => {
        const element = descriptionRef.current;

        if (!element) return;

        const checkTruncation = () => {
            setIsTruncated(
                element.scrollHeight > element.clientHeight
            );
        };

        checkTruncation();

        const observer = new ResizeObserver(checkTruncation);
        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [description]);

    return (
        <div className="goal-description">
            <p ref={descriptionRef}>
                {description}
            </p>

            {isTruncated && (
                <div className="goal-description-tooltip">
                    {description}
                </div>
            )}
        </div>
    );
}

function GoalsPageHeader({ onAddGoal, showAction = true }) {
    return (
        <header className="finance-page-header goals-page-header">
            <div className="finance-page-heading">
                <h1>Financial Goals</h1>
                <p>
                    Track your targets and compare them with projected
                    cumulative net flow over time.
                </p>
            </div>

            {showAction && (
                <button
                    type="button"
                    className="goals-add-button"
                    onClick={onAddGoal}
                >
                    Add Goal
                </button>
            )}
        </header>
    );
}

const Goals = () => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [projection, setProjection] = useState(null);
    const [projectionLoading, setProjectionLoading] = useState(false);
    const [projectionError, setProjectionError] = useState("");
    const [editingGoal, setEditingGoal] = useState(null);
    const [overviewProjections, setOverviewProjections] = useState({});
    const [overviewLoading, setOverviewLoading] = useState(false);
    const [overviewError, setOverviewError] = useState("");
    const goalRefs = useRef({});
    const projectionCacheRef = useRef(new Map());
    const projectionRequestsRef = useRef(new Map());
    const goalsRef = useRef(goals);
    goalsRef.current = goals;

    const loadGoalProjection = useCallback((goalId, refresh = false) => {
        const key = String(goalId);
        const pendingRequest = projectionRequestsRef.current.get(key);

        if (pendingRequest && (!refresh || pendingRequest.refresh)) {
            return pendingRequest.promise;
        }

        if (!refresh && projectionCacheRef.current.has(key)) {
            return Promise.resolve(projectionCacheRef.current.get(key));
        }

        if (refresh) {
            projectionCacheRef.current.delete(key);
            setOverviewProjections((previous) => {
                if (!(key in previous)) return previous;

                const next = { ...previous };
                delete next[key];
                return next;
            });
        }

        const requestEntry = { refresh, promise: null };
        const request = getGoalProjection(goalId)
            .then((data) => {
                if (
                    projectionRequestsRef.current.get(key) === requestEntry
                    && goalsRef.current.some((goal) => String(goal.goalid) === key)
                ) {
                    projectionCacheRef.current.set(key, data);
                    setOverviewProjections((previous) => ({
                        ...previous,
                        [key]: data,
                    }));
                }

                return data;
            })
            .finally(() => {
                if (projectionRequestsRef.current.get(key) === requestEntry) {
                    projectionRequestsRef.current.delete(key);
                }
            });

        requestEntry.promise = request;
        projectionRequestsRef.current.set(key, requestEntry);
        return request;
    }, []);

    const scrollToGoal = (goalId) => {
        const element = goalRefs.current[goalId];

        if (!element) return;

        element.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    };

    const [form, setForm] = useState({
        name: "",
        target_amount: "",
        target_date: "",
        description: ""
    });

    const loadGoals = async () => {
        try {
            const data = await getGoals();
            setGoals(data);
        } catch (err) {
            console.error(err);
            setError("Unable to load goals.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGoals();
    }, []);

    useEffect(() => {
        const currentGoalIds = new Set(goals.map((goal) => String(goal.goalid)));

        projectionCacheRef.current.forEach((_, key) => {
            if (!currentGoalIds.has(key)) {
                projectionCacheRef.current.delete(key);
            }
        });

        setOverviewProjections((previous) =>
            Object.fromEntries(
                Object.entries(previous).filter(([key]) => currentGoalIds.has(key))
            )
        );

        if (goals.length === 0) {
            setOverviewLoading(false);
            setOverviewError("");
            return undefined;
        }

        let active = true;
        setOverviewLoading(true);
        setOverviewError("");

        Promise.allSettled(
            goals.map((goal) => loadGoalProjection(goal.goalid))
        ).then((results) => {
            if (!active) return;

            const failedCount = results.filter((result, index) => {
                if (result.status !== "rejected") return false;

                const key = String(goals[index].goalid);
                return !projectionCacheRef.current.has(key)
                    && !projectionRequestsRef.current.has(key);
            }).length;

            if (failedCount > 0) {
                setOverviewError(
                    failedCount === goals.length
                        ? "Unable to load goal projections."
                        : "Some goal projections could not be loaded. Showing available projections."
                );
            }
        }).finally(() => {
            if (active) {
                setOverviewLoading(false);
            }
        });

        return () => {
            active = false;
        };
    }, [goals, loadGoalProjection]);

    useEffect(() => {
        if (!selectedGoal) {
            setProjection(null);
            return;
        }

        let active = true;
        const loadProjection = async () => {
            setProjectionLoading(true);
            setProjectionError("");

            try {
                const data = await loadGoalProjection(selectedGoal);
                if (
                    active
                    && projectionCacheRef.current.get(String(selectedGoal)) === data
                ) {
                    setProjection(data);
                }
            } catch (err) {
                console.error(err);
                const key = String(selectedGoal);
                if (
                    active
                    && !projectionCacheRef.current.has(key)
                    && !projectionRequestsRef.current.has(key)
                ) {
                    setProjectionError("Unable to load goal projection.");
                }
            } finally {
                if (active) {
                    setProjectionLoading(false);
                }
            }
        };

        loadProjection();

        return () => {
            active = false;
        };
    }, [selectedGoal, loadGoalProjection]);

    const overviewChartData = prepareGoalProjectionChartData(
        goals.map((goal) => ({
            goal,
            projection: overviewProjections[String(goal.goalid)] ?? null,
        }))
    );

    const goalChartLabels = projection
        ? [
            "Today",
            ...(projection.projection?.map((point) => {
                const date = new Date();
                date.setMonth(date.getMonth() + point.month);

                if (point.date) {
                    return new Date(`${point.date}T00:00:00`).toLocaleDateString("en-IN", {
                        month: "short",
                        year: "numeric",
                        day: "numeric",
                    });
                }

                return date.toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric"
                });
            }) || [])
        ]
        : [];

    const goalChartDatasets = projection?.projection
        ? [
            {
                label: "Projected",
                data: [
                    projection.currentCumulativeNetFlow,
                    ...projection.projection.map(
                        (point) => point.cumulativeNetFlow
                    )
                ],
                borderColor: "#646cff",
                backgroundColor: "transparent",
                borderWidth: 2,
                tension: 0.3,
                pointRadius: [
                    6,
                    ...projection.projection.map((_, index) => {
                        if (index === projection.projection.length - 1) {
                            return 7;
                        }

                        if (projection.projection[index]?.date === projection.goalReachedDate) {
                            return 5;
                        }

                        return 3;
                    })
                ],
                pointHoverRadius: [
                    8,
                    ...projection.projection.map((_, index) => {
                        if (index === projection.projection.length - 1) {
                            return 9;
                        }

                        if (projection.projection[index]?.date === projection.goalReachedDate) {
                            return 7;
                        }

                        return 5;
                    })
                ],
            },
            {
                label: "Target",
                data: [
                    projection.goal.targetAmount,
                    ...projection.projection.map(
                        () => projection.goal.targetAmount
                    )
                ],
                borderColor: "#888",
                borderWidth: 1.5,
                borderDash: [6, 6],
                pointRadius: 0,
                pointHoverRadius: 0,
            }
        ]
        : [];

    const goalChartOptions = {
        interaction: {
            mode: "index",
            intersect: false,
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) => {
                        return `${context.dataset.label}: ₹${Number(context.raw).toLocaleString("en-IN", {
                            maximumFractionDigits: 0
                        })}`;
                    }
                }
            }
        }
    };

    const handleEdit = (goal) => {
        setEditingGoal(goal);
        setForm({
            name: goal.name,
            target_amount: goal.target_amount,
            target_date: goal.target_date,
            description: goal.description || ""
        });
        setShowForm(true);
    };

    const handleDelete = async (goalid) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this goal?"
        );

        if (!confirmed) return;

        try {
            await deleteGoal(goalid);

            setGoals((prev) =>
                prev.filter((goal) => goal.goalid !== goalid)
            );

            if (selectedGoal === goalid) {
                setSelectedGoal(null);
                setProjection(null);
            }
            projectionCacheRef.current.delete(String(goalid));
            setOverviewProjections((previous) => {
                const next = { ...previous };
                delete next[String(goalid)];
                return next;
            });
        } catch (err) {
            console.error(err);
            setError("Unable to delete goal.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const goalData = {
                name: form.name,
                target_amount: Number(form.target_amount),
                target_date: form.target_date,
                description: form.description
            };

            if (editingGoal) {
                const updatedGoal = await updateGoal(
                    editingGoal.goalid,
                    goalData
                );

                setGoals((prev) =>
                    prev.map((goal) =>
                        goal.goalid === editingGoal.goalid
                            ? updatedGoal
                            : goal
                    )
                );

                const updatedProjectionRequest = loadGoalProjection(
                    editingGoal.goalid,
                    true
                );

                if (selectedGoal === editingGoal.goalid) {
                    setProjection(await updatedProjectionRequest);
                } else {
                    try {
                        await updatedProjectionRequest;
                    } catch (projectionLoadError) {
                        console.error(projectionLoadError);
                        setOverviewError("Unable to refresh goal projections.");
                    }
                }
            } else {
                const newGoal = await createGoal(goalData);
                setGoals((prev) => [...prev, newGoal]);
            }

            setForm({
                name: "",
                target_amount: "",
                target_date: "",
                description: ""
            });

            setEditingGoal(null);
            setShowForm(false);
        } catch (err) {
            console.error(err);
            setError(
                editingGoal
                    ? "Unable to update goal."
                    : "Unable to create goal."
            );
        }
    };

    if (loading) {
        return (
            <div className="goals-page">
                <GoalsPageHeader showAction={false} />
                <div className="goals-card">
                    <p className="goals-message">Loading goals...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="goals-page">
                <GoalsPageHeader showAction={false} />
                <div className="goals-card">
                    <p className="goals-message">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="goals-page">
            <GoalsPageHeader onAddGoal={() => setShowForm(true)} />
            <div className="goals-card">
                {goals.length > 0 && (
                    <section className="goals-overview-section" aria-label="Goals projection overview">
                        {overviewLoading && (
                            <h2 className="goals-overview-message" role="status">
                                Loading goal projections...
                            </h2>
                        )}

                        {overviewError && (
                            <h2 className="goals-overview-message" role="status">
                                {overviewError}
                            </h2>
                        )}

                        {!overviewLoading
                            && (!overviewError || Object.keys(overviewProjections).length > 0)
                            && <GoalsOverviewChart chartData={overviewChartData} />}
                    </section>
                )}

                {goals.length === 0 ? (
                    <div className="goals-empty-state">
                        <h2>No goals yet</h2>
                        <p>
                            Create a financial goal to start tracking where
                            you want to go.
                        </p>
                    </div>
                ) : (
                    <section className="goals-individual-section" aria-labelledby="individual-goals-heading">
                        <header className="goals-section-header">
                            <h2 id="individual-goals-heading">Individual goals</h2>
                            <p>
                                {goals.length} {goals.length === 1 ? "goal" : "goals"}
                            </p>
                        </header>
                        <div className="goals-list">
                            {goals.map((goal) => {
                                const isSelected = selectedGoal === goal.goalid;

                                return (
                                    <motion.div
                                        ref={(element) => {
                                            if (element) {
                                                goalRefs.current[goal.goalid] = element;
                                            } else {
                                                delete goalRefs.current[goal.goalid];
                                            }
                                        }}
                                        key={goal.goalid}
                                        className={`goal-item ${isSelected ? "selected" : ""}`}
                                        transition={{
                                            layout: {
                                                duration: 0.4,
                                                ease: [0.4, 0, 0.2, 1]
                                            }
                                        }}
                                        onClick={() => {
                                            if (isSelected) {
                                                setSelectedGoal(null);
                                                return;
                                            }

                                            setSelectedGoal(goal.goalid);

                                            requestAnimationFrame(() => {
                                                requestAnimationFrame(() => {
                                                    scrollToGoal(goal.goalid);
                                                });
                                            });
                                        }}
                                    >
                                        <div className="goal-header">
                                            <motion.div
                                                className="goal-main"
                                                layout="position"
                                            >
                                                <motion.h2 layout="position">
                                                    {goal.name}
                                                </motion.h2>

                                                <span className="goal-expand-hint" aria-hidden="true">
                                                    <span>{isSelected ? "Collapse projection" : "Expand for projection"}</span>
                                                    <span
                                                        className={`goal-expand-hint-chevron ${isSelected ? "expanded" : ""}`}
                                                    />
                                                </span>

                                                {goal.description && (
                                                    <motion.div layout="position">
                                                        <GoalDescription description={goal.description} />
                                                    </motion.div>
                                                )}
                                            </motion.div>

                                            <motion.div
                                                className="goal-target"
                                                layout="position"
                                            >
                                                <span>Target</span>
                                                <strong>
                                                    ₹{Number(goal.target_amount).toLocaleString("en-IN")}
                                                </strong>
                                            </motion.div>

                                            <motion.div
                                                className="goal-date"
                                                layout="position"
                                            >
                                                <span>Deadline</span>
                                                <strong>
                                                    {new Date(goal.target_date).toLocaleDateString("en-IN", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric"
                                                    })}
                                                </strong>
                                            </motion.div>

                                            <motion.div
                                                className="goal-actions"
                                                layout="position"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(goal);
                                                    }}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(goal.goalid);
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </motion.div>
                                        </div>

                                        <AnimatePresence initial={false}>
                                            {isSelected && (
                                                <motion.div
                                                    className="goal-projection-wrapper"
                                                    initial={false}
                                                    animate={{
                                                        gridTemplateRows: isSelected ? "1fr" : "0fr",
                                                        opacity: isSelected ? 1 : 0,
                                                    }}
                                                    transition={{
                                                        gridTemplateRows: {
                                                            duration: 0.4,
                                                            ease: [0.4, 0, 0.2, 1],
                                                        },
                                                        opacity: {
                                                            duration: 0.2,
                                                        },
                                                    }}
                                                >
                                                    <div className="goal-projection">

                                                        {projectionLoading && (
                                                            <p className="goals-message">
                                                                Loading projection...
                                                            </p>
                                                        )}

                                                        {projectionError && (
                                                            <p className="goals-message">
                                                                {projectionError}
                                                            </p>
                                                        )}

                                                        {!projectionLoading &&
                                                            !projectionError &&
                                                            projection && (
                                                                <>
                                                                    {!projection.hasData ? (
                                                                        <p className="goal-projection-muted">
                                                                            Add some transaction history to see how your current
                                                                            financial path compares with this goal.
                                                                        </p>
                                                                    ) : (
                                                                        <>
                                                                            <motion.div
                                                                                className="goal-projection-values"
                                                                                initial={{ opacity: 0, y: 8 }}
                                                                                animate={{ opacity: 1, y: 0 }}
                                                                                transition={{
                                                                                    duration: 0.2,
                                                                                    delay: 0.08
                                                                                }}
                                                                            >
                                                                                <div>
                                                                                    <span>Current cumulative net flow</span>
                                                                                    <strong>
                                                                                        ₹{Number(
                                                                                            projection.currentCumulativeNetFlow
                                                                                        ).toLocaleString("en-IN")}
                                                                                    </strong>
                                                                                </div>

                                                                                <div>
                                                                                    <span>Projected at target date</span>
                                                                                    <strong>
                                                                                        ₹{Number(
                                                                                            projection.projectedCumulativeNetFlow
                                                                                        ).toLocaleString("en-IN")}
                                                                                    </strong>
                                                                                </div>

                                                                                <div>
                                                                                    <span>Required monthly net flow</span>
                                                                                    <strong>
                                                                                        ₹{Number(
                                                                                            projection.requiredMonthlyNetFlow
                                                                                        ).toLocaleString("en-IN")}
                                                                                    </strong>
                                                                                </div>

                                                                                <div>
                                                                                    <span>Time remaining</span>
                                                                                    <strong>
                                                                                        {projection.monthsRemaining} months
                                                                                    </strong>
                                                                                </div>
                                                                            </motion.div>

                                                                            <motion.div
                                                                                className="goal-progress"
                                                                                initial={{ opacity: 0, y: 8 }}
                                                                                animate={{ opacity: 1, y: 0 }}
                                                                                transition={{
                                                                                    duration: 0.2,
                                                                                    delay: 0.12
                                                                                }}
                                                                            >
                                                                                <div className="goal-progress-header">
                                                                                    <span>Progress toward target</span>

                                                                                    <span>
                                                                                        ₹{Number(
                                                                                            projection.currentCumulativeNetFlow
                                                                                        ).toLocaleString("en-IN", {
                                                                                            maximumFractionDigits: 0
                                                                                        })}
                                                                                        {" / "}
                                                                                        ₹{Number(
                                                                                            projection.goal.targetAmount
                                                                                        ).toLocaleString("en-IN", {
                                                                                            maximumFractionDigits: 0
                                                                                        })}
                                                                                    </span>
                                                                                </div>

                                                                                <div className="goal-progress-track">
                                                                                    <motion.div
                                                                                        className="goal-progress-current"
                                                                                        initial={{ width: 0 }}
                                                                                        animate={{
                                                                                            width: `${Math.min(
                                                                                                100,
                                                                                                Math.max(
                                                                                                    0,
                                                                                                    (
                                                                                                        projection.currentCumulativeNetFlow /
                                                                                                        projection.goal.targetAmount
                                                                                                    ) * 100
                                                                                                )
                                                                                            )}%`
                                                                                        }}
                                                                                    />
                                                                                </div>

                                                                                <div className="goal-progress-projected">
                                                                                    Projected at deadline:{" "}
                                                                                    <strong>
                                                                                        ₹{Number(
                                                                                            projection.projectedCumulativeNetFlow
                                                                                        ).toLocaleString("en-IN", {
                                                                                            maximumFractionDigits: 0
                                                                                        })}
                                                                                    </strong>
                                                                                </div>
                                                                            </motion.div>

                                                                            <motion.div
                                                                                className="goal-projection-chart"
                                                                                initial={{ opacity: 0 }}
                                                                                animate={{ opacity: 1 }}
                                                                                transition={{
                                                                                    opacity: { duration: 0.25, delay: 0.15 }
                                                                                }}
                                                                            >
                                                                                <div className="goal-projection-chart-header">
                                                                                    Projection to target
                                                                                </div>

                                                                                <div className="goal-projection-chart-container">
                                                                                    <GenericChart
                                                                                        labels={goalChartLabels}
                                                                                        datasets={goalChartDatasets}
                                                                                        options={goalChartOptions}
                                                                                    />
                                                                                </div>
                                                                            </motion.div>

                                                                            <motion.div
                                                                                className={`goal-projection-status ${projection.goalReached
                                                                                    ? "goal-reached"
                                                                                    : projection.deadlinePassed
                                                                                        ? "deadline-passed"
                                                                                        : projection.onTrack
                                                                                            ? "on-track"
                                                                                            : "behind"
                                                                                    }`}
                                                                                initial={{ opacity: 0, y: 8 }}
                                                                                animate={{ opacity: 1, y: 0 }}
                                                                                transition={{
                                                                                    duration: 0.2,
                                                                                    delay: 0.18
                                                                                }}
                                                                            >
                                                                                <strong>
                                                                                    {projection.goalReached
                                                                                        ? "Goal reached"
                                                                                        : projection.deadlinePassed
                                                                                            ? "Deadline passed"
                                                                                            : projection.onTrack
                                                                                                ? "On track"
                                                                                                : `Behind target by ₹${Number(
                                                                                                    projection.shortfall
                                                                                                ).toLocaleString("en-IN", {
                                                                                                    maximumFractionDigits: 0
                                                                                                })}`}
                                                                                </strong>

                                                                                <p>
                                                                                    {projection.goalReached
                                                                                        ? "You have already reached this goal with your current cumulative net flow."
                                                                                        : projection.deadlinePassed
                                                                                            ? `The target date has passed and you are ₹${Number(
                                                                                                projection.shortfall
                                                                                            ).toLocaleString("en-IN", {
                                                                                                maximumFractionDigits: 0
                                                                                            })} short of the goal.`
                                                                                            : projection.onTrack
                                                                                                ? projection.goalReachedDate
                                                                                                    ? projection.monthsEarly > 0
                                                                                                        ? `Your current financial path is projected to reach the target ${projection.monthsEarly} months before the deadline.`
                                                                                                        : "Your current financial path is projected to reach the target by the deadline."
                                                                                                    : `You are projected to reach ₹${Number(
                                                                                                        projection.projectedCumulativeNetFlow
                                                                                                    ).toLocaleString("en-IN", {
                                                                                                        maximumFractionDigits: 0
                                                                                                    })} by the deadline.`
                                                                                                : `You are projected to reach ₹${Number(
                                                                                                    projection.projectedCumulativeNetFlow
                                                                                                ).toLocaleString("en-IN", {
                                                                                                    maximumFractionDigits: 0
                                                                                                })} by the deadline. You need ₹${Number(
                                                                                                    projection.monthlyGap
                                                                                                ).toLocaleString("en-IN", {
                                                                                                    maximumFractionDigits: 0
                                                                                                })} more per month than your current average to reach the goal on time.`}
                                                                                </p>
                                                                            </motion.div>
                                                                        </>
                                                                    )}
                                                                </>
                                                            )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </section>
                )}
            </div>

            {showForm && (
                <div className="goal-modal">
                    <div className="goal-modal-card">
                        <div className="goal-modal-header">
                            <h2>{editingGoal ? "Edit Goal" : "Add Goal"}</h2>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <label>
                                Goal name
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Emergency Fund"
                                    required
                                />
                            </label>

                            <label>
                                Target amount
                                <input
                                    type="number"
                                    name="target_amount"
                                    value={form.target_amount}
                                    onChange={handleChange}
                                    placeholder="50000"
                                    min="1"
                                    required
                                />
                            </label>

                            <label>
                                Target date
                                <input
                                    type="date"
                                    name="target_date"
                                    value={form.target_date}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            <label>
                                Description
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Optional"
                                    rows="3"
                                />
                            </label>

                            <div className="goal-modal-actions">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingGoal(null);
                                    }}
                                >
                                    Cancel
                                </button>

                                <button type="submit">
                                    {editingGoal ? "Save Changes" : "Create Goal"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Goals;
