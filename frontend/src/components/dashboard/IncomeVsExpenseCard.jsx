import { useState }from "react";
import { useFinance } from "../../context/FinanceContext";
import { prepareTransactionsForRange } from "../../utils/prepareTransactionsForRange.js";
import { GenericChart } from "./GenericChart.jsx";
import Loader from '../Loader.jsx';

export default function IncomeVsExpenseCard() {
    const [range, setRange] = useState("all");
    const { transactions, transactionsLoading } = useFinance();

    const { dateMap, labels, granularity } = prepareTransactionsForRange(range, transactions);
    const datasets =  [
        { label: "Income", data: [], borderColor: "#1a8b04ff", backgroundColor: "#1a8b04ff" }, 
        { label: "Expense", data: [], borderColor: "#c41c1cff", backgroundColor: "#c41c1cff" } 
    ];

    labels.forEach(label => {
        const transactions = dateMap[label];
        let income = 0, expense = 0;
        transactions.forEach(transaction => {
            if (transaction.type === "income")
                income += Number(transaction.amount);
            else
                expense += Number(transaction.amount);
        })
        datasets[0].data.push(income);
        datasets[1].data.push(expense);
    })
    
    // console.log(dateMap);
    // console.log("labels:", labels);
    // console.log("datasets:", datasets);

    return (
        <div>
            Income vs Expense
            { transactionsLoading ? <Loader text="Loading..." /> : <>
            <select name="timerange" id="timerange" 
                value={range} onChange={(e) => setRange(e.target.value)}>
                    <option value="today">Today</option>
                    <option value="month">This month</option>
                    <option value="year">This year</option>
                    <option value="all">All-time</option>
            </select>
            <GenericChart labels={labels} datasets={datasets} type={"bar"} />
            </>}
        </div>
    )
}