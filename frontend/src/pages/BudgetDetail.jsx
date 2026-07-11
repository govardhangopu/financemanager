import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFinance } from "../context/FinanceContext";
import {
    getBudgetById, getBudgetProgress, getBudgetCategories, getBudgetTransactions, updateBudget, deleteBudget, addCategoryToBudget,
    deleteCategoryFromBudget
} from "../api/budgetsApi";
import "../styles/BudgetDetail.css";

export default function BudgetDetail() {
    const navigate = useNavigate();
    const { categories, categoriesLoading, refreshBudgets } = useFinance();
    const [budget, setBudget] = useState();
    const [progress, setProgress] = useState();
    const [linkedCategories, setLinkedCategories] = useState([]);
    const [linkedTransactions, setLinkedTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategoryToAdd, setSelectedCategoryToAdd] = useState();
    const [isEditing, setIsEditing] = useState(false);
    const [edits, setEdits] = useState({ name: "", description: "", targetAmount: 0, status: "" });
    const { id } = useParams();

    useEffect(() => {
        loadBudgetData();
    }, [id])

    const loadBudgetData = async () => {
        setLoading(true);
        try {
            const [budgetRes, progressRes, categoriesRes, transactionsRes] = await Promise.all([
                getBudgetById(id),
                getBudgetProgress(id),
                getBudgetCategories(id),
                getBudgetTransactions(id)
            ])
            setBudget(budgetRes[0]);
            setProgress(progressRes);
            setLinkedCategories(categoriesRes);
            setLinkedTransactions(transactionsRes);
            console.log(budgetRes[0], progressRes, categoriesRes, transactionsRes);
        } catch (err) {
            console.error("Failed to load budget data:", err);
            alert("Failed to load budget data.");
            navigate("/budgets", { replace: true });
            return;
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdate() {
        try {
            await updateBudget({ ...edits, budgetid: id });
            setIsEditing(false);
            loadBudgetData();
            alert("Budget updated successfully!");
        } catch (err) {
            console.error("Failed to update budget:", err);
            alert("Failed to update budget.");
        }
    }

    async function handleDelete() {
        if (!confirm("Are you sure you want to permanently delete this budget?")) return;
        try {
            await deleteBudget(id);
            refreshBudgets();
            alert("Budget deleted successfully!");
            navigate("/budgets", { replace: true });
        } catch (err) {
            console.error("Failed to delete budget:", err);
            alert("Failed to delete budget.");
        }
    }

    const linkableCategories = categories.filter(
        (cat) => !linkedCategories.some((lc) => lc.categoryid === cat.categoryid)
    );
    console.log("Linkable Categories:", linkableCategories);

    async function handleAddCategory() {
        try {
            await addCategoryToBudget(id, selectedCategoryToAdd);
            setSelectedCategoryToAdd();
            loadBudgetData();
            alert("Category added successfully!");
        } catch (err) {
            console.error("Failed to add category:", err);
            alert("Failed to add category.");
        }
    }

    async function handleRemoveCategory(categoryId) {
        try {
            await deleteCategoryFromBudget(id, categoryId);
            loadBudgetData();
            alert("Category removed successfully!");
        } catch (err) {
            console.error("Failed to remove category:", err);
            alert("Failed to remove category.");
        }
    }

    return (
        <main className="budget-detail-page">
            {/* Back Button */}
            <button className="material-symbols-outlined back-btn" onClick={() => navigate("/budgets", { replace: true })}>
                ←
            </button>

            {/* Modern Inline Edit Card */}
            <div className={`budget-detail-card ${isEditing ? "editing-mode" : ""}`}>

                {/* Header Area */}
                <div className="budget-card-header">
                    <div className="budget-title-area">
                        <span className="budget-type-badge">{budget?.budget_type}</span>
                        {isEditing ? (
                            <input
                                type="text"
                                className="inline-title-input"
                                value={edits.name}
                                onChange={(e) => setEdits({ ...edits, name: e.target.value })}
                                placeholder="Budget Name"
                                required
                            />
                        ) : (
                            <h1>{budget?.name}</h1>
                        )}
                        {isEditing ? (
                            <textarea
                                className="inline-desc-input"
                                value={edits.description}
                                onChange={(e) => setEdits({ ...edits, description: e.target.value })}
                                placeholder="Add a description..."
                            />
                        ) : (
                            budget?.description && <p className="budget-description">{budget.description}</p>
                        )}
                    </div>

                    {/* Header Action Buttons */}
                    <div className="budget-actions">
                        {!isEditing ? (
                            <>
                                <button className="btn-edit" onClick={() => {
                                    setEdits({
                                        name: budget.name,
                                        description: budget.description || "",
                                        targetAmount: budget.target_amount,
                                        status: budget.status
                                    });
                                    setIsEditing(true);
                                }}>
                                    ✏️ Edit
                                </button>
                                <button className="btn-delete" onClick={handleDelete}>
                                    🗑️ Delete
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="btn-save-inline" onClick={handleUpdate}>
                                    💾 Save
                                </button>
                                <button className="btn-cancel-inline" onClick={() => setIsEditing(false)}>
                                    ❌ Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Grid for KPIs (Spent, Limit, Status) */}
                <div className="budget-stats-grid">
                    {/* Limit Box (Editable Inline) */}
                    <div className="stat-box">
                        <span className="stat-label">Target Limit</span>
                        {isEditing ? (
                            <div className="inline-input-wrapper">
                                <span>₹</span>
                                <input
                                    type="number"
                                    className="inline-stat-input"
                                    value={edits.targetAmount}
                                    onChange={(e) => setEdits({ ...edits, targetAmount: e.target.value })}
                                    required
                                />
                            </div>
                        ) : (
                            <span className="stat-value limit-amount">
                                ₹{parseFloat(budget?.target_amount || 0).toLocaleString()}
                            </span>
                        )}
                    </div>

                    {/* Spent Box (Read-only) */}
                    <div className="stat-box">
                        <span className="stat-label">Total Spent</span>
                        <span className="stat-value spent-amount">
                            ₹{linkedTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0).toLocaleString()}
                        </span>
                    </div>

                    {/* Balance Box (Read-only) */}
                    <div className="stat-box">
                        <span className="stat-label">Remaining Balance</span>
                        <span className={`stat-value remaining-amount ${(budget?.target_amount - linkedTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0)) < 0 ? 'deficit' : 'surplus'
                            }`}>
                            ₹{(budget?.target_amount - linkedTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0)).toLocaleString()}
                        </span>
                    </div>

                    {/* Status Box (Editable Inline) */}
                    <div className="stat-box">
                        <span className="stat-label">Status</span>
                        {isEditing ? (
                            <select
                                className="inline-stat-select"
                                value={edits.status}
                                onChange={(e) => setEdits({ ...edits, status: e.target.value })}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        ) : (
                            <span className={`status-pill ${budget?.status}`}>
                                {budget?.status}
                            </span>
                        )}
                    </div>
                </div>

                {/* Progress Bar Section */}
                <div className="budget-progress-container">
                    <div className="progress-label-row">
                        <span>Overall Budget Progress</span>
                        <span className={progress?.progress >= 100 ? "text-danger" : ""}>
                            {progress?.progress?.toFixed(1)}%
                        </span>
                    </div>
                    <div className="progress-bar-track">
                        <div
                            className={`progress-bar-fill ${progress?.progress >= 100 ? 'over-budget' : ''}`}
                            style={{ width: `${Math.min(progress?.progress || 0, 100)}%` }}
                        />
                    </div>
                    <div className="progress-dates">
                        <span>Started: {new Date(budget?.start_date).toLocaleDateString()}</span>
                        {budget?.end_date && <span>Ends: {new Date(budget.end_date).toLocaleDateString()}</span>}
                    </div>
                </div>

            </div>
            <div className="budget-content-grid">
                <div className="budget-categories-panel">
                    <h2>Categories in this Budget</h2>
                    <p>Select categories to include in this budget.</p>
                    <div className="add-category-control">
                        <select
                            value={selectedCategoryToAdd || ""}
                            onChange={(e) => setSelectedCategoryToAdd(e.target.value)}
                        >
                            <option value="">-- Choose a Category --</option>
                            {linkableCategories.map(cat => (
                                <option key={cat.categoryid} value={cat.categoryid}>
                                    {cat.name} ({cat.type})
                                </option>
                            ))}
                        </select>
                        <button onClick={handleAddCategory} disabled={!selectedCategoryToAdd}>Link Category</button>
                    </div>
                    {/* Pills List of Linked Categories */}
                    <div className="category-pills">
                        {linkedCategories.length === 0 ? (
                            <p className="empty-msg">No categories linked yet.</p>
                        ) : (
                            linkedCategories.map(cat => (
                                <div key={cat.categoryid} className="category-pill">
                                    <span>{cat.name}</span>
                                    <button
                                        type="button"
                                        className="unlink-btn"
                                        onClick={() => handleRemoveCategory(cat.categoryid)} // 👈 Triggers the fix
                                    >
                                        ×
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                </div>
                <div className="budget-transactions-panel">
                    <h2>Transactions in this Budget</h2>
                    <div className="table-wrapper">
                        {linkedTransactions.length === 0 ? (
                            <p className="empty-msg">No transactions linked to this budget yet.</p>
                        ) : (
                            <table className="transactions-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Category</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {linkedTransactions.map((t) => (
                                        <tr key={t.transactionid}>
                                            <td>{new Date(t.date).toLocaleDateString()}</td>
                                            <td>{t.category_name}</td>
                                            <td className="spent-amount">₹{parseFloat(t.amount).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                </div>
            </div>
        </main>
    );
}