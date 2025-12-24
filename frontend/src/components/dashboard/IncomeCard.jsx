import { useState }from "react";
import { useFinance } from "../../context/FinanceContext";
import { dateFilter } from "../../utils/dateFilter.js";
import "./IncomeCard.css";

export default function IncomeCard() {
    const [range, setRange] = useState("all");
    let { totalIncome, transactions } = useFinance();

    let selectedTransactions = dateFilter(range, transactions);
    
    totalIncome = selectedTransactions.reduce((sum, t) => {
        if (t.type === "income")
            return sum + parseFloat(t.amount);
        else return sum;
    }, 0.0);
    console.log(totalIncome)

    return (
        <div>
            <p className="heading">Incomes</p>
            <p className="income">$ {totalIncome}</p>
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