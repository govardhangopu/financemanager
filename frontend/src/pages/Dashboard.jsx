import { useNavigate } from "react-router-dom";
import { useAuth }  from "../context/AuthContext";
import "../styles/Dashboard.css";
import { 
    NetWorthCard, IncomeCard, ExpenseCard, TransactionHistoryCard, BudgetCard, 
    IncomeVsExpenseCard
 } from "../components/dashboard";

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <main>
            <div id="container">
                <div id="header">Welcome, <span id="name">{user.name}</span></div>
                <div id="dashboard">
                    <section className="net-worth"><NetWorthCard/></section>
                    <section className="incomes"><IncomeCard/></section>
                    <section className="expenses"><ExpenseCard/></section>
                    <section className="transaction-history"><TransactionHistoryCard/></section>
                    <section className="income-vs-expense"><IncomeVsExpenseCard/></section>
                    <section className="budgets"><BudgetCard/></section>
                </div>
            </div>
        </main>
    )
}

export default Dashboard;