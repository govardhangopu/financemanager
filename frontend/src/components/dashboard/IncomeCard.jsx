import { useState }from "react";
import { useFinance } from "../../context/FinanceContext";
import { prepareTransactionsForRange } from "../../utils/prepareTransactionsForRange.js";
import { buildCumulativeSeries } from "../../utils/buildCumulativeSeries.js";
import { GenericChart } from "./GenericChart.jsx";
import Loader from '../Loader.jsx';
import "./IncomeCard.css";

export default function IncomeCard() {
    const [range, setRange] = useState("all");
    let { totalIncome, transactions, transactionsLoading } = useFinance();

    const { dateMap, labels, granularity } = prepareTransactionsForRange(range, transactions);

    totalIncome = Object.values(dateMap).reduce((acc, curr) => acc.concat(curr), []).reduce((sum, t) => {
        if (t.type === "income")
            return sum + parseFloat(t.amount);
        else return sum;
    }, 0.0);
    //console.log(totalIncome)

    const values = buildCumulativeSeries(dateMap, labels, (sum, transaction) => {
        if (transaction.type === "income")
            return sum + parseFloat(transaction.amount);
        else return sum;
    })
    const dataset = [{ label: "Income", data: values, borderColor: "#1a8b04ff", backgroundColor: "#1a8b04ff" }];

    return (
        <div>
            <p className="heading">Incomes</p>
            { transactionsLoading ? <Loader text="Loading..." /> : <>
            <p className="totalIncome">$ {totalIncome}</p>
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