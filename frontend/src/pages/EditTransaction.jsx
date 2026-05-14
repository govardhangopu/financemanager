import { useEffect, useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { useParams, useNavigate } from "react-router-dom";
import { updateTransaction } from "../api/transactionApi.js";
import "../styles/EditTransaction.css";

export default function EditTransaction() {
    const { id } = useParams();
    const { transactions, transactionLoading, categories, categoriesLoading, refreshTransactions } = useFinance();
    const navigate = useNavigate();
    const transaction = transactions.find(t => t.transactionid === parseInt(id));
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState("");
    const [category, setCategory] = useState("");
    const [isPartial, setIsPartial] = useState(0);

    useEffect(() => {
        if (transactionLoading) return;
        if (!transaction) {
            alert("Transaction not found");
            navigate("/dashboard");
            return;
        }
        setAmount(transaction.amount);
        setDate(new Date(transaction.date).toISOString().split("T")[0]);
        setCategory(transaction.categoryid);
        setIsPartial(transaction.is_partial);        
    }, [transactionLoading, transaction, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(`Updating transaction ${id} with amount: ${amount}, date: ${date}, category: ${category}, isPartial: ${isPartial}`);
        updateTransaction({
            transactionid: parseInt(id),
            amount: parseFloat(amount),
            date,
            categoryid: parseInt(category),
            is_partial: isPartial,
        }).then(() => {
            alert("Transaction updated successfully");
            refreshTransactions();
            navigate("/dashboard");
        }).catch(err => {
            console.error("Error updating transaction:", err);
            alert("Failed to update transaction");
        });
    }
    return (
        <main>
            {transactionLoading ? (
                <div>Loading...</div>
            ) : (
                <div>
                    <h2>Edit Transaction</h2>
                    <form id="form" onSubmit={handleSubmit}>
                        <label htmlFor="amount">Amount:</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
                        <label htmlFor="date">Date:</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                        <label htmlFor="category">Category:</label>
                        <select name="categories" value={category} onChange={e => setCategory(e.target.value)}>
                            <option value="">Select a category</option>
                            {categoriesLoading ? (
                                <option value="">Loading categories...</option>
                            ) : (
                                categories.map(cat => (
                                    <option key={cat.categoryid} value={cat.categoryid}>{cat.name}</option>
                                ))
                            )}
                        </select>
                        <label htmlFor="isPartial">Is Partial:</label>
                        <input type="checkbox" checked={isPartial} onChange={e => setIsPartial(e.target.checked ? 1 : 0)} />
                        <button type="submit">Update Transaction</button>
                    </form>
                </div>
            )}
        </main>
    )
}