import { useEffect, useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { addCategory } from "../api/categoriesApi";
import Loader from './Loader.jsx';
import "./TransactionForm.css";

export default function TransactionForm({initialValues, onSubmit, submitLabel, mode}) {
    //console.log({initialValues, onSubmit, submitLabel, mode});
    const { categories, categoriesLoading, refreshCategories } = useFinance();
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [category, setCategory] = useState("");
    const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
    const [newType, setNewType] = useState("");
    const [newCategoryName, setNewCategoryName] = useState("");
    const [parentCategory, setParentCategory] = useState();
    //const [isPartial, setIsPartial] = useState(0);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        //console.log("Selected category:", category);
        if (category === "new_category") setShowNewCategoryForm(true);
        else setShowNewCategoryForm(false);
        //console.log("Show new category form:", showNewCategoryForm);
    }, [newCategoryName, category]);

    useEffect(() => {
        if (initialValues) {
            setAmount(initialValues.amount);
            setDate(initialValues.date);
            setCategory(initialValues.categoryid);
            //setIsPartial(initialValues.is_partial);
        }
    }, [initialValues]);

    const [errors, setErrors] = useState({ amount: "", date: "", category: "" });

    const handleSubmit = async (e) => {
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
        
        setSaving(true);
        const transaction = {
            amount: parseFloat(amount),
            date: date,
            categoryid: parseInt(category),
            is_partial: mode === "partial" ? 1 : 0
        };
        await onSubmit(transaction);
        setAmount("");
        setDate("");
        setCategory("");
        //setIsPartial(0);
        setSaving(false);
    };

    return (
        <div className="form-container">
            (mode = {mode})
            <h2>{submitLabel}</h2>
            {saving ? <Loader overlay text="Saving transaction..." /> : <>
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
                    <select className={showNewCategoryForm ? "show-cat-form" : ""} id="categories" value={category} 
                        onChange={e => setCategory(e.target.value)}>
                        <option value="">Select a category</option>
                        {categoriesLoading ? (
                            <option value="">Loading categories...</option>
                        ) : (
                            categories.map(cat => (
                                <option key={Number(cat.categoryid)} value={cat.categoryid}>{cat.name}</option>
                            ))
                        )}
                        <option value="new_category">+ Create new category</option>
                    </select>
                    <div className={showNewCategoryForm ? "open" : "close"} id="new_category_form">
                        <div>
                            <input type="text" name="new_category_name" placeholder="Enter New Category" autoFocus 
                                value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
                            <div className="errmsg">{errors.newCategoryName}</div>
                        </div>
                        Parent Category:
                        <select value={parentCategory}
                            onChange={e => {
                                if (e.target.value != "") {
                                    const selectedParent = categories.find(cat => cat.categoryid === parseInt(e.target.value));
                                    setParentCategory(selectedParent.categoryid);
                                    const parentType = selectedParent.type;
                                    console.log("Selected parent category type:", parentType);
                                    setNewType(parentType);
                                } else {
                                    setParentCategory("");
                                    setNewType(null);
                                }
                            }} >
                            <option value="">None</option>
                            {categoriesLoading ? (
                            <option value="">Loading categories...</option>
                            ) : (
                                categories.map(cat => (
                                    <option key={Number(cat.categoryid)} value={cat.categoryid}>{cat.name}</option>
                                ))
                            )}
                        </select>
                        <span>
                            <input type="radio" className={parentCategory ? "typeDisabled" : ""} disabled={Boolean(parentCategory)}
                                name="type" id="income" onChange={e => setNewType("income")} checked={newType === "income"} />
                            <label htmlFor="income">Income</label>
                            <input type="radio" className={parentCategory ? "typeDisabled" : ""} disabled={Boolean(parentCategory)}
                                name="type" id="expense" onChange={e => setNewType("expense")} checked={newType === "expense"} />
                            <label htmlFor="expense">Expense</label>
                        </span>
                        
                        <button type="button" onClick={(e) => {
                            e.preventDefault();
                            if (newCategoryName) {
                                if (parentCategory) {
                                    const parent = categories.find(cat => cat.categoryid === parseInt(parentCategory)).name;
                                }
                                console.log("Creating new category:", newCategoryName, parent, newType);
                                const categoryData = {
                                    name: newCategoryName,
                                    type: newType,
                                    parent_categoryid: parentCategory ? parseInt(parentCategory) : null,
                                    is_partial: mode === "partial" ? 1 : 0
                                };
                                addCategory(categoryData).then(res => {
                                    console.log("Category created:", res);
                                    refreshCategories();
                                    //console.log("insertId:", res.insertId, "parentCategory:", parentCategory);
                                    setCategory(res.insertId);
                                    setShowNewCategoryForm(false);
                                    setNewCategoryName("");
                                    setParentCategory();
                                    setNewType("");
                                }).catch(err => {
                                    console.error("Error creating category:", err);
                                });
                            } else {
                                setErrors(prev => ({ ...prev, newCategoryName: "Category name cannot be empty." }));
                            }
                        }}>Create</button>
                    </div>
                    <div className="errmsg">{errors.category}</div>
                </div>
               {/*  <div className="field">
                    <label htmlFor="isPartial">Is Partial:</label>
                    <input id="isPartial" type="checkbox" checked={Boolean(isPartial)} onChange={e => setIsPartial(e.target.checked ? 1 : 0)} />
                </div> */}
                <button type="submit">{submitLabel}</button>
            </form>
            </>}
        </div>
    )
};