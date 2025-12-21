import { useState }from "react";
import "./IncomeCard.css";

export default function IncomeCard() {
    const [income, setIncome] = useState(0);
    const [range, setRange] = useState("month");

    return (
        <div>
            <p className="heading">Incomes</p>
            <p className="income">$ {income}</p>
            <select name="timerange" id="timerange" 
                value={range} onChange={(e) => setRange(e.target.value)}>
                    <option value="today">Today</option>
                    <option value="month">This month</option>
                    <option value="year">This year</option>
            </select>
        </div>
    )
}