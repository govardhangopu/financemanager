import { useState } from 'react';
import { useFinance } from '../../context/FinanceContext.jsx';
import { prepareTransactionsForRange } from '../../utils/prepareTransactionsForRange.js';
import { buildCumulativeSeries } from '../../utils/buildCumulativeSeries.js';
import { GenericChart } from "../GenericChart.jsx";
import Loader from '../Loader.jsx';
import './NetFlowCard.css';

export default function NetFlowCard()  {
    const [range, setRange] = useState("all");
    let { netWorth, transactions, transactionsLoading } = useFinance();

    let { dateMap, labels, granularity } = prepareTransactionsForRange(range, transactions);

    netWorth = Object.values(dateMap).reduce((acc, curr) => acc.concat(curr), []).reduce((sum, t) => {
        if (t.type === "income")
            return sum + parseFloat(t.amount);
        else if (t.type === "expense")
            return sum - parseFloat(t.amount);
    }, 0.0);
    //console.log(netWorth);

    const values = buildCumulativeSeries(dateMap, labels, (sum, transaction) => {
        if (transaction.type === "income")
            return sum + parseFloat(transaction.amount);
        else if (transaction.type === "expense")
            return sum - parseFloat(transaction.amount);
    })
    const dataset = [{ label: "Net Flow", data: values, borderColor: "#008080", backgroundColor: "#008080" }];

    return (
        <div>
            <p className="heading">Net Flow</p>
            { transactionsLoading ? <Loader text="Loading..." /> : <>
            <p className="netflow">₹ {netWorth} {netWorth >= 0 ? `↗`: '↘'}</p>
            <select name="time-range-select" className="time-range-select" 
                value={range} onChange={(e) => setRange(e.target.value)}>
                    <option value="today">Today</option>
                    <option value="month">This month</option>
                    <option value="year">This year</option>
                    <option value="all">All-time</option>
            </select>
            <GenericChart labels={labels} datasets={dataset} />
            </>}
        </div>
    )
}
