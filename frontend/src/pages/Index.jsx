import { Link } from "react-router-dom";
import "../styles/index.css";

export default function Index() {
    return (
        <div className="container">
            <h1>Welcome to Finance Manager</h1>
            <p>
                Manage your expenses, track your income, and stay financially healthy
                with ease.
            </p>
            <div className="button-group">
                <Link to="/login" className="button">Login</Link>
                <Link to="/signup" className="button">Sign Up</Link>
            </div>
        </div>
    );
}