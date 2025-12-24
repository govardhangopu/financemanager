import { useState }from "react";
import { useFinance } from "../../context/FinanceContext";
import { dateFilter } from "../../utils/dateFilter.js";
import "./TransactionHistoryCard.css";

export default function TransactionHistoryCard() {
    const [range, setRange] = useState("all");
    const { transactions } = useFinance();

    const selectedTransactions = dateFilter(range, transactions);

    return (
        <div>
            Transaction History
            <select name="timerange" id="timerange" 
                value={range} onChange={(e) => setRange(e.target.value)}>
                    <option value="today">Today</option>
                    <option value="month">This month</option>
                    <option value="year">This year</option>
                    <option value="all">All-time</option>
            </select>
            <br />
            <div id="layout">
                {
                    selectedTransactions.length > 0 ?
                    <table id="transactions">
                        <thead>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Type</th>
                            <th>Date</th>
                        </thead>
                        {
                            selectedTransactions.map(t => ( 
                            <tr key={t.transactionid}>
                                <td>{t.category_name}</td>
                                <td>{t.type}</td>
                                <td>
                                    {
                                        t.type === "income" 
                                        ? "+$" + t.amount
                                        : "-$" + t.amount
                                    }
                                </td>
                                <td>{new Date(t.date).toLocaleString()}</td>
                            </tr>
                            ))
                        }
                    </table>
                    : "No transactions available."
                }
                
            </div>
        </div>
    )
}