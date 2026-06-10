import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFinance } from "../../context/FinanceContext";
import { deleteTransaction } from "../../api/transactionApi";
import Loader from '../Loader.jsx';
import "./TransactionHistoryCard.css";

export default function TransactionHistoryCard() {
    const navigate = useNavigate()
    const [range, setRange] = useState("all");
    const [sortOrder, setSortOrder] = useState("desc");
    const [sortBy, setSortBy] = useState("date");
    const { transactions, refreshTransactions, transactionsLoading } = useFinance();

    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = today.getMonth();
    let selectedTransactions = transactions;

    if (range === "all") {
        selectedTransactions = transactions;
    } else {
        let date;

        if (range === "today")
            date = new Date(curYear, curMonth, today.getDate(), 0, 0, 0);
        else if (range === "month") 
            date = new Date(curYear, curMonth, 1);
        else if (range === "year")
            date = new Date(curYear, 0, 1);

        //console.log(date);
        selectedTransactions = transactions.filter(t => {
            const tdate = new Date(t.date);
            return tdate >= date;
        });
    }
    //console.log(selectedTransactions);

    function toggleSort(sortOnColumn) {
        if (sortOnColumn === sortBy)
            setSortOrder(sortOrder === "desc" ? "asc" : "desc");
        else {
            setSortBy(sortOnColumn);
            setSortOrder("desc");
        }
            
    }
    const sortedTransactions = [...selectedTransactions].sort((a, b) => {
        let compareValue = 0;

        if (sortBy === "date") {
            compareValue = new Date(a.date) - new Date(b.date);
        } else if (sortBy === "amount") {
            compareValue = a.amount - b.amount;
        }

        return sortOrder === "asc" ? compareValue : -compareValue;
    });

    const deleteTrans = (e, t) => {
        e.preventDefault();
        if(!confirm(`Do you want to delete Transaction ID: ${t.transactionid} Amount: ${t.amount}?`)) return;
        deleteTransaction(t.transactionid)
            .then(res => {
                console.log("Transaction deleted successfully.");
                refreshTransactions();
            })
            .catch(err => {
                    console.error("Error deleting transaction:", err);
            });
    }

    return (
        <div>
            Transaction History
            { transactionsLoading ? <Loader text="Loading transactions..." /> : <>
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
                            <tr>
                                <th>Category</th>
                                <th>
                                    <button type="button" onClick={e => toggleSort("amount")}>
                                        Amount {sortBy === "amount" && (sortOrder === "desc" ? "▼" : "▲")}
                                    </button>
                                </th>
                                <th>
                                    <button type="button" onClick={e => toggleSort("date")}>
                                        Date {sortBy === "date" && (sortOrder === "desc" ? "▼" : "▲")}
                                    </button>
                                </th>
                                <th>Actions</th>
                            </tr>
                            
                        </thead>
                        <tbody>
                        {
                            sortedTransactions.map(t => ( 
                            <tr key={t.transactionid}>
                                <td>{t.category_name}</td>
                                <td className={t.type}>
                                    {
                                        t.type === "income" 
                                        ? "+$" + t.amount
                                        : "-$" + t.amount
                                    }
                                </td>
                                <td>{new Date(t.date).toLocaleString()}</td>
                                <td>
                                    <button id="delbutton" type="button" onClick={e => deleteTrans(e, t)}>🗑️</button>
                                    <button id="editbutton" type="button" onClick={() => navigate(`/edittransaction/${t.transactionid}`)}>✏️</button>
                                </td>
                            </tr>
                            ))
                        }
                        </tbody>
                    </table>
                    : "No transactions available."
                }
                
            </div>
            </>}
        </div>
    )
}