import { useNavigate } from "react-router-dom";
import { useAuth }  from "../context/AuthContext";
import "../styles/Dashboard.css";

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <main>
            <div id="container">
                <div id="header">Welcome, <span id="name">{user.name}</span></div>
                <div id="dashboard">
                    <section className="section1">
                        <p className="heading">Net Worth</p>
                        <p className="net-worth">$100 K</p>
                    </section>
                    <section className="section2"></section>
                    <section className="section3"></section>
                    <section className="section4"></section>
                    <section className="section5"></section>
                    <section className="section6"></section>
                    <section className="section7"></section>
                </div>
            </div>
        </main>
    )
}

export default Dashboard;