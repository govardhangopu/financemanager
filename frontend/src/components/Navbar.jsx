import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
    const navigate = useNavigate();
    const [isOpen, setOpen] = useState(false);
    const location = useLocation();
    const { token, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        setOpen(false);
    }, [location]);

    return (
        <div className="navbar">
            <div>Finance Manager</div>
            <div className="navbar-right">
                <nav>
                    <ul className={isOpen ? "nav-links open" : "nav-links"} >
                        {token && <li><NavLink to="/dashboard">Dashboard</NavLink></li>}
                        {!token && <li><NavLink to="/login">Login</NavLink></li>}
                        {!token && <li><NavLink to="/signup">Sign Up</NavLink></li>}
                        {token && <li><NavLink to="/budgets">Budgets</NavLink></li>}
                        {token && <li><NavLink to="/forecast">Forecast</NavLink></li>}
                        {token && <li><NavLink to="/scenarios">Scenarios</NavLink></li>}
                        {token && <li><NavLink to="/goals">Goals</NavLink></li>}
                        {token && (
                            <button
                                type="button"
                                className="add-transaction-button"
                                onClick={() => navigate("/addtransaction")}
                            >
                                + Add Transaction
                            </button>
                        )}
                        {token && <li><NavLink to="/login" onClick={logout}>Log Out</NavLink></li>}
                    </ul>
                </nav>
                <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme">
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
                <button className="hamburger" onClick={() => setOpen(!isOpen)}> ☰ </button>
            </div>
        </div>
    )
}