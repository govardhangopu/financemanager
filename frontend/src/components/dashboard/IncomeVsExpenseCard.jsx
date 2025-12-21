import { useState }from "react";

export default function IncomeVsExpenseCard() {
    const [range, setRange] = useState("month");

    return (
        <div>
            Income vs Expense
            <select name="timerange" id="timerange" 
                value={range} onChange={(e) => setRange(e.target.value)}>
                    <option value="today">Today</option>
                    <option value="month">This month</option>
                    <option value="year">This year</option>
            </select>
        </div>
    )
}