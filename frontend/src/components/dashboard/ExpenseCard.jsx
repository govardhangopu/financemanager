import { useState } from "react";
import { useFinance } from "../../context/FinanceContext";
import { prepareTransactionsForRange } from "../../utils/prepareTransactionsForRange.js";
import { buildCumulativeSeries } from "../../utils/buildCumulativeSeries.js";
import { GenericChart } from "./GenericChart.jsx";
import Loader from '../Loader.jsx';
import "./ExpenseCard.css";

export default function ExpenseCard() {
    const [range, setRange] = useState("all");
    let { totalExpense, transactions, transactionsLoading } = useFinance();

    const { dateMap, labels, granularity } = prepareTransactionsForRange(range, transactions);

    totalExpense = Object.values(dateMap).reduce((acc, curr) => acc.concat(curr), []).reduce((sum, t) => {
        if (t.type === "expense")
            return sum + parseFloat(t.amount);
        else return sum;
    }, 0.0);
    //console.log(totalExpense)

    const values = buildCumulativeSeries(dateMap, labels, (sum, transaction) => {
        if (transaction.type === "expense")
            return sum + parseFloat(transaction.amount);
        else return sum;
    })
    const dataset = [{ label: "Expense", data: values, borderColor: "#c41c1cff", backgroundColor: "#c41c1cff" }];

    return (
        <div>
            <p>Expenses</p>
            { transactionsLoading ? <Loader text="Loading..." /> : <>
            <p className="totalExpense">$ {totalExpense}</p>
            <select name="timerange" id="timerange" 
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