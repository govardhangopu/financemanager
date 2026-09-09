import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFinance } from "../context/FinanceContext.jsx";
import {
    getScenarioById,
    updateScenario,
    deleteScenario,
    getScenarioChanges,
    getScenarioProjection,
    getSimulatedScenarioProjection,
    addScenarioChange,
    updateScenarioChange,
    deleteScenarioChange
} from "../api/scenarioApi.js";
import { GenericChart } from "../components/dashboard/GenericChart.jsx";
import ScenarioChangeModal from "../components/ScenarioChangeModal.jsx";
import "../styles/ScenarioDetail.css";

export default function ScenarioDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { refreshScenarios } = useFinance();
    const [scenario, setScenario] = useState(null);
    const [changes, setChanges] = useState([]);
    const [simulatedChanges, setSimulatedChanges] = useState([]);
    const [projection, setProjection] = useState(null);
    const [showChangeModal, setShowChangeModal] = useState(false);
    const [editingChange, setEditingChange] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [edits, setEdits] = useState({ name: "", description: "" });

    const [horizon, setHorizon] = useState(12);
    const projectionLabels = projection?.projection?.map(row => row.month) || [];
    const projectionDatasets = [
        {
            label: "Baseline",
            data: projection?.projection?.map(row => row.baselineCumulativeNetFlow) || [],
            borderColor: "#6b7280",
            backgroundColor: "#6b7280",
            tension: 0.3,
        },
        {
            label: "Scenario",
            data: projection?.projection?.map(row => row.scenarioCumulativeNetFlow) || [],
            borderColor: "#3b82f6",
            backgroundColor: "#3b82f6",
            borderDash: [6, 6],
            tension: 0.3,
        }
    ];

    useEffect(() => {
        loadScenario();
    }, [id]);

    useEffect(() => {
        if (!id) return;
        loadProjection();
    }, [id, horizon, simulatedChanges]);

    async function loadScenario() {
        if (!id) return;

        setLoading(true);

        try {
            const [scenarioData, changesData] = await Promise.all([
                getScenarioById(id),
                getScenarioChanges(id)
            ]);

            setScenario(scenarioData);
            setChanges(changesData);
            setSimulatedChanges(changesData);
        } catch (err) {
            console.error("Failed to load scenario:", err);
            alert("Failed to load scenario.");
            navigate("/scenarios", { replace: true });
        } finally {
            setLoading(false);
        }
    }

    async function loadProjection() {
        try {
            const projectionData = await getSimulatedScenarioProjection(id, simulatedChanges, horizon);
            setProjection(projectionData);
        } catch (err) {
            console.error("Failed to load projection:", err);
            alert("Failed to load projection.");
        }
    }

    function updateSimulatedChange(changeId, updates) {
        setSimulatedChanges(current =>
            current.map(change =>
                change.scenario_changeid === changeId
                    ? { ...change, ...updates }
                    : change
            )
        );
    }

    function resetSimulatedChange(changeId) {
        const originalChange = changes.find(
            change => change.scenario_changeid === changeId
        );

        if (!originalChange) return;

        updateSimulatedChange(changeId, {
            amount: Number(originalChange.amount),
            start_date: originalChange.start_date
                ? originalChange.start_date.split("T")[0]
                : ""
        });
    }

    async function handleSaveSimulatedChanges() {
        try {
            const changed = simulatedChanges.filter((simulatedChange) => {
                const originalChange = changes.find(
                    change => change.scenario_changeid === simulatedChange.scenario_changeid
                );

                if (!originalChange) return false;

                return (
                    Number(simulatedChange.amount) !== Number(originalChange.amount) ||
                    simulatedChange.start_date?.split("T")[0] !== originalChange.start_date?.split("T")[0]
                );
            });

            if (changed.length === 0) return;

            await Promise.all(
                changed.map(change =>
                    updateScenarioChange(
                        id,
                        change.scenario_changeid,
                        {
                            ...change,
                            start_date: change.start_date?.split("T")[0] || null,
                            end_date: change.end_date?.split("T")[0] || null
                        }
                    )
                )
            );

            const [changesData, projectionData] = await Promise.all([
                getScenarioChanges(id),
                getScenarioProjection(id, horizon)
            ]);

            setChanges(changesData);
            setSimulatedChanges(changesData);
            setProjection(projectionData);
        } catch (err) {
            console.error("Failed to save simulated changes:", err);
            alert(err.response?.data?.message || "Failed to save changes.");
        }
    }

    function hasSimulatedChanges() {
        return simulatedChanges.some((simulatedChange) => {
            const originalChange = changes.find(
                change => change.scenario_changeid === simulatedChange.scenario_changeid
            );

            if (!originalChange) return false;

            return (
                Number(simulatedChange.amount) !== Number(originalChange.amount) ||
                simulatedChange.start_date?.split("T")[0] !== originalChange.start_date?.split("T")[0]
            );
        });
    }

    function getSliderMax(amount) {
        return Math.max(1000, Math.ceil(Number(amount) * 2 / 1000) * 1000);
    }

    function formatScenarioDate(dateValue) {
        if (!dateValue) return "";

        const datePart = String(dateValue).split("T")[0];
        const [year, month, day] = datePart.split("-");

        return new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
        ).toLocaleDateString();
    }

    function startEditing() {
        setEdits({
            name: scenario?.name || "",
            description: scenario?.description || ""
        });

        setIsEditing(true);
    }

    async function handleUpdate() {
        if (!edits.name.trim()) {
            alert("Scenario name is required.");
            return;
        }

        if (!confirm("Are you sure you want to save changes to this scenario?")) {
            return;
        }

        try {
            const payload = {
                name: edits.name.trim(),
                description: edits.description.trim() || null
            };

            const updated = await updateScenario(id, payload);

            setScenario(updated);
            setIsEditing(false);

            refreshScenarios();
        } catch (err) {
            console.error("Failed to update scenario:", err);
            alert("Failed to update scenario.");
        }
    }

    async function handleDelete() {
        if (
            !confirm(
                "Are you sure you want to permanently delete this scenario?"
            )
        ) {
            return;
        }

        try {
            await deleteScenario(id);

            refreshScenarios();

            navigate("/scenarios", {
                replace: true
            });
        } catch (err) {
            console.error("Failed to delete scenario:", err);
            alert("Failed to delete scenario.");
        }
    }

    async function handleAddChange(data) {
        try {
            await addScenarioChange(id, data);
            setShowChangeModal(false);

            const [changesData, projectionData] = await Promise.all([
                getScenarioChanges(id),
                getScenarioProjection(id, horizon)
            ]);

            setChanges(changesData);
            setSimulatedChanges(changesData);
            setProjection(projectionData);
        } catch (err) {
            console.error("Failed to add scenario change:", err);
            alert(err.response?.data?.message || "Failed to add scenario change.");
        }
    }

    async function handleEditChange(data) {
        try {
            await updateScenarioChange(id, editingChange.scenario_changeid, data);
            setEditingChange(null);

            const [changesData, projectionData] = await Promise.all([
                getScenarioChanges(id),
                getScenarioProjection(id, horizon)
            ]);

            setChanges(changesData);
            setSimulatedChanges(changesData);
            setProjection(projectionData);
        } catch (err) {
            console.error("Failed to update scenario change:", err);
            alert(err.response?.data?.message || "Failed to update scenario change.");
        }
    }

    async function handleDeleteChange(changeId) {
        if (!confirm("Remove this change from the scenario?")) return;

        try {
            await deleteScenarioChange(id, changeId);
            const [changesData, projectionData] = await Promise.all([
                getScenarioChanges(id),
                getScenarioProjection(id, horizon)
            ]);
            setChanges(changesData);
            setSimulatedChanges(changesData);
            setProjection(projectionData);
        } catch (err) {
            console.error("Failed to delete scenario change:", err);
            alert(err.response?.data?.message || "Failed to delete scenario change.");
        }
    }

    if (loading) {
        return (
            <main className="scenario-detail-page">
                <p>Loading scenario...</p>
            </main>
        );
    }

    if (!scenario) {
        return null;
    }

    return (
        <main className="scenario-detail-page">

            <button
                className="back-btn"
                onClick={() => navigate("/scenarios", { replace: true })}
            >
                ←
            </button>

            <div
                className={`scenario-detail-card ${isEditing ? "editing-mode" : ""
                    }`}
            >

                <div className="scenario-card-header">

                    <div className="scenario-title-area">

                        {isEditing ? (
                            <>
                                <input
                                    className="inline-title-input"
                                    value={edits.name}
                                    onChange={(e) =>
                                        setEdits({
                                            ...edits,
                                            name: e.target.value
                                        })
                                    }
                                    placeholder="Scenario Name"
                                />

                                <textarea
                                    className="inline-desc-input"
                                    value={edits.description}
                                    onChange={(e) =>
                                        setEdits({
                                            ...edits,
                                            description: e.target.value
                                        })
                                    }
                                    placeholder="Add a description..."
                                />
                            </>
                        ) : (
                            <>
                                <h1>{scenario.name}</h1>

                                {scenario.description && (
                                    <p className="scenario-description">
                                        {scenario.description}
                                    </p>
                                )}
                            </>
                        )}

                    </div>

                    <div className="scenario-actions">

                        {!isEditing ? (
                            <>
                                <button
                                    className="btn-edit"
                                    onClick={startEditing}
                                >
                                    ✏️ Edit
                                </button>

                                <button
                                    className="btn-delete"
                                    onClick={handleDelete}
                                >
                                    🗑️ Delete
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className="btn-save-inline"
                                    onClick={handleUpdate}
                                >
                                    💾 Save
                                </button>

                                <button
                                    className="btn-cancel-inline"
                                    onClick={() => setIsEditing(false)}
                                >
                                    ❌ Cancel
                                </button>
                            </>
                        )}

                    </div>

                </div>

            </div>

            {/* Simulator will be added here */}

            <div className="scenario-content-panel">

                <div className="scenario-simulator-header">

                    <div>
                        <h2>What-If Simulator</h2>

                        <p>
                            Explore how changes to your future finances could
                            affect your financial trajectory.
                        </p>
                    </div>

                    <div className="scenario-simulator-actions">
                        {hasSimulatedChanges() && (
                            <button
                                className="scenario-save-changes-btn"
                                onClick={handleSaveSimulatedChanges}
                            >
                                Save changes
                            </button>
                        )}

                        <button className="add-scenario-change-btn" onClick={() => setShowChangeModal(true)}>
                            + Add change
                        </button>
                    </div>

                </div>

                <p className="scenario-projection-context">
                    Projected cumulative net flow
                </p>

                {projection?.hasData && (
                    <div className="scenario-impact-summary">
                        <div>
                            <span>Baseline</span>
                            <strong>₹{Number(projection.summary.baselineFinalCumulative).toFixed(0)}</strong>
                        </div>

                        <div>
                            <span>Scenario</span>
                            <strong>₹{Number(projection.summary.scenarioFinalCumulative).toFixed(0)}</strong>
                        </div>

                        <div>
                            <span>Impact</span>
                            <strong className={projection.summary.totalImpact >= 0 ? "positive" : "negative"}>
                                {projection.summary.totalImpact >= 0 ? "+" : ""}
                                ₹{Number(projection.summary.totalImpact).toFixed(0)}
                            </strong>
                        </div>
                    </div>
                )}

                <div className="scenario-horizon-controls">
                    <button className={horizon === 12 ? "active" : ""} onClick={() => setHorizon(12)}>1Y</button>
                    <button className={horizon === 36 ? "active" : ""} onClick={() => setHorizon(36)}>3Y</button>
                    <button className={horizon === 60 ? "active" : ""} onClick={() => setHorizon(60)}>5Y</button>
                    <button className={horizon === 120 ? "active" : ""} onClick={() => setHorizon(120)}>10Y</button>
                </div>

                {projection?.hasData ? (
                    <div className="scenario-projection-chart">
                        <h3>Financial Trajectory</h3>
                        <GenericChart labels={projectionLabels} datasets={projectionDatasets} type="line" />
                    </div>
                ) : (
                    <div className="scenario-empty-state">
                        <p>Not enough transaction history to generate a projection yet.</p>
                    </div>
                )}

                <div className="scenario-changes">
                    {changes.length === 0 ? (
                        <div className="scenario-empty-state">
                            <p>No changes have been added to this scenario yet.</p>
                        </div>
                    ) : (
                        changes.map(change => (
                            <div className="scenario-change-row" key={change.scenario_changeid}>
                                <div className="scenario-change-main">
                                    <strong>
                                        {change.target_type === "new"
                                            ? change.type === "income" ? "+ New income" : "− New expense"
                                            : change.direction === "increase"
                                                ? `↑ Increase ${change.category_name}`
                                                : `↓ Reduce ${change.category_name}`}
                                    </strong>

                                    {change.change_type === "recurring" || change.change_type === "one_time" ? (
                                        <div className="scenario-change-slider">
                                            <div className="scenario-change-amount">
                                                <span>
                                                    ₹{Number(simulatedChanges.find(item => item.scenario_changeid === change.scenario_changeid)?.amount ?? change.amount).toFixed(0)}
                                                    {change.change_type === "recurring"
                                                        ? " / month"
                                                        : " one-time"}
                                                </span>

                                                {(() => {
                                                    const simulatedChange = simulatedChanges.find(
                                                        item => item.scenario_changeid === change.scenario_changeid
                                                    );

                                                    const amountChanged =
                                                        Number(simulatedChange?.amount ?? change.amount) !== Number(change.amount);

                                                    const dateChanged =
                                                        change.change_type === "one_time" &&
                                                        (simulatedChange?.start_date?.split("T")[0] ?? change.start_date?.split("T")[0]) !==
                                                        (change.start_date?.split("T")[0] ?? "");

                                                    return amountChanged || dateChanged;
                                                })() && (
                                                        <button
                                                            className="scenario-change-reset"
                                                            onClick={() => resetSimulatedChange(change.scenario_changeid)}
                                                        >
                                                            ↻ Reset
                                                        </button>
                                                    )}
                                            </div>

                                            <input
                                                type="range"
                                                min="0"
                                                max={getSliderMax(change.amount)}
                                                step="100"
                                                value={simulatedChanges.find(item => item.scenario_changeid === change.scenario_changeid)?.amount ?? change.amount}
                                                onChange={(e) =>
                                                    updateSimulatedChange(change.scenario_changeid, {
                                                        amount: Number(e.target.value)
                                                    })
                                                }
                                            />

                                            {change.change_type === "one_time" && (
                                                <div className="scenario-change-date">
                                                    <input
                                                        type="date"
                                                        value={
                                                            simulatedChanges.find(
                                                                item => item.scenario_changeid === change.scenario_changeid
                                                            )?.start_date?.split("T")[0] ??
                                                            change.start_date?.split("T")[0] ??
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            updateSimulatedChange(
                                                                change.scenario_changeid,
                                                                {
                                                                    start_date: e.target.value
                                                                }
                                                            )
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span>
                                            ₹{Number(change.amount).toFixed(0)}
                                            {change.change_type === "recurring"
                                                ? " / month"
                                                : " one-time"}
                                        </span>
                                    )}
                                </div>

                                <div className="scenario-change-details">
                                    <span>
                                        Starts {formatScenarioDate(change.start_date)}
                                    </span>

                                    {change.end_date && (
                                        <span>
                                            Ends {formatScenarioDate(change.end_date)}
                                        </span>
                                    )}

                                    {change.description && (
                                        <span>{change.description}</span>
                                    )}
                                </div>

                                <div className="scenario-change-actions">
                                    <button onClick={() => setEditingChange(change)}>Edit</button>
                                    <button onClick={() => handleDeleteChange(change.scenario_changeid)}>Delete</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>

            {showChangeModal && (
                <ScenarioChangeModal
                    onClose={() => setShowChangeModal(false)}
                    onAdd={handleAddChange}
                />
            )}
            {editingChange && (
                <ScenarioChangeModal
                    change={editingChange}
                    onClose={() => setEditingChange(null)}
                    onAdd={handleEditChange}
                />
            )}
        </main>
    );
}