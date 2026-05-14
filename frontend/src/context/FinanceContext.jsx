import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { getTransactions } from "../api/transactionApi.js";
import { getCategories } from "../api/categoriesApi.js";

const FinanceContext = createContext(null);

export const FinanceProvider = ({ children }) => {
    const { token } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [categories, setcategories] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [transactionsLoading, setTransactionsLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    useEffect(() => {
        refreshTransactions();
        refreshCategories();
    }, [token]);

    function refreshTransactions() {
        if (!token) return;
        getTransactions()
            .then(data => {
                setTransactions(data);
                setTransactionsLoading(false);
            })
            .catch(err => console.error(err));
    }

    function refreshCategories() {
        if (!token) return;
        getCategories()
            .then(data => {
                console.log(data);
                setcategories(data);
                setCategoriesLoading(false);
            })
            .catch(err => console.error(err));
    }

    const incomes = transactions.filter((record) => record.type === "income");
    const expenses = transactions.filter(record => record.type === "expense");

    const totalIncome = incomes.reduce((sum, income) => sum + parseFloat(income.amount), 0.0);
    const totalExpense = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0.0);
    const netWorth = totalIncome - totalExpense;

    return (
        <FinanceContext.Provider 
            value={
                { transactionsLoading, categoriesLoading, 
                    transactions, categories, incomes, expenses, budgets, netWorth, totalIncome, totalExpense,
                    refreshTransactions, refreshCategories }
                }>
            {children}
        </FinanceContext.Provider>
    )
}

/**
 * Makes the current user's finance context available in the page.
 * @example
 * import { useFinance }  from "../context/FinanceContext";
 * 
 * const Page = () => {
    const { transactionsLoading, categoriesLoading, transactions, categories, incomes, expenses, budgets, refreshTransactions, refreshCategories } = useFinance(); 
}
 */
export const useFinance = () => {
    return useContext(FinanceContext);
}