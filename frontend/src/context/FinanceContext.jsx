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
    const [loadErrors, setLoadErrors] = useState({});

    useEffect(() => {
        if (!token) {
            setTransactions([]);
            setcategories([]);
            setBudgets([]);
            setScenarios([]);
            setTransactionsLoading(false);
            setCategoriesLoading(false);
            setBudgetsLoading(false);
            setScenariosLoading(false);
            setLoadErrors({});
            return;
        }

        refreshTransactions();
        refreshCategories();
        refreshBudgets();
        refreshScenarios();
    }, [token]);

    function refreshTransactions() {
        if (!token) return Promise.resolve(null);
        setTransactionsLoading(true);
        setLoadErrors((previous) => ({ ...previous, transactions: null }));
        return getTransactions()
            .then((data) => {
                setTransactions(data);
                return data;
            })
            .catch((err) => {
                console.error(err);
                setLoadErrors((previous) => ({ ...previous, transactions: "Unable to load transactions." }));
                return null;
            })
            .finally(() => setTransactionsLoading(false));
    }

    function refreshCategories() {
        if (!token) return Promise.resolve(null);

        setCategoriesLoading(true);
        setLoadErrors((previous) => ({ ...previous, categories: null }));

        return getCategories()
            .then((data) => {
                setcategories(data);
                return data;
            })
            .catch((err) => {
                console.error(err);
                setLoadErrors((previous) => ({ ...previous, categories: "Unable to load categories." }));
                return null;
            })
            .finally(() => setCategoriesLoading(false));
    }

    function refreshBudgets() {
        if (!token) return Promise.resolve(null);

        setBudgetsLoading(true);
        setLoadErrors((previous) => ({ ...previous, budgets: null }));

        return getAllBudgets()
            .then((data) => {
                setBudgets(data);
                return data;
            })
            .catch((err) => {
                console.error(err);
                setLoadErrors((previous) => ({ ...previous, budgets: "Unable to load budgets." }));
                return null;
            })
            .finally(() => setBudgetsLoading(false));
    }

    function refreshScenarios() {
        if (!token) return Promise.resolve(null);

        setScenariosLoading(true);
        setLoadErrors((previous) => ({ ...previous, scenarios: null }));

        return getAllScenarios()
            .then((data) => {
                setScenarios(data);
                return data;
            })
            .catch((err) => {
                console.error(err);
                setLoadErrors((previous) => ({ ...previous, scenarios: "Unable to load scenarios." }));
                return null;
            })
            .finally(() => setScenariosLoading(false));
    }

    const incomes = transactions.filter(
        record => record.type === "income"
    );

    const expenses = transactions.filter(
        record => record.type === "expense"
    );

    const totalIncome = incomes.reduce(
        (sum, income) => sum + parseFloat(income.amount),
        0.0
    );

    const totalExpense = expenses.reduce(
        (sum, expense) => sum + parseFloat(expense.amount),
        0.0
    );

    const netWorth = totalIncome - totalExpense;

    return (
        <FinanceContext.Provider
            value={{
                transactionsLoading,
                categoriesLoading,
                budgetsLoading,
                scenariosLoading,
                loadErrors,

                transactions,
                categories,
                incomes,
                expenses,
                budgets,
                scenarios,

                netWorth,
                totalIncome,
                totalExpense,

                refreshTransactions,
                refreshCategories,
                refreshBudgets,
                refreshScenarios
            }}
        >
            {children}
        </FinanceContext.Provider>
    );
};

/**
 * Makes the current user's finance context available in the page.
 */
export const useFinance = () => {
    return useContext(FinanceContext);
};
