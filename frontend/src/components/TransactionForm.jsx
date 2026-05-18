import { useEffect, useState } from "react";
import { useFinance } from "../context/FinanceContext";
import "./TransactionForm.css";

export default function TransactionForm({initialValues, onSubmit, submitLabel}) {
    //console.log({initialValues, onSubmit, submitLabel});
    const { categories, categoriesLoading } = useFinance();
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState("");
    const [category, setCategory] = useState("");
    const [isPartial, setIsPartial] = useState(0);

    useEffect(() => {
        if (initialValues) {
            setAmount(initialValues.amount);
            setDate(initialValues.date);
            setCategory(initialValues.categoryid);
            setIsPartial(initialValues.is_partial);
        }
    }, [initialValues]);

    const [errors, setErrors] = useState({ amount: "", date: "", category: "" });

    const handleSubmit = (e) => {
        e.preventDefault();
        let newErrors = {};
        if (!amount || parseFloat(amount) <= 0)
            newErrors.amount = "Amount must be a positive number.";
        if (!category) 
            newErrors.category = "Please select a category for the transaction.";
        if (!date)
            newErrors.date = "Please select a date for the transaction.";

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;
        
        const transaction = {
            amount: parseFloat(amount),
            date: date,
            categoryid: parseInt(category),
            is_partial: isPartial
        };
        onSubmit(transaction);
        setAmount("");
        setDate("");
        setCategory("");
        setIsPartial(0);
    };

    return (
        <div className="form-container">
            <h2>{submitLabel}</h2>
            <form id="form" onSubmit={handleSubmit}>
                <div className="field">
                    <label htmlFor="amount">Amount:</label>
                    <input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
                    <div className="errmsg">{errors.amount}</div>
                </div>
                <div className="field">
                    <label htmlFor="date">Date:</label>
                    <input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
                    <div className="errmsg">{errors.date}</div>
                </div>
                <div className="field">
                    <label htmlFor="categories">Category:</label>
                    <select id="categories" value={category} onChange={e => setCategory(e.target.value)}>
                        <option value="">Select a category</option>
                        {categoriesLoading ? (
                            <option value="">Loading categories...</option>
                        ) : (
                            categories.map(cat => (
                                <option key={Number(cat.categoryid)} value={cat.categoryid}>{cat.name}</option>
                            ))
                        )}
                    </select>
                    <div className="errmsg">{errors.category}</div>
                </div>
                <div className="field">
                    <label htmlFor="isPartial">Is Partial:</label>
                    <input id="isPartial" type="checkbox" checked={Boolean(isPartial)} onChange={e => setIsPartial(e.target.checked ? 1 : 0)} />
                </div>
                <button type="submit">{submitLabel}</button>
            </form>
        </div>
    )
};