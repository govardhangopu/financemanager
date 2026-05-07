import { NavLink, useNavigate as navigate } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css"
import { useAuth } from "../context/AuthContext"

export default function Navbar() {
    const [isOpen, setOpen] = useState(false);
    const { token, logout } = useAuth();

    return (
        <div className="navbar">
            <div>Finance Manager</div>
            <nav>
                <ul className={isOpen ? "nav-links open" : "nav-links"} >
                    {token && <li><NavLink to="/dashboard">Home</NavLink></li>}
                    {!token && <li><NavLink to="/login">Login</NavLink></li>}
                    {!token && <li><NavLink to="/signup">Sign Up</NavLink></li>}
                    {token && <li><NavLink to="/addtransaction">Add Transaction</NavLink></li>}
                    {token && <li><button onClick={logout}>Log Out</button></li>}
                </ul>
            </nav>
            <button className="hamburger" onClick={() => setOpen(!isOpen)}> ☰ </button>
        </div>
    )
}