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
                setShowAddBudget(false);
                setName("");
                setDescription("");
                setTargetAmount("");
                setBudgetType("");
                setStartDate("");
                setEndDate("");
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
                    <input id="name" type="text" placeholder="Name" autoFocus value={name} onChange={e => setName(e.target.value)} />
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
                <div>Total active budgets</div>
                <div>Total target amount</div>
                <div>Overall completion</div>
                <div>Monthly planned spending</div>
            </div>
            <div className="budgets_grid">
                {budgets.length === 0 ? (
                    <p>No budgets found. Click "Add Budget" to create your first budget.</p>
                ) : (
                    budgets.map(budget => (
                        <div key={budget.budgetid} className="budget_card" onClick={() => navigate(`/budgets/${budget.budgetid}`)} >
                            <h3>{budget.name}</h3>
                            {budget.description && <p>{budget.description}</p> }
                            <p>Target: ${budget.target_amount}</p>
                            <p>Type: {budget.budget_type.charAt(0).toUpperCase() + budget.budget_type.slice(1)}</p>
                            <p>Start: {new Date(budget.start_date).toLocaleDateString()}</p>
                            <p>End: {budget.end_date ? new Date(budget.end_date).toLocaleDateString() : "N/A"}</p>
                            <p>Status: {budget.status.charAt(0).toUpperCase() + budget.status.slice(1)}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );  
}