import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteTransaction } from "../api/transactionApi";
import { useFinance } from "../context/FinanceContext";
import Loader from "../components/Loader.jsx";
import "../styles/Transactions.css";

const PAGE_SIZE = 20;
const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

const dateOnly = (value) => String(value ?? "").slice(0, 10);
const formatDate = (value) => {
    const [year, month, day] = dateOnly(value).split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};
const today = () => {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
};

export default function Transactions() {
    const navigate = useNavigate();
    const { transactions, categories, transactionsLoading, refreshTransactions, loadErrors } = useFinance();
    const [search, setSearch] = useState("");
    const [type, setType] = useState("all");
    const [categoryId, setCategoryId] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [sort, setSort] = useState({ field: "date", direction: "desc" });
    const [page, setPage] = useState(1);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");

    const filteredTransactions = useMemo(() => {
        const query = search.trim().toLowerCase();
        return transactions
            .filter((transaction) => {
                const transactionDate = dateOnly(transaction.date);
                const matchesSearch = !query || [
                    transaction.category_name,
                    transaction.type,
                    transaction.amount,
                    transactionDate,
                ].some((value) => String(value ?? "").toLowerCase().includes(query));
                const matchesType = type === "all"
                    || (type === "uncategorized" ? !transaction.type : transaction.type === type);
                const matchesCategory = categoryId === "all"
                    || String(transaction.categoryid ?? "") === categoryId;

                return matchesSearch
                    && matchesType
                    && matchesCategory
                    && (!startDate || transactionDate >= startDate)
                    && (!endDate || transactionDate <= endDate);
            })
            .sort((a, b) => {
                const comparison = sort.field === "amount"
                    ? Number(a.amount) - Number(b.amount)
                    : dateOnly(a.date).localeCompare(dateOnly(b.date));
                return sort.direction === "asc" ? comparison : -comparison;
            });
    }, [transactions, search, type, categoryId, startDate, endDate, sort]);

    const totals = filteredTransactions.reduce((result, transaction) => {
        const amount = Number(transaction.amount) || 0;
        if (transaction.type === "income") result.income += amount;
        if (transaction.type === "expense") result.expense += amount;
        return result;
    }, { income: 0, expense: 0 });
    const pageCount = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
    const visibleTransactions = filteredTransactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const updateFilter = (setter) => (event) => {
        setter(event.target.value);
        setPage(1);
    };

    const toggleSort = (field) => {
        setSort((current) => ({
            field,
            direction: current.field === field && current.direction === "desc" ? "asc" : "desc",
        }));
        setPage(1);
    };

    const handleDelete = async (transaction) => {
        if (!window.confirm(`Delete this ${currency.format(Number(transaction.amount))} transaction?`)) return;
        setDeletingId(transaction.transactionid);
        setError("");
        try {
            await deleteTransaction(transaction.transactionid);
            refreshTransactions();
        } catch (deleteError) {
            console.error("Unable to delete transaction:", deleteError);
            setError("Could not delete this transaction. Please try again.");
        } finally {
            setDeletingId(null);
        }
    };

    const clearFilters = () => {
        setSearch("");
        setType("all");
        setCategoryId("all");
        setStartDate("");
        setEndDate("");
        setPage(1);
    };

    return (
        <div className="transactions-page">
            <header className="finance-page-header transactions-page-header">
                <div className="finance-page-heading">
                    <h1>Transactions</h1>
                    <p>Review, search, and manage your income and expenses.</p>
                </div>
                <button className="transactions-add-button" type="button" onClick={() => navigate("/addtransaction")}>
                    <span aria-hidden="true">+</span> Add Transaction
                </button>
            </header>

            <section className="transactions-summary" aria-label="Totals for filtered transactions">
                <article><span>Income</span><strong className="income">{currency.format(totals.income)}</strong></article>
                <article><span>Expenses</span><strong className="expense">{currency.format(totals.expense)}</strong></article>
                <article><span>Net flow</span><strong>{currency.format(totals.income - totals.expense)}</strong></article>
            </section>

            <section className="transactions-card">
                <div className="transactions-filter-grid">
                    <label className="transactions-search">
                        Search
                        <input type="search" value={search} onChange={updateFilter(setSearch)} placeholder="Category, amount, or date" />
                    </label>
                    <label>
                        Type
                        <select value={type} onChange={updateFilter(setType)}>
                            <option value="all">All types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                            <option value="uncategorized">Uncategorized</option>
                        </select>
                    </label>
                    <label>
                        Category
                        <select value={categoryId} onChange={updateFilter(setCategoryId)}>
                            <option value="all">All categories</option>
                            {categories.map((category) => (
                                <option key={category.categoryid} value={category.categoryid}>{category.name}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        From
                        <input type="date" value={startDate} max={endDate || undefined} onChange={updateFilter(setStartDate)} />
                    </label>
                    <label>
                        To
                        <input type="date" value={endDate} min={startDate || undefined} onChange={updateFilter(setEndDate)} />
                    </label>
                    <button className="transactions-clear-button" type="button" onClick={clearFilters}>Clear filters</button>
                </div>

                <div className="transactions-list-heading">
                    <div>
                        <h2>All transactions</h2>
                        <span>{filteredTransactions.length} {filteredTransactions.length === 1 ? "entry" : "entries"}</span>
                    </div>
                    <span className="transactions-totals-caption">Totals reflect the filtered results</span>
                </div>

                {error && <p className="transactions-error" role="alert">{error}</p>}
                {transactionsLoading ? <div className="transactions-loading"><Loader text="Loading transactions..." /></div> : loadErrors.transactions ? (
                    <p className="transactions-error" role="alert">{loadErrors.transactions}</p>
                ) : (
                    <>
                        <div className="transactions-table-scroll">
                            <table className="transactions-table">
                                <thead><tr>
                                    <th scope="col"><button type="button" onClick={() => toggleSort("date")}>Date {sort.field === "date" ? (sort.direction === "desc" ? "↓" : "↑") : ""}</button></th>
                                    <th scope="col">Category</th>
                                    <th scope="col">Type</th>
                                    <th scope="col"><button type="button" onClick={() => toggleSort("amount")}>Amount {sort.field === "amount" ? (sort.direction === "desc" ? "↓" : "↑") : ""}</button></th>
                                    <th scope="col"><div className="transaction-header-actions">Actions</div></th>
                                </tr></thead>
                                <tbody>
                                    {visibleTransactions.map((transaction) => {
                                        const scheduled = dateOnly(transaction.date) > today();
                                        return <tr key={transaction.transactionid}>
                                            <td>{formatDate(transaction.date)}
                                                {scheduled && <span className="transaction-scheduled-badge">Scheduled</span>}
                                            </td>
                                            <td>{transaction.category_name || <span className="transaction-uncategorized">Uncategorized</span>}</td>
                                            <td><span className={`transaction-type-badge ${transaction.type || "unknown"}`}>{transaction.type || "Uncategorized"}</span></td>
                                            <td className={`transaction-amount ${transaction.type || "unknown"}`}>
                                                {transaction.type === "income" ? "+" : transaction.type === "expense" ? "−" : ""}{currency.format(Number(transaction.amount) || 0)}
                                            </td>
                                            <td><div className="transaction-row-actions">
                                                <button type="button" onClick={() => navigate(`/edittransaction/${transaction.transactionid}`, { state: { returnTo: "/transactions" } })}>Edit</button>
                                                <button type="button" className="transaction-delete-button" disabled={deletingId === transaction.transactionid} onClick={() => handleDelete(transaction)}>{deletingId === transaction.transactionid ? "Deleting…" : "Delete"}</button>
                                            </div></td>
                                        </tr>;
                                    })}
                                </tbody>
                            </table>
                            {visibleTransactions.length === 0 && !transactionsLoading && (
                                <div className="transactions-empty-state">
                                    <h3>{transactions.length ? "No matching transactions" : "No transactions yet"}</h3>
                                    <p>{transactions.length ? "Try changing or clearing your filters." : "Add a transaction to start building your history."}</p>
                                    {transactions.length === 0 && <button className="transactions-add-button" type="button" onClick={() => navigate("/addtransaction")}>Add Transaction</button>}
                                </div>
                            )}
                        </div>
                        {filteredTransactions.length > PAGE_SIZE && <nav className="transactions-pagination" aria-label="Transaction pages">
                            <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
                            <span>Page {page} of {pageCount}</span>
                            <button type="button" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)}>Next</button>
                        </nav>}
                    </>
                )}
            </section>
        </div>
    );
}
