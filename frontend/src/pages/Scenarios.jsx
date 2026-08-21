import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFinance } from "../context/FinanceContext";
import { addScenario } from "../api/scenarioApi.js";
import "../styles/Scenarios.css";

export default function Scenarios() {
    const navigate = useNavigate();
    const { scenarios, refreshScenarios, scenariosLoading } = useFinance();

    const [showAddScenario, setShowAddScenario] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState({ name: "", description: "" });

    function handleCreate() {
        const newErrors = {};

        if (!name.trim()) {
            newErrors.name = "Scenario name is required.";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        const newScenario = {
            name: name.trim(),
            description: description.trim(),
        };

        addScenario(newScenario)
            .then((res) => {
                refreshScenarios();

                setName("");
                setDescription("");
                setErrors({ name: "", description: "" });
                setShowAddScenario(false);

                if (res && res.insertId) {
                    navigate(`/scenarios/${res.insertId}`);
                }
            })
            .catch((err) => {
                console.error("Error creating scenario:", err);
            });
    }

    function handleCloseCreate() {
        setShowAddScenario(false);
        setErrors({ name: "", description: "" });
    }

    return (
        <div className="scenarios-page">

            {/* =========================
                Page Header
                ========================= */}

            <div className="scenarios-header">
                <div>
                    <h1>Scenarios</h1>
                    <p>
                        Explore "what if?" possibilities without changing
                        your actual finances.
                    </p>
                </div>

                {!showAddScenario && (
                    <button
                        className="scenario-create-btn"
                        onClick={() => setShowAddScenario(true)}
                    >
                        + Create Scenario
                    </button>
                )}
            </div>

            <div className="scenario-discovery">
                <h2>What can you do with a scenario?</h2>

                <div className="scenario-discovery-grid">
                    <div className="scenario-discovery-item">
                        <h3>Adjust existing transactions</h3>
                        <p>
                            See what happens if a transaction is higher, lower,
                            or removed without changing your actual transaction.
                        </p>
                    </div>

                    <div className="scenario-discovery-item">
                        <h3>Add hypothetical transactions</h3>
                        <p>
                            Explore future income or expenses that haven't
                            happened yet.
                        </p>
                    </div>

                    <div className="scenario-discovery-item">
                        <h3>Compare the results</h3>
                        <p>
                            See how your scenario changes your income,
                            expenses, and net position.
                        </p>
                    </div>
                </div>
            </div>

            {/* =========================
                Create Scenario
                ========================= */}

            {showAddScenario && (
                <div className="scenario-create-panel">

                    <h2>Create New Scenario</h2>

                    <p className="scenario-form-description">
                        Give your scenario a name and describe what you're
                        exploring.
                    </p>

                    <div className="scenario-form-field">
                        <label htmlFor="scenario-name">
                            Scenario Name
                        </label>

                        <input
                            id="scenario-name"
                            type="text"
                            placeholder="e.g. Summer Vacation"
                            autoFocus
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />

                        {errors.name && (
                            <div className="scenario-error">
                                {errors.name}
                            </div>
                        )}
                    </div>

                    <div className="scenario-form-field">
                        <label htmlFor="scenario-description">
                            Description
                        </label>

                        <textarea
                            id="scenario-description"
                            placeholder="e.g. What if I spend ₹50,000 on a vacation this year?"
                            value={description}
                            onChange={(e) => {
                                setDescription(e.target.value);

                                e.target.style.height = "auto";
                                e.target.style.height =
                                    `${e.target.scrollHeight}px`;
                            }}
                        />

                        {errors.description && (
                            <div className="scenario-error">
                                {errors.description}
                            </div>
                        )}
                    </div>

                    <div className="scenario-create-actions">
                        <button
                            className="scenario-cancel-btn"
                            onClick={handleCloseCreate}
                        >
                            Cancel
                        </button>

                        <button
                            className="scenario-submit-btn"
                            onClick={handleCreate}
                        >
                            Create Scenario
                        </button>
                    </div>
                </div>
            )}

            {/* =========================
                Scenario List
                ========================= */}

            <section className="scenarios-section">

                <h2 className="scenarios-section-title">
                    Your Scenarios
                </h2>

                {scenariosLoading ? (
                    <div className="scenario-list-state">
                        Loading scenarios...
                    </div>
                ) : scenarios.length === 0 ? (

                    <div className="scenario-empty-state">

                        <h3>No scenarios yet</h3>

                        <p>
                            Scenarios let you explore "what if?"
                            situations without changing your
                            actual transactions.
                        </p>

                        <p>
                            Modify existing transactions, add
                            hypothetical ones, and compare the
                            result with your current finances.
                        </p>

                        {!showAddScenario && (
                            <button
                                className="scenario-empty-btn"
                                onClick={() => setShowAddScenario(true)}
                            >
                                + Create Your First Scenario
                            </button>
                        )}

                    </div>

                ) : (

                    <div className="scenarios-grid">

                        {scenarios.map(scenario => (

                            <div
                                key={scenario.scenarioid}
                                className="scenario-card"
                                onClick={() =>
                                    navigate(`/scenarios/${scenario.scenarioid}`)
                                }
                            >
                                <h3>{scenario.name}</h3>

                                {scenario.description && (
                                    <p>{scenario.description}</p>
                                )}

                                <span className="scenario-card-link">
                                    View Scenario →
                                </span>
                            </div>

                        ))}

                    </div>
                )}
            </section>
        </div>
    );
}