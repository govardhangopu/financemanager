import { useState }from "react";
import { useFinance } from "../../context/FinanceContext";
import { useNavigate } from "react-router-dom";
import "./BudgetCard.css";

export default function BudgetCard() {
    const navigate = useNavigate();
    const { budgets } = useFinance();

    return (
        <div>
            Budgets <br />
            {budgets.length === 0 ? (
                <p>No budgets found. Create your first budget.</p>
            ) : (
                <div className="budget_card_container">
                    {budgets.map(budget => (
                        <div key={budget.budgetid} className="budget_card" onClick={() => navigate(`/budgets/${budget.budgetid}`)} >
                            <h3>{budget.name}</h3>
                            {budget.description && <p>{budget.description}</p> }
                            <p>Target: ${budget.target_amount}</p>
                            <p>Type: {budget.budget_type.charAt(0).toUpperCase() + budget.budget_type.slice(1)}</p>
                            <p>Start: {new Date(budget.start_date).toLocaleDateString()}</p>
                            <p>End: {budget.end_date ? new Date(budget.end_date).toLocaleDateString() : "N/A"}</p>
                            <p>Status: {budget.status.charAt(0).toUpperCase() + budget.status.slice(1)}</p>
                        </div>
                    ))}
                </div>
            )
            }
        </div>
    )
}