import { useNavigate } from "react-router-dom";
import { addTransaction } from "../api/transactionApi";
import { useFinance } from "../context/FinanceContext";
import TransactionForm from "../components/TransactionForm";

export default function AddTransaction() {
    const { refreshTransactions, refreshCategories } = useFinance();
    const navigate = useNavigate();

    const handleAdd = async (transaction) => {
        console.log(`Adding transaction: ${JSON.stringify(transaction)}`);
        try {
            const res = await addTransaction(transaction);
            console.log("Transaction added successfully:", res);
            refreshTransactions();
            navigate("/dashboard");
        }
        catch (err) {
            console.error("Error adding transaction:", err);
            alert("Failed to add transaction. Please try again.");

            throw err;
        }
    };

    return (
        <main>
            <TransactionForm
                initialValues={null}
                onSubmit={handleAdd}
                submitLabel="Add Transaction"
                mode="real" //user is creating a real transaction, not partial
            />
        </main>
    )
}