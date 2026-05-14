import { useState } from "react";
import "../styles/AddTransaction.css";
import { addTransaction } from "../api/transactionApi";
import { useFinance } from "../context/FinanceContext";

export default function AddTransaction() {
    const { categories, refreshTransactions, refreshCategories } = useFinance();
    const [amount, setAmount] = useState("");
    const [transactionType, setTransactionType] = useState("income");
    const [transactionDate, setTransactionDate] = useState("");
    const [transactionCategory, setTransactionCategory] = useState("");
    const [newCategory, setNewCategory] = useState("");

    const [errors, setErrors] = useState({ amount: "", date: "", category: "" });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!amount || parseFloat(amount) <= 0)
            return setErrors(prev => ({ ...prev, amount: "Amount must be a positive number." }));
        else 
            setErrors(prev => ({ ...prev, amount: "" }));

        if (!transactionCategory) 
            return setErrors(prev => ({ ...prev, category: "Please select a category for the transaction." }));
        else
            setErrors(prev => ({ ...prev, category: "" }));

        if (!transactionDate)
            return setErrors(prev => ({ ...prev, date: "Please select a date for the transaction." }));
        else
            setErrors(prev => ({ ...prev, date: "" }));

        const transaction = {
            amount: parseFloat(amount),
            type: transactionType,
            date: transactionDate,
            categoryid: transactionCategory,
            is_partial: 0
        };
        console.log(`Adding transaction: ${JSON.stringify(transaction)}`);

        addTransaction(transaction)
        .then(res => {
            console.log("Transaction added successfully:", res);
            setAmount("");
            setTransactionDate("");
            setTransactionCategory("");
            refreshTransactions();
        })
        .catch(err => {
            console.error("Error adding transaction:", err);
        });

    };

    return (
        <div className="add-transaction">
            <h2>Add Transaction</h2>
            <form onSubmit={handleSubmit}>
                <div className="transaction-form">
                    <div className="field">
                        <label htmlFor="amount">Enter amount:</label>
                        <input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                        <div className="errmsg">{errors.amount}</div>
                    </div>

                    <div className="field">
                        <label htmlFor="type">Enter Transaction type:</label>
                        <select id="type" value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                        <div className="errmsg">{errors.type}</div>
                    </div>

                    <div className="field">
                        <label htmlFor="category">Choose category:</label>
                        <select id="category" value={transactionCategory} onChange={(e) => setTransactionCategory(e.target.value)}>
                            <option value="">-- Select Category --</option>
                            {categories.map(cat => (
                                <option key={cat.categoryid} value={cat.categoryid}>{cat.name}</option>
                            ))}
                        </select>
                        <div className="errmsg">{errors.category}</div>
                    </div>

                    <div className="field">
                        <label htmlFor="date">Enter date:</label>
                        <input id="date" type="date" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} />
                        <div className="errmsg">{errors.date}</div>
                    </div>
                    
                    <button type="submit">Add Transaction</button>
                </div>
                

            </form>
        </div>
    )
}