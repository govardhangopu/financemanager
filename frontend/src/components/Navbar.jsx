import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css"
import { useAuth } from "../context/AuthContext"

export default function Navbar() {
    const [isOpen, setOpen] = useState(false);
    const location = useLocation();
    const { token, logout } = useAuth();

    useEffect(() => {
        setOpen(false);
    }, [location]);

    return (
        <div className="navbar">
            <div>Finance Manager</div>
            <nav>
                <ul className={isOpen ? "nav-links open" : "nav-links"} >
                    {token && <li><NavLink to="/dashboard">Dashboard</NavLink></li>}
                    {!token && <li><NavLink to="/login">Login</NavLink></li>}
                    {!token && <li><NavLink to="/signup">Sign Up</NavLink></li>}
                    {token && <li><NavLink to="/addtransaction">Add Transaction</NavLink></li>}
                    {token && <li><NavLink to="/budgets">Budgets</NavLink></li>}
                    {token && <li><NavLink to="/login" onClick={logout}>Log Out</NavLink></li>}
                </ul>
            </nav>
            <button className="hamburger" onClick={() => setOpen(!isOpen)}> ☰ </button>
        </div>
    )
}