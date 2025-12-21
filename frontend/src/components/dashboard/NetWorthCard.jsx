import { useState } from 'react';
import './NetWorthCard.css';

export default function NetWorthCard()  {
    const [netWorth, setNetWorth] = useState(0);
    const [range, setRange] = useState("month");

    return (
        <div>
            <p className="heading">Net Worth</p>
            <p className="networth">$ {netWorth}</p>
            <select name="timerange" id="timerange" 
                value={range} onChange={(e) => setRange(e.target.value)}>
                    <option value="today">Today</option>
                    <option value="month">This month</option>
                    <option value="year">This year</option>
            </select>
        </div>
    )
}
