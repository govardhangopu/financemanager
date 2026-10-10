import { useEffect, useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { useParams, useNavigate } from "react-router-dom";
import { updateTransaction } from "../api/transactionApi.js";
import TransactionForm from "../components/TransactionForm";
import ScenarioPicker from "../components/ScenarioPicker.jsx";
import "../styles/EditTransaction.css";

export default function EditTransaction() {
    const { id } = useParams();
    const { transactions, transactionsLoading, refreshTransactions, scenarios } = useFinance();
    const navigate = useNavigate();
    const transaction = transactions.find(t => t.transactionid === parseInt(id));
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState("");
    const [category, setCategory] = useState("");
    const [isPartial, setIsPartial] = useState(0);
    const [showScenarioPicker, setShowScenarioPicker] = useState(false);

    useEffect(() => {
        if (transactionsLoading) return;
        if (!transaction) {
            alert("Transaction not found");
            navigate("/dashboard");
            return;
        }
        setAmount(transaction.amount);
        setDate(new Date(transaction.date).toISOString().split("T")[0]);
        setCategory(transaction.categoryid);
        setIsPartial(transaction.is_partial);
    }, [transactionsLoading, transaction, navigate]);

    const handleSubmit = async (transactionData) => {
        const transactionUpdate = {
            ...transactionData,
            transactionid: transaction.transactionid
        };

        console.log(`Updating transaction: ${JSON.stringify(transactionUpdate)}`);
        try {
            await updateTransaction(transactionUpdate);
            console.log("Transaction updated successfully");
            refreshTransactions();
            navigate("/dashboard");
        }
        catch (err) {
            console.error("Error updating transaction:", err);
            alert("Failed to update transaction");

            throw err;
        };
    }
    return (
        <main>
            {transactionsLoading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <TransactionForm
                        initialValues={{
                            amount,
                            date,
                            categoryid: category,
                            is_partial: isPartial
                        }}
                        onSubmit={handleSubmit}
                        submitLabel="Update Transaction"
                        mode="real"
                    />

                    <div className="scenario-discovery-action">
                        <p>
                            Want to see what happens if this transaction were different?
                        </p>
                        <button type="button" onClick={() => setShowScenarioPicker(true)}>
                            Explore in Scenario →
                        </button>
                    </div>

                    {showScenarioPicker && (
                        <ScenarioPicker
                            scenarios={scenarios}
                            onClose={() => setShowScenarioPicker(false)}
                            onSelect={(scenarioId) => {
                                setShowScenarioPicker(false);

                                navigate(`/scenarios/${scenarioId}`, {
                                    state: {
                                        transactionToExplore: transaction
                                    }
                                });
                            }}
                            onCreate={() => {
                                setShowScenarioPicker(false);

                                navigate("/scenarios", {
                                    state: {
                                        openCreateScenario: true,
                                        transactionToExplore: transaction
                                    }
                                });
                            }}
                        />
                    )}
                </>
            )}
        </main>
    );
}