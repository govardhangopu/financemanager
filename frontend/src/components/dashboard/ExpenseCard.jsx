import { useState }from "react";
import "./ExpenseCard.css";

export default function ExpenseCard() {
    const [expense, setExpense] = useState(0);
    const [range, setRange] = useState("month");

    return (
        <div>
            <p>Expenses</p>
            <p className="expense">$ {expense}</p>
            <select name="timerange" id="timerange" 
                value={range} onChange={(e) => setRange(e.target.value)}>
                    <option value="today">Today</option>
                    <option value="month">This month</option>
                    <option value="year">This year</option>
            </select>
        </div>
    )
}