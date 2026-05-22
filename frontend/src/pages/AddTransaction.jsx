import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addTransaction } from "../api/transactionApi";
import { useFinance } from "../context/FinanceContext";
import TransactionForm from "../components/TransactionForm";

export default function AddTransaction() {
    const { refreshTransactions, refreshCategories } = useFinance();
    const navigate = useNavigate();

    const handleAdd = (transaction) => {
        console.log(`Adding transaction: ${JSON.stringify(transaction)}`);

        addTransaction(transaction)
        .then(res => {
            console.log("Transaction added successfully:", res);
            refreshTransactions();
            navigate("/dashboard");
        })
        .catch(err => {
            console.error("Error adding transaction:", err);
            alert("Failed to add transaction. Please try again.");
        });

    };

    return (
        <main>
            {/* <h2>Add Transaction</h2>
            <form onSubmit={handleSubmit}>
                <div className="transaction-form">
                    <div className="field">
                        <label htmlFor="amount">Enter amount:</label>
                        <input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                        <div className="errmsg">{errors.amount}</div>
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
                

            </form> */}
            <TransactionForm
                initialValues={null}
                onSubmit={handleAdd}
                submitLabel="Add Transaction"
                mode="real" //user is creating a real transaction, not partial
            />
        </main>
    )
}