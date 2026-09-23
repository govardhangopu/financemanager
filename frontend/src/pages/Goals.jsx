import { useEffect, useState, useRef } from "react";
import { createGoal, deleteGoal, getGoalProjection, getGoals, updateGoal } from "../api/goalApi";
import { GenericChart } from "../components/GenericChart";
import { AnimatePresence, motion } from "motion/react";
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
        if (!selectedGoal) {
            setProjection(null);
            return;
        }

        const loadProjection = async () => {
            setProjectionLoading(true);
            setProjectionError("");

            try {
                const data = await getGoalProjection(selectedGoal);
                setProjection(data);
                console.log(data)
            } catch (err) {
                console.error(err);
                setProjectionError("Unable to load goal projection.");
            } finally {
                setProjectionLoading(false);
            }
        };

        loadProjection();
    }, [selectedGoal]);

    const goalChartLabels = projection
        ? [
            "Today",
            ...(projection.projection?.map((point) => {
                const date = new Date();
                date.setMonth(date.getMonth() + point.month);

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
                        const projectionMonth = index + 1;

                        if (index === projection.projection.length - 1) {
                            return 7;
                        }

                        if (projectionMonth === projection.goalReachedAt) {
                            return 5;
                        }

                        return 3;
                    })
                ],
                pointHoverRadius: [
                    8,
                    ...projection.projection.map((_, index) => {
                        const projectionMonth = index + 1;

                        if (index === projection.projection.length - 1) {
                            return 9;
                        }

                        if (projectionMonth === projection.goalReachedAt) {
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

                if (selectedGoal === editingGoal.goalid) {
                    const updatedProjection = await getGoalProjection(
                        editingGoal.goalid
                    );

                    setProjection(updatedProjection);
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
                <div className="goals-card">
                    <p className="goals-message">Loading goals...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="goals-page">
                <div className="goals-card">
                    <p className="goals-message">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="goals-page">
            <div className="goals-card">
                <div className="goals-header">
                    <div>
                        <h1>Goals</h1>
                        <p>
                            Set financial targets and see how your current
                            financial path compares.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="goals-add-button"
                        onClick={() => setShowForm(true)}
                    >
                        + Add Goal
                    </button>
                </div>

                {goals.length === 0 ? (
                    <div className="goals-empty-state">
                        <h2>No goals yet</h2>
                        <p>
                            Create a financial goal to start tracking where
                            you want to go.
                        </p>
                    </div>
                ) : (
                    <div className="goals-list">
                        {goals.map((goal) => {
                            const isSelected = selectedGoal === goal.goalid;

                            return (
                                <motion.div
                                    key={goal.goalid}
                                    className={`goal-item ${isSelected ? "selected" : ""}`}
                                    transition={{
                                        layout: {
                                            duration: 0.4,
                                            ease: [0.4, 0, 0.2, 1]
                                        }
                                    }}
                                    onClick={() =>
                                        setSelectedGoal(
                                            isSelected ? null : goal.goalid
                                        )
                                    }
                                >
                                    <div className="goal-header">
                                        <motion.div
                                            className="goal-main"
                                            layout="position"
                                        >
                                            <motion.h2 layout="position">
                                                {goal.name}
                                            </motion.h2>

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
                                                                                <div
                                                                                    className="goal-progress-current"
                                                                                    style={{
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
                )
                }
            </div >

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
        </div >
    );
};

export default Goals;