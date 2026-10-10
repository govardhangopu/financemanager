import { useAuth } from "../context/AuthContext";
import "../styles/Dashboard.css";
import {
    NetFlowCard, IncomeCard, ExpenseCard, TransactionHistoryCard, BudgetCard,
    IncomeVsExpenseCard, ScenarioDiscovery, ForecastDiscovery, GoalsDiscovery
} from "../components/dashboard";

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div className="dashboard-page">
            <div id="container">
                <div id="header">Welcome, <span id="name">{user.name}</span></div>
                <div id="dashboard">
                    <section className="net-flow"><NetFlowCard /></section>
                    <section className="incomes"><IncomeCard /></section>
                    <section className="expenses"><ExpenseCard /></section>
                    <section className="transaction-history"><TransactionHistoryCard /></section>
                    <section className="income-vs-expense"><IncomeVsExpenseCard /></section>
                    <section className="budgets"><BudgetCard /></section>
                    <div className="dashboard-discovery-row">
                        <ForecastDiscovery />
                        <GoalsDiscovery />
                        <ScenarioDiscovery />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard;