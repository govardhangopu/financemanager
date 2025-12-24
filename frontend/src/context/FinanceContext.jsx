import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { getTransactions } from "../api/transactionApi.js"

const FinanceContext = createContext(null);

export const FinanceProvider = ({ children }) => {
    const { token } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [budgets, setBudgets] = useState([]);

    useEffect(() => {
        if (!token) return;
        getTransactions()
            .then(data => {
                console.log(data);
                setTransactions(data);
            })
            .catch(err => console.error(err));
    }, [token]);

    

    const incomes = transactions.filter((record) => record.type === "income");
    const expenses = transactions.filter(record => record.type === "expense");

    const totalIncome = incomes.reduce((sum, income) => sum + parseFloat(income.amount), 0.0);
    const totalExpense = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0.0);
    const netWorth = totalIncome - totalExpense;

    return (
        <FinanceContext.Provider 
            value={
                { transactions, incomes, expenses, budgets, netWorth, totalIncome, totalExpense }
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
    const { transactions, incomes, expenses, budgets } = useFinance(); 
}
 */
export const useFinance = () => {
    return useContext(FinanceContext);
}