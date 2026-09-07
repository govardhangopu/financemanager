import { useEffect, useState } from "react";
import { useFinance } from "../context/FinanceContext.jsx";
import "./ScenarioChangeModal.css";

export default function ScenarioChangeModal({ onClose, onAdd, change = null }) {
    const { categories, categoriesLoading } = useFinance();

    const [changeType, setChangeType] = useState("recurring");
    const [targetType, setTargetType] = useState("category");
    const [categoryId, setCategoryId] = useState("");
    const [type, setType] = useState("expense");
    const [direction, setDirection] = useState("decrease");
    const [amount, setAmount] = useState("");
    const [frequency, setFrequency] = useState("monthly");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [description, setDescription] = useState("");

    const parents = categories.filter(c => c.parent_categoryid === null);
    const sortedCategories = [];

    parents.forEach(parent => {
        sortedCategories.push({ ...parent, isChild: false });
        categories.filter(c => c.parent_categoryid === parent.categoryid)
            .forEach(child => sortedCategories.push({ ...child, isChild: true }));
    });

    useEffect(() => {
        if (!change) return;

        setChangeType(change.change_type);
        setTargetType(change.target_type);
        setCategoryId(change.categoryid || "");
        setType(change.type || "expense");
        setDirection(change.direction || "decrease");
        setAmount(change.amount || "");
        setFrequency(change.frequency || "monthly");
        setStartDate(change.start_date ? change.start_date.split("T")[0] : "");
        setEndDate(change.end_date ? change.end_date.split("T")[0] : "");
        setDescription(change.description || "");
    }, [change]);

    function handleSubmit(e) {
        e.preventDefault();

        const numericAmount = Number(amount);

        if (!amount || !Number.isFinite(numericAmount) || numericAmount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        if (!startDate) {
            alert("Please select a start date.");
            return;
        }

        if ((targetType === "category" || targetType === "pattern") && !categoryId) {
            alert("Please select a category.");
            return;
        }

        if (changeType === "recurring" && !frequency) {
            alert("Please select a frequency.");
            return;
        }

        if (endDate && endDate < startDate) {
            alert("End date cannot be before the start date.");
            return;
        }

        const data = {
            change_type: changeType,
            target_type: targetType,
            categoryid: targetType === "new" ? null : Number(categoryId),
            type: targetType === "new" ? type : null,
            direction: targetType === "new" ? "increase" : direction,
            amount: numericAmount,
            frequency: changeType === "recurring" ? frequency : null,
            start_date: startDate,
            end_date: changeType === "recurring" && endDate ? endDate : null,
            description: description.trim() || null
        };

        onAdd(data);
    }

    return (
        <div className="scenario-change-modal-overlay">
            <div className="scenario-change-modal-content">

                <div className="scenario-change-modal-header">
                    <h3>{change ? "Edit Scenario Change" : "Add Scenario Change"}</h3>
                    <button className="scenario-change-modal-close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="scenario-change-modal-body">

                        <div className="form-section">

                            <label htmlFor="change-target">What do you want to change?</label>
                            <select
                                id="change-target"
                                value={targetType}
                                onChange={e => setTargetType(e.target.value)}
                            >
                                <option value="category">Existing category</option>
                                <option value="pattern">Existing recurring pattern</option>
                                <option value="new">New flow</option>
                            </select>

                            {targetType !== "new" && (
                                <>
                                    <label htmlFor="change-category">Category</label>
                                    <select
                                        id="change-category"
                                        value={categoryId}
                                        onChange={e => setCategoryId(e.target.value)}
                                    >
                                        <option value="">Select a category</option>
                                        {categoriesLoading ? (
                                            <option>Loading categories...</option>
                                        ) : (
                                            sortedCategories.map(c => (
                                                <option key={c.categoryid} value={c.categoryid}>
                                                    {c.isChild ? `↳ ${c.name}` : c.name}
                                                </option>
                                            ))
                                        )}
                                    </select>

                                    <label htmlFor="change-direction">Direction</label>
                                    <select
                                        id="change-direction"
                                        value={direction}
                                        onChange={e => setDirection(e.target.value)}
                                    >
                                        <option value="increase">Increase</option>
                                        <option value="decrease">Decrease</option>
                                    </select>
                                </>
                            )}

                            {targetType === "new" && (
                                <>
                                    <label htmlFor="change-type">Type</label>
                                    <select
                                        id="change-type"
                                        value={type}
                                        onChange={e => setType(e.target.value)}
                                    >
                                        <option value="expense">Expense</option>
                                        <option value="income">Income</option>
                                    </select>

                                    <label htmlFor="change-frequency-type">Flow type</label>
                                    <select
                                        id="change-frequency-type"
                                        value={changeType}
                                        onChange={e => setChangeType(e.target.value)}
                                    >
                                        <option value="recurring">Recurring</option>
                                        <option value="one_time">One-time</option>
                                    </select>
                                </>
                            )}

                            <label htmlFor="change-amount">Amount</label>
                            <input
                                id="change-amount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="Enter amount"
                            />

                            {changeType === "recurring" && (
                                <>
                                    <label htmlFor="change-frequency">Frequency</label>
                                    <select
                                        id="change-frequency"
                                        value={frequency}
                                        onChange={e => setFrequency(e.target.value)}
                                    >
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </>
                            )}

                            <label htmlFor="change-start-date">
                                {changeType === "one_time" ? "Date" : "Start date"}
                            </label>
                            <input
                                id="change-start-date"
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            />

                            {changeType === "recurring" && (
                                <>
                                    <label htmlFor="change-end-date">End date (optional)</label>
                                    <input
                                        id="change-end-date"
                                        type="date"
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                    />
                                </>
                            )}

                            <label htmlFor="change-description">Description (optional)</label>
                            <input
                                id="change-description"
                                type="text"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Describe this change"
                            />

                        </div>

                    </div>

                    <div className="scenario-change-modal-footer">
                        <button type="button" className="btn-tertiary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            {change ? "Save Changes" : "Add Change"}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
}