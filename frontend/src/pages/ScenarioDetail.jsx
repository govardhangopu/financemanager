import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFinance } from "../context/FinanceContext.jsx";
import {
    addScenarioTransaction, addHypotheticalTransaction,
    getScenarioById, getScenarioTransactions,
    updateScenario, updateScenarioTransaction, updateHypotheticalTransaction,
    deleteScenario, deleteScenarioTransaction
} from "../api/scenarioApi.js";
import AddTransactionModal from "../components/AddTransactionModal.jsx";
import "../styles/ScenarioDetail.css";

export default function ScenarioDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { transactions, refreshScenarios } = useFinance();
    const [scenario, setScenario] = useState();
    const [loading, setLoading] = useState(true);
    const [scenarioTransactions, setScenarioTransactions] = useState([]);
    const [transactionsLoading, setTransactionsLoading] = useState(true);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
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

    const getTransactionKey = t => `${t.scenario_type}-${t.transactionid ?? t.hypothetical_transactionid}`;

    const scenarioTransactionIds = new Set(scenarioTransactions.filter(t => t.scenario_type === "real").map(t => t.transactionid));
    const availableTransactions = transactions.filter(t => !scenarioTransactionIds.has(t.transactionid));

    async function handleAddExisting(transaction, scenarioAmount) {
        try {
            const amountOffset = scenarioAmount - Number(transaction.amount);
            await addScenarioTransaction(id, {
                transactionid: transaction.transactionid,
                amount_offset: amountOffset
            });
            await refreshScenarioTransactions();
            setShowAddModal(false);
        } catch (err) {
            console.error("Failed to add transaction:", err);
            alert("Failed to add transaction.");
        }
    }

    const handleAddHypothetical = async (hypotheticalData) => {
        try {
            await addHypotheticalTransaction(id, hypotheticalData);
            await refreshScenarioTransactions();
            setShowAddModal(false);
        } catch (err) {
            console.error("Failed to add hypothetical transaction:", err);
            alert(err.response?.data?.message || "Failed to add hypothetical transaction.");
        }
    };

    async function handleUpdateTransaction(transaction, scenarioAmount) {
        try {
            const amount_offset = Number(scenarioAmount) - Number(transaction.original_amount);
            await updateScenarioTransaction(id, transaction.transactionid, { amount_offset });
            await refreshScenarioTransactions();
        } catch (err) {
            console.error("Failed to update scenario transaction:", err);
            alert(err.response?.data?.message || "Failed to update transaction.");
        }
    }

    async function handleUpdateHypothetical(transaction, data) {
        try {
            await updateHypotheticalTransaction(id, transaction.hypothetical_transactionid, data);
            await refreshScenarioTransactions();
            setShowAddModal(false);
            setEditingTransaction(null);
        } catch (err) {
            console.error("Failed to update hypothetical transaction:", err);
            alert(err.response?.data?.message || "Failed to update hypothetical transaction.");
        }
    }

    async function handleDeleteTransaction(transaction) {
        if (!confirm("Remove this transaction from the scenario?")) return;
        try {
            if (transaction.scenario_type === "real") {
                await deleteScenarioTransaction(id, transaction.transactionid);
            } else {
                await deleteHypotheticalTransaction(id, transaction.hypothetical_transactionid);
            }
            await refreshScenarioTransactions();
        } catch (err) {
            console.error("Failed to remove scenario transaction:", err);
            alert(err.response?.data?.message || "Failed to remove transaction.");
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
                    <button className="add-scenario-transaction-btn" onClick={() => setShowAddModal(true)}>
                        + Add Transaction
                    </button>
                </div>

                {showAddModal && (
                    <AddTransactionModal
                        availableTransactions={availableTransactions}
                        onClose={() => { setShowAddModal(false); setEditingTransaction(null); }}
                        onAddExisting={handleAddExisting}
                        onAddHypothetical={handleAddHypothetical}
                        editingTransaction={editingTransaction}
                        onUpdateExisting={handleUpdateTransaction}
                        onUpdateHypothetical={handleUpdateHypothetical}
                    />
                )}

                <div className="scenario-transactions">
                    {transactionsLoading ? <p>Loading transactions...</p> :
                        !scenarioTransactions.length ? <div className="scenario-empty-state"><p>No scenario transactions yet.</p></div> :
                            scenarioTransactions.map(t => (
                                <div className={`scenario-transaction-row ${t.type}`} key={getTransactionKey(t)}>
                                    <div className="scenario-transaction-main">
                                        <strong>{t.category_name || "Uncategorized"}</strong>
                                        <span>{new Date(t.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="scenario-transaction-details">
                                        <strong>₹{t.amount}</strong>
                                        <span className="scenario-transaction-offset">
                                            {t.scenario_type === "real"
                                                ? `Original: ₹${t.original_amount} · Offset: ₹${t.amount_offset}`
                                                : "No original transaction"}
                                        </span>
                                    </div>
                                    <div className="scenario-transaction-type">
                                        <small>
                                            {t.scenario_type === "real" ? "Real" : "Hypothetical"}
                                        </small>
                                    </div>
                                    <div className="scenario-transaction-actions">
                                        <button onClick={() => { setEditingTransaction(t); setShowAddModal(true); }}>✏️</button>
                                        <button onClick={() => handleDeleteTransaction(t)}>🗑️</button>
                                    </div>
                                </div>
                            ))}
                </div>
            </div>
        </main>

    );
}