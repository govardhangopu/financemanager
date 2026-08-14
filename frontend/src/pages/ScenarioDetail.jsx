import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFinance } from "../context/FinanceContext.jsx";
import { getScenarioById, getScenarioTransactions, updateScenario, deleteScenario } from "../api/scenarioApi.js";

export default function ScenarioDetail () {
    const { id } = useParams();
    const navigate = useNavigate();
    const [scenario, setScenario] = useState();
    const [loading, setLoading] = useState(true);
    const [scenarioTransactions, setScenarioTransactions] = useState([]);
    const [transactionsLoading, setTransactionsLoading] = useState(true);
    const { refreshScenarios } = useFinance();
    const [isEditing, setIsEditing] = useState(false);

    const [edits, setEdits] = useState({ name: "", description: "" });

    useEffect(() => {
        setLoading(true);
        getScenarioById(id)
        .then(res => setScenario(res))
        .catch(err => {
            console.error(err);
            alert(err);
            navigate("/scenarios", { replace: true });
        })
        .finally(() => setLoading(false));
        refreshScenarioTransactions();
    }, [id])

    async function refreshScenarioTransactions() {
        if (!id) return;
        setTransactionsLoading(true);
        try {
            const data = await getScenarioTransactions(id);
            setScenarioTransactions(data);
        } catch (err) {
            console.error("Failed to load scenario transactions:", err);
        } finally {
            setTransactionsLoading(false);
        }
    }

    async function handleUpdate() {
        if (!confirm("Are you sure you want to save changes to this scenario?")) return;
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
        if (!confirm("Are you sure you want to permanently delete this scenario?")) return;
        try {
            const updated = await deleteScenario(id);
            setScenario(updated);
            refreshScenarios();
            alert("Scenario deleted successfully!");
            navigate("/scenarios", { replace: true });
        } catch (err) {
            console.error("Failed to delete scenario:", err);
            alert("Failed to delete scenario.");
        }
    }

    return (
        <main className="scenario-detail-page">
            <button className="back-btn" onClick={() => navigate("/scenarios", { replace: true })}>←</button>

            <div className={`scenario-detail-card ${isEditing ? "editing-mode" : ""}`}>
                <div className="scenario-card-header">
                    <div className="scenario-title-area">
                        {isEditing ? (
                            <>
                                <input className="inline-title-input" value={edits.name} onChange={(e) => setEdits({ ...edits, name: e.target.value })} placeholder="Scenario Name" />
                                <textarea className="inline-desc-input" value={edits.description} onChange={(e) => setEdits({ ...edits, description: e.target.value })} placeholder="Add a description..." />
                            </>
                        ) : (
                            <>
                                <h1>{loading ? "Loading..." : scenario?.name}</h1>
                                {!loading && scenario?.description && <p className="scenario-description">{scenario.description}</p>}
                            </>
                        )}
                    </div>

                    <div className="scenario-actions">
                        {!loading && (!isEditing ? (
                            <>
                                <button className="btn-edit" onClick={() => {
                                    setEdits({
                                        name: scenario.name,
                                        description: scenario.description || ""
                                    });

                                    setIsEditing(true);
                                }}>✏️ Edit</button>
                                <button className="btn-delete" onClick={handleDelete}>🗑️ Delete</button>
                            </>
                        ) : (
                            <>
                                <button className="btn-save-inline" onClick={handleUpdate}>💾 Save</button>
                                <button className="btn-cancel-inline" onClick={() => setIsEditing(false)}>❌ Cancel</button>
                            </>
                        ))}
                    </div>
                </div>
            </div>

            <div className="scenario-content-panel">
                <div className="scenario-panel-header">
                    <div>
                        <h2>Scenario Transactions</h2>
                        <p>Transactions that exist only within this scenario.</p>
                    </div>
                    <button className="add-scenario-transaction-btn" disabled>+ Add Transaction</button>
                </div>

                <div className="scenario-transactions">
                    {transactionsLoading ? (
                        <p>Loading transactions...</p>
                    ) : scenarioTransactions.length === 0 ? (
                        <div className="scenario-empty-state">
                            <p>No scenario transactions yet.</p>
                        </div>
                    ) : (
                        scenarioTransactions.map(transaction => (
                            <div className="scenario-transaction-row" key={transaction.transactionid}>
                                <div>
                                    <strong>{transaction.category_name || "Uncategorized"}</strong>
                                    <span>{new Date(transaction.date).toLocaleDateString()}</span>
                                </div>

                                <div>
                                    <span>Offset: ₹{transaction.amount_offset}</span>
                                    <strong>₹{transaction.amount}</strong>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}