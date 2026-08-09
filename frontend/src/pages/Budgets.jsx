import { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { addBudget } from "../api/budgetsApi";
import { useNavigate } from "react-router-dom";
import "../styles/Budgets.css"

export default function Budgets() {
    const navigate = useNavigate();
    const { budgets, refreshBudgets, budgetsLoading } = useFinance();
    const [showAddBudget, setShowAddBudget] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [budgetType, setBudgetType] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [errors, setErrors] = useState({ name: "", target: "", type: "", start: "", end: "" });
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const todayStr = new Date().toISOString().split("T")[0];

    // Filter active budgets: status is active and end date is in the future (or not set)
    const activeBudgets = budgets.filter(b => 
        b.status === "active" && 
        (!b.end_date || b.end_date >= todayStr)
    );

    // Filter expired budgets: status is active but end date is in the past
    const expiredBudgets = budgets.filter(b => 
        b.status === "active" && 
        b.end_date && b.end_date < todayStr
    );

    const totalTarget = activeBudgets.reduce((sum, b) => sum + parseFloat(b.target_amount || 0), 0);
    const totalSpent = activeBudgets.reduce((sum, b) => sum + parseFloat(b.spent_amount || 0), 0);
    const monthlyPlanned = activeBudgets.reduce((sum, b) => {
        const amount = parseFloat(b.target_amount || 0);
        if (b.budget_type === 'monthly') return sum + amount;
        if (b.budget_type === 'yearly') return sum + (amount / 12);
        if (b.budget_type === 'weekly') return sum + (amount * 4.33);
        return sum;
    }, 0);

    function handleCreate() {
        let newErrors = {};
        if (!name) newErrors.name = "Budget name is required.";
        if (!targetAmount || parseFloat(targetAmount) <= 0) newErrors.target = "Target amount must be a positive number.";
        if (!budgetType) newErrors.type = "Please select a budget type.";
        if (!startDate) newErrors.start = "Please select a start date.";
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            newErrors.start = "Start date cannot be after end date.";
            newErrors.end = "End date cannot be before start date.";
        }
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        const newBudget = {
            name: name.trim(),
            description: description.trim(),
            target_amount: parseFloat(targetAmount),
            budget_type: budgetType,
            start_date: startDate,
            end_date: endDate,
            status: "active"
        };

        //console.log("New budget data:", newBudget);
        addBudget(newBudget)
            .then((res) => {
                //console.log("Budget created successfully:", res);
                refreshBudgets();
                setName("");
                setDescription("");
                setTargetAmount("");
                setBudgetType("");
                setStartDate("");
                setEndDate("");
                if (res && res.insertId) {
                    navigate(`/budgets/${res.insertId}`);
                }
            })
            .catch((err) => {
                console.error("Error creating budget:", err);
            });
    }

    return (
        <div className="budgets_page">
            <h1 className="page-title">Budgets</h1>
            <button className={!showAddBudget ? "open" : "close"} onClick={() => setShowAddBudget(true)}>Add Budget</button>

            <div className={showAddBudget ? "open" : "close"} id="addBudget">
                <h2>Create New Budget</h2>
                <label htmlFor="name">Budget Name:</label>
                <div className="field1">
                    <input id="name" type="text" placeholder="Name" autoFocus={showAddBudget ? true : false} value={name} onChange={e => setName(e.target.value)} />
                    <div className="errmsg">{errors.name}</div>
                </div>

                <label htmlFor="description">Description (optional) :</label>
                <div className="field1">
                    <textarea placeholder="Description" id="description" value={description} onInput={e => setDescription(e.target.value)}
                        onChange={(e) => {
                            e.target.style.height = "auto";
                            e.target.style.height = `${e.target.scrollHeight}px`;
                        }}>
                    </textarea>
                    <div className="errmsg">{errors.description}</div>
                </div>
                <div className="section">
                    <div className="field2">
                        <div>
                            <label htmlFor="amount">Target Amount:</label>
                            <input id="amount" type="number" placeholder="Target Amount" value={targetAmount}
                                onChange={e => setTargetAmount(e.target.value)} />
                        </div>
                        <div className="errmsg">{errors.target}</div>
                    </div>
                    <div className="field2">
                        <div>
                            <label htmlFor="budget_type">Budget Type</label>
                            <select id="budget_type" value={budgetType} onChange={e => setBudgetType(e.target.value)}>
                                <option value="">--Select Type--</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                                <option value="one_time">One-time</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="errmsg">{errors.type}</div>
                    </div>
                </div>
                <div className="section">
                    <div className="field2">
                        <div>
                            <label htmlFor="start_date">Start Date:</label>
                            <input id="start_date" type="date" placeholder="Start Date" value={startDate}
                                onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div className="errmsg">{errors.start}</div>
                    </div>
                    <div className="field2">
                        <div>
                            <label htmlFor="end_date">End Date (optional) :</label>
                            <input id="end_date" type="date" placeholder="End Date" /*min={startDate}*/ value={endDate}
                                onChange={e => setEndDate(e.target.value)} />
                        </div>
                        <div className="errmsg">{errors.end}</div>
                    </div>
                </div>
                <button onClick={() => setShowAddBudget(false)}>Cancel</button>
                <button onClick={() => handleCreate()}>Create</button>
            </div>

            <div className="budget_summary">
                <div className="summary_item">
                    <span className="summary_label">Total Active Budgets: </span>
                    <span className="summary_value">{activeBudgets.length}</span>
                </div>
                <div className="summary_item">
                    <span className="summary_label">Total Target Limit: </span>
                    <span className="summary_value">₹{totalTarget.toLocaleString()}</span>
                </div>
                <div className="summary_item">
                    <span className="summary_label">Overall Completion: </span>
                    <span className="summary_value">
                        {totalTarget > 0 ? ((totalSpent / totalTarget) * 100).toFixed(1) : "0.0"}%
                    </span>
                </div>
                <div className="summary_item">
                    <span className="summary_label">Monthly Planned Spending: </span>
                    <span className="summary_value">
                        ₹{monthlyPlanned.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                </div>
            </div>

            <h2 className="section-title">Active Budgets</h2>
            <div className="budgets_grid">
                {activeBudgets.length === 0 ? (
                    <p>No active budgets found. Click "Add Budget" to create your first budget.</p>
                ) : (
                    activeBudgets.map(budget => (
                        <div key={budget.budgetid} className="budget_card" onClick={() => navigate(`/budgets/${budget.budgetid}`)} >
                            <h3>{budget.name}</h3>
                            {budget.description && <p>{budget.description}</p>}
                            <p>Target: ₹{parseFloat(budget.target_amount).toLocaleString()}</p>
                            <p>Type: {budget.budget_type.charAt(0).toUpperCase() + budget.budget_type.slice(1)}</p>
                            <p>Start: {new Date(budget.start_date).toLocaleDateString()}</p>
                            <p>End: {budget.end_date ? new Date(budget.end_date).toLocaleDateString() : "N/A"}</p>
                        </div>
                    ))
                )}
            </div>

            {expiredBudgets.length > 0 && (
                <>
                    <h2 className="section-title">Past Budgets</h2>
                    <div className="budgets_grid">
                        {expiredBudgets.map(budget => (
                            <div key={budget.budgetid} className="budget_card expired" onClick={() => navigate(`/budgets/${budget.budgetid}`)} >
                                <h3>{budget.name}</h3>
                                {budget.description && <p>{budget.description}</p>}
                                <p>Target: ₹{parseFloat(budget.target_amount).toLocaleString()}</p>
                                <p>Type: {budget.budget_type.charAt(0).toUpperCase() + budget.budget_type.slice(1)}</p>
                                <p>Start: {new Date(budget.start_date).toLocaleDateString()}</p>
                                <p>End: {new Date(budget.end_date).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}