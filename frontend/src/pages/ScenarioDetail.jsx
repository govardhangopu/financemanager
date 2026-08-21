import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFinance } from "../context/FinanceContext.jsx";
import {
    addScenarioTransaction, addHypotheticalTransaction,
    getScenarioById, getScenarioTransactions, getScenarioSummary, getSimulatedScenarioTransactions,
    updateScenario, updateScenarioTransaction, updateHypotheticalTransaction,
    deleteScenario, deleteScenarioTransaction
} from "../api/scenarioApi.js";
import AddTransactionModal from "../components/AddTransactionModal.jsx";
import { GenericChart } from "../components/dashboard/GenericChart.jsx";
import { buildScenarioTimeline } from "../utils/buildScenarioTimeline.js";
import "../styles/ScenarioDetail.css";

export default function ScenarioDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { transactions, refreshScenarios, totalIncome, totalExpense, netWorth } = useFinance();
    const [scenario, setScenario] = useState();
    const [loading, setLoading] = useState(true);
    const [scenarioTransactions, setScenarioTransactions] = useState([]);
    const [scenarioSummary, setScenarioSummary] = useState({ income: 0, expense: 0, net: 0 });
    const [simulatedTransactions, setSimulatedTransactions] = useState([]);
    const incomeChange = Number(scenarioSummary.income) - totalIncome;
    const expenseChange = Number(scenarioSummary.expense) - totalExpense;
    const netChange = Number(scenarioSummary.net) - netWorth;
    const comparisonLabels = ["Income", "Expenses", "Net"];
    const comparisonDatasets = [
        {
            label: "Actual",
            data: [
                Number(totalIncome),
                Number(totalExpense),
                Number(netWorth)
            ],
            backgroundColor: "#6b7280",
            borderColor: "#6b7280",
        },
        {
            label: "Scenario",
            data: [
                Number(scenarioSummary.income),
                Number(scenarioSummary.expense),
                Number(scenarioSummary.net)
            ],
            backgroundColor: "#3b82f6",
            borderColor: "#3b82f6",
        }
    ];

    const { labels: timelineLabels, actualData, scenarioData } = buildScenarioTimeline(simulatedTransactions);
    const timelineDatasets = [
        {
            label: "Actual",
            data: actualData,
            borderColor: "#6b7280",
            backgroundColor: "#6b7280",
        },
        {
            label: "Scenario",
            data: scenarioData,
            borderColor: "#3b82f6",
            backgroundColor: "#3b82f6",
        }
    ];

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
            const [transactionsData, summaryData, simulatedData] = await Promise.all([
                getScenarioTransactions(id),
                getScenarioSummary(id),
                getSimulatedScenarioTransactions(id)
            ]);
            setScenarioTransactions(transactionsData);
            setScenarioSummary(summaryData);
            setSimulatedTransactions(simulatedData);
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
                        <h2>Scenario Changes</h2>
                        <p>Transactions modified or added by this scenario.</p>
                    </div>
                    <button className="add-scenario-transaction-btn" onClick={() => setShowAddModal(true)}>
                        + Add Transaction
                    </button>
                </div>

                <div className="scenario-comparison">
                    <div className="scenario-comparison-header">
                        <span></span>
                        <span>Actual</span>
                        <span>Scenario</span>
                        <span>Change</span>
                    </div>

                    <div className="scenario-comparison-row">
                        <strong>Income</strong>
                        <span>₹{Number(totalIncome).toFixed(2)}</span>
                        <span>₹{Number(scenarioSummary.income).toFixed(2)}</span>
                        <span className={incomeChange > 0 ? "positive" : incomeChange < 0 ? "negative" : ""}>
                            {incomeChange > 0 ? "+" : ""}₹{incomeChange.toFixed(2)}
                        </span>
                    </div>

                    <div className="scenario-comparison-row">
                        <strong>Expenses</strong>
                        <span>₹{Number(totalExpense).toFixed(2)}</span>
                        <span>₹{Number(scenarioSummary.expense).toFixed(2)}</span>
                        <span className={expenseChange > 0 ? "positive" : expenseChange < 0 ? "negative" : ""}>
                            {expenseChange > 0 ? "+" : ""}₹{expenseChange.toFixed(2)}
                        </span>
                    </div>

                    <div className="scenario-comparison-row">
                        <strong>Net</strong>
                        <span>₹{Number(netWorth).toFixed(2)}</span>
                        <span>₹{Number(scenarioSummary.net).toFixed(2)}</span>
                        <span className={netChange > 0 ? "positive" : netChange < 0 ? "negative" : ""}>
                            {netChange > 0 ? "+" : ""}₹{netChange.toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="scenario-comparison-chart">
                    <h3>Actual vs Scenario</h3>
                    <GenericChart labels={comparisonLabels} datasets={comparisonDatasets} type="bar" />
                </div>

                <div className="scenario-timeline-chart">
                    <h3>Financial Trajectory</h3>
                    <GenericChart labels={timelineLabels} datasets={timelineDatasets} type="line" />
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