import { useEffect, useState } from "react";
import { createGoal, deleteGoal, getGoalProjection, getGoals, updateGoal } from "../api/goalApi";
import "../styles/Goals.css";

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
            } catch (err) {
                console.error(err);
                setProjectionError("Unable to load goal projection.");
            } finally {
                setProjectionLoading(false);
            }
        };

        loadProjection();
    }, [selectedGoal]);

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
                        {goals.map((goal) => (
                            <div
                                className={`goal-item ${selectedGoal === goal.goalid ? "selected" : ""}`}
                                key={goal.goalid}
                                onClick={() => setSelectedGoal(selectedGoal === goal.goalid ? null : goal.goalid)}
                            >
                                <div>
                                    <h2>{goal.name}</h2>
                                    {goal.description && (
                                        <p>{goal.description}</p>
                                    )}
                                </div>

                                <div className="goal-target">
                                    ₹{Number(goal.target_amount).toLocaleString("en-IN")}
                                </div>

                                <div className="goal-date">
                                    {goal.target_date}
                                </div>
                                <div className="goal-actions">
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
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {selectedGoal && (
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

                        {!projectionLoading && !projectionError && projection && (
                            <>
                                <div className="goal-projection-header">
                                    <div>
                                        <span>GOAL PROJECTION</span>
                                        <h2>{projection.goal.name}</h2>
                                    </div>

                                    <div className="goal-projection-target">
                                        <span>Target</span>
                                        <strong>
                                            ₹{Number(projection.goal.targetAmount).toLocaleString("en-IN")}
                                        </strong>
                                        <small>{projection.goal.targetDate}</small>
                                    </div>
                                </div>

                                {!projection.hasData ? (
                                    <p className="goal-projection-muted">
                                        Add some transaction history to see how your current
                                        financial path compares with this goal.
                                    </p>
                                ) : (
                                    <div className="goal-projection-values">
                                        <div>
                                            <span>Current cumulative net flow</span>
                                            <strong>
                                                ₹{Number(projection.currentCumulativeNetFlow).toLocaleString("en-IN")}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Projected at target date</span>
                                            <strong>
                                                ₹{Number(projection.projectedCumulativeNetFlow).toLocaleString("en-IN")}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Required monthly net flow</span>
                                            <strong>
                                                ₹{Number(projection.requiredMonthlyNetFlow).toLocaleString("en-IN")}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Time remaining</span>
                                            <strong>
                                                {projection.monthsRemaining} months
                                            </strong>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
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