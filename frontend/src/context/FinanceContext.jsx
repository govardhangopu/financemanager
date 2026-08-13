import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { getTransactions } from "../api/transactionApi.js";
import { getCategories } from "../api/categoriesApi.js";
import { getAllBudgets } from "../api/budgetsApi.js";
import { getAllScenarios } from "../api/scenarioApi.js";

const FinanceContext = createContext(null);

export const FinanceProvider = ({ children }) => {
    const { token } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [categories, setcategories] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [scenarios, setScenarios] = useState([]);
    const [transactionsLoading, setTransactionsLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [budgetsLoading, setBudgetsLoading] = useState(true);
    const [scenariosLoading, setScenariosLoading] = useState(true);

    useEffect(() => {
        refreshTransactions();
        refreshCategories();
        refreshBudgets();
        refreshScenarios();
    }, [token]);

    function refreshTransactions() {
        if (!token) return;
        getTransactions()
            .then(data => {
                //console.log(data);
                setTransactions(data);
                setTransactionsLoading(false);
            })
            .catch(err => console.error(err));
    }

    function refreshCategories() {
        if (!token) return;
        setCategoriesLoading(true);
        getCategories()
            .then(data => {
                //console.log(data);
                setcategories(data);
            })
            .catch(err => console.error(err))
            .finally(() => setCategoriesLoading(false));
    }

    function refreshBudgets() {
        if (!token) return;
        setBudgetsLoading(true);
        getAllBudgets()
            .then(data => {
                console.log(data);
                setBudgets(data);
            })
            .catch(err => console.error(err))
            .finally(() => setBudgetsLoading(false));
    }

    function refreshScenarios() {
        if (!token) return;
        getAllScenarios()
            .then(data => {
                console.log(data); 
                setScenarios(data);
                setScenariosLoading(false);
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
                { transactionsLoading, categoriesLoading, budgetsLoading, scenariosLoading,
                    transactions, categories, incomes, expenses, budgets, scenarios, netWorth, totalIncome, totalExpense,
                    refreshTransactions, refreshCategories, refreshBudgets, refreshScenarios }
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
    const { transactionsLoading, categoriesLoading, budgetsLoading, transactions, categories, incomes, expenses, budgets, refreshTransactions, refreshCategories, refreshBudgets } = useFinance(); 
}
 */
export const useFinance = () => {
    return useContext(FinanceContext);
}