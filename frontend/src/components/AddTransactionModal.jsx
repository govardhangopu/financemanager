import { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import "./AddTransactionModal.css";

export default function AddTransactionModal({ availableTransactions, onClose, onAddExisting, onAddHypothetical }) {
    const [step, setStep] = useState("menu"); // menu, existing, confirm, hypothetical
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [scenarioAmount, setScenarioAmount] = useState("");
    const { categories, categoriesLoading } = useFinance();

    const [hypotheticalAmount, setHypotheticalAmount] = useState("");
    const [hypotheticalDate, setHypotheticalDate] = useState(new Date().toISOString().split("T")[0]);
    const [hypotheticalCategory, setHypotheticalCategory] = useState("");

    const parents = categories.filter(c => c.parent_categoryid === null);
    const sortedCategories = [];

    parents.forEach(parent => {
        sortedCategories.push({ ...parent, isChild: false });
        categories.filter(c => c.parent_categoryid === parent.categoryid)
            .forEach(child => sortedCategories.push({ ...child, isChild: true }));
    });

    const handleSelectExisting = (transaction) => {
        setSelectedTransaction(transaction);
        setStep("confirm");
    };

    const handleConfirmExisting = async () => {
        if (!scenarioAmount) {
            alert("Please enter a scenario amount");
            return;
        }
        try {
            await onAddExisting(selectedTransaction, Number(scenarioAmount));
            resetModal();
        } catch (err) {
            console.error("Failed to add transaction:", err);
            alert("Failed to add transaction");
        }
    };

    const resetModal = () => {
        setSelectedTransaction(null);
        setScenarioAmount("");
        setStep("menu");
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Add Transaction to Scenario</h3>
                    <button className="modal-close" onClick={resetModal}>✕</button>
                </div>

                {step === "menu" && (
                    <div className="modal-body">
                        <p className="modal-description">Choose how to add a transaction:</p>
                        <button className="modal-action-btn" onClick={() => setStep("existing")}>
                            📋 Existing Transaction
                        </button>
                        <button className="modal-action-btn" onClick={() => setStep("hypothetical")}>
                            ✨ Hypothetical Transaction
                        </button>
                    </div>
                )}

                {step === "existing" && !selectedTransaction && (
                    <div className="modal-body">
                        <p className="modal-description">Select a transaction:</p>
                        {availableTransactions.length === 0 ? (
                            <p className="modal-empty">No available transactions</p>
                        ) : (
                            <div className="transaction-list">
                                {availableTransactions.map(t => (
                                    <button
                                        key={t.transactionid}
                                        className="transaction-item"
                                        onClick={() => handleSelectExisting(t)}
                                    >
                                        <div className="transaction-info">
                                            <span className="transaction-category">{t.category_name || "Uncategorized"}</span>
                                            <span className="transaction-date">{new Date(t.date).toLocaleDateString()}</span>
                                        </div>
                                        <span className="transaction-amount">₹{t.amount}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {step === "confirm" && selectedTransaction && (
                    <div className="modal-body">
                        <div className="form-section">
                            <label>Transaction</label>
                            <p className="form-value">{selectedTransaction.category_name || "Uncategorized"}</p>

                            <label>Actual Amount</label>
                            <p className="form-value">₹{selectedTransaction.amount}</p>

                            <label htmlFor="scenario-amount">Scenario Amount</label>
                            <input
                                id="scenario-amount"
                                type="number"
                                value={scenarioAmount}
                                onChange={e => setScenarioAmount(e.target.value)}
                                placeholder="Enter scenario amount"
                                step="0.01"
                            />

                            {scenarioAmount && (
                                <div className="offset-display">
                                    <span>Offset:</span>
                                    <strong className={Number(scenarioAmount) > Number(selectedTransaction.amount) ? "positive" : "negative"}>
                                        ₹{(Number(scenarioAmount) - Number(selectedTransaction.amount)).toFixed(2)}
                                    </strong>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === "hypothetical" && (
                    <div className="modal-body">
                        <div className="form-section">
                            <label htmlFor="hypothetical-amount">Amount</label>
                            <input
                                id="hypothetical-amount"
                                type="number"
                                value={hypotheticalAmount}
                                onChange={e => setHypotheticalAmount(e.target.value)}
                                placeholder="Enter amount"
                                step="0.01"
                            />

                            <label htmlFor="hypothetical-date">Date</label>
                            <input
                                id="hypothetical-date"
                                type="date"
                                value={hypotheticalDate}
                                onChange={e => setHypotheticalDate(e.target.value)}
                            />

                            <label htmlFor="hypothetical-category">Category</label>
                            <select
                                id="hypothetical-category"
                                value={hypotheticalCategory}
                                onChange={e => setHypotheticalCategory(e.target.value)}
                            >
                                <option value="">Select a category</option>
                                {categoriesLoading ? <option>Loading categories...</option> :
                                    sortedCategories.map(c => (
                                        <option key={c.categoryid} value={c.categoryid}>
                                            {c.isChild ? `↳ ${c.name}` : c.name}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                )}

                <div className="modal-footer">
                    {step !== "menu" && (
                        <button className="btn-secondary" onClick={() => setStep("menu")}>
                            ← Back
                        </button>
                    )}
                    {step === "confirm" && (
                        <button className="btn-primary" onClick={handleConfirmExisting}>
                            Add to Scenario
                        </button>
                    )}
                    {step === "hypothetical" && (
                        <button
                            className="btn-primary"
                            onClick={() => onAddHypothetical({
                                amount: Number(hypotheticalAmount),
                                categoryid: Number(hypotheticalCategory),
                                is_partial: 0,
                                date: hypotheticalDate
                            })}
                        >
                            Add to Scenario
                        </button>
                    )}
                    <button className="btn-tertiary" onClick={resetModal}>
                        {step === "menu" ? "Close" : "Cancel"}
                    </button>
                </div>
            </div>
        </div>
    );
}
