import { useState } from "react";
import { useFinance } from "../../context/FinanceContext";
import { dateFilter } from "../../utils/dateFilter.js";
import "./ExpenseCard.css";

export default function ExpenseCard() {
    const [range, setRange] = useState("all");
    let { totalExpense, transactions } = useFinance();

    let selectedTransactions = dateFilter(range, transactions);
    
    totalExpense = selectedTransactions.reduce((sum, t) => {
        if (t.type === "expense")
            return sum + parseFloat(t.amount);
        else return sum;
    }, 0.0);
    console.log(totalExpense)

    return (
        <div>
            <p>Expenses</p>
            <p className="expense">$ {totalExpense}</p>
            <select name="timerange" id="timerange" 
                value={range} onChange={(e) => setRange(e.target.value)}>
                    <option value="today">Today</option>
                    <option value="month">This month</option>
                    <option value="year">This year</option>
                    <option value="all">All-time</option>
            </select>
        </div>
    )
}