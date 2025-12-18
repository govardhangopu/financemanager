import { NavLink, useNavigate as navigate } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css"
import { useAuth } from "../context/AuthContext"

export default function Navbar() {
    const [isOpen, setOpen] = useState(false);
    const { user, logout } = useAuth();

    return (
        <div className="navbar">
            <div>Finance Manager</div>
            <nav>
                <ul className={isOpen ? "nav-links open" : "nav-links"} >
                    {user && <li><NavLink to="/dashboard">Home</NavLink></li>}
                    <li><NavLink to="/login">Login</NavLink></li>
                    <li><NavLink to="/signup">Sign Up</NavLink></li>
                    {user && <li><button onClick={logout}>Log Out</button></li>}
                </ul>
            </nav>
            <button className="hamburger" onClick={() => setOpen(!isOpen)}> ☰ </button>
        </div>
    )
}