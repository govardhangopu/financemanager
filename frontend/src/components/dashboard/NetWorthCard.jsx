import { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { dateFilter } from "../../utils/dateFilter.js";
import './NetWorthCard.css';

export default function NetWorthCard()  {
    const [range, setRange] = useState("all");
    let { netWorth, transactions } = useFinance();

    let selectedTransactions = dateFilter(range, transactions);

    netWorth = selectedTransactions.reduce((sum, t) => {
        if (t.type === "income")
            return sum + parseFloat(t.amount);
        else if (t.type === "expense")
            return sum - parseFloat(t.amount);
    }, 0.0);
    console.log(netWorth)

    return (
        <div>
            <p className="heading">Net Worth</p>
            <p className="networth">$ {netWorth}</p>
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
