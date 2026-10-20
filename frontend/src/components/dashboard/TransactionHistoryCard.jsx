import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFinance } from "../../context/FinanceContext";
import { filterTransactionsForRange } from "../../utils/prepareTransactionsForRange.js";
import { deleteTransaction } from "../../api/transactionApi";
import Loader from '../Loader.jsx';
import "./TransactionHistoryCard.css";

export default function TransactionHistoryCard() {
    const navigate = useNavigate()
    const [range, setRange] = useState("all");
    const [sortOrder, setSortOrder] = useState("desc");
    const [sortBy, setSortBy] = useState("date");
    const { transactions, refreshTransactions, transactionsLoading } = useFinance();

    const selectedTransactions = filterTransactionsForRange(range, transactions);
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
            compareValue = String(a.date).slice(0, 10).localeCompare(String(b.date).slice(0, 10));
        } else if (sortBy === "amount") {
            compareValue = a.amount - b.amount;
        }

        return sortOrder === "asc" ? compareValue : -compareValue;
    });

    const deleteTrans = (e, t) => {
        e.preventDefault();
        if(!confirm(`Do you want to delete Transaction with Amount: ₹${t.amount}?`)) return;
        deleteTransaction(t.transactionid)
            .then(res => {
                // console.log("Transaction deleted successfully.");
                refreshTransactions();
            })
            .catch(err => {
                    console.error("Error deleting transaction:", err);
            });
    }

    return (
        <div id="transactionHistoryCard">
            Transaction History
            { transactionsLoading ? <Loader text="Loading transactions..." /> : <>
            <select name="time-range-select" className="time-range-select" 
                value={range} onChange={(e) => setRange(e.target.value)}>
                    <option value="today">Today</option>
                    <option value="month">This month</option>
                    <option value="year">This year</option>
                    <option value="all">All-time</option>
            </select>
            <br />
            
            <div id="newlayout">
                {
                    selectedTransactions.length === 0 ? "No transactions available for this time range." : <>
                    <div id="cardHeader">
                        <tr>
                            <td id="category">Category</td>
                            <td><button type="button" onClick={e => toggleSort("amount")}>
                                Amount {sortBy === "amount" && (sortOrder === "desc" ? "▼" : "▲")}
                            </button></td>
                            <td><button type="button" onClick={e => toggleSort("date")}>
                                Date {sortBy === "date" && (sortOrder === "desc" ? "▼" : "▲")}
                            </button></td>
                            <td>Actions</td>
                        </tr>
                        
                    </div>
                    <div id="transactions">
                        <table id="transactiontable">
                            <tbody>
                                { sortedTransactions.map(t => (
                                    <tr key={t.transactionid}>
                                        <td id="tCategory">{t.category_name || "No category"}</td>
                                        <td className={t.type}>
                                        {
                                            t.type === "income" 
                                            ? "+₹" + t.amount
                                            : "-₹" + t.amount
                                        }</td>
                                        <td className="date">{new Date(`${String(t.date).slice(0, 10)}T00:00:00`).toLocaleDateString()}</td>
                                        <td>
                                            <button id="delbutton" type="button" onClick={e => deleteTrans(e, t)}>🗑️</button>
                                            <button id="editbutton" type="button" onClick={() => navigate(`/edittransaction/${t.transactionid}`)}>✏️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>}
            </div>
            </>}
        </div>
    )
}
