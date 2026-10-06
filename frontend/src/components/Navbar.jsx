import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "./Navbar.css"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
    const navigate = useNavigate();
    const [isOpen, setOpen] = useState(false);
    const [isAccountOpen, setAccountOpen] = useState(false);
    const accountMenuRef = useRef(null);
    const accountToggleRef = useRef(null);
    const location = useLocation();
    const { token, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        setOpen(false);
        setAccountOpen(false);
    }, [location]);

    useEffect(() => {
        const handlePointerDown = (event) => {
            if (!accountMenuRef.current?.contains(event.target)) {
                setAccountOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setAccountOpen(false);
                accountToggleRef.current?.focus();
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <div className="navbar">
            <div>Finance Manager</div>
            <div className="navbar-right">
                <nav>
                    <ul id="primary-navigation" className={isOpen ? "nav-links open" : "nav-links"}>
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
                        {token && (
                            <li className="account-menu" ref={accountMenuRef}>
                                <button
                                    type="button"
                                    className="account-menu-toggle"
                                    ref={accountToggleRef}
                                    aria-expanded={isAccountOpen}
                                    aria-controls="account-menu"
                                    onClick={() => setAccountOpen((open) => !open)}
                                >
                                    Account <span aria-hidden="true">▾</span>
                                </button>
                                <ul
                                    id="account-menu"
                                    className={`account-menu-items${isAccountOpen ? " open" : ""}`}
                                    hidden={!isAccountOpen}
                                >
                                    <li>
                                        <NavLink to="/settings" onClick={() => setAccountOpen(false)}>
                                            Settings
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/login" onClick={logout}>
                                            Log Out
                                        </NavLink>
                                    </li>
                                </ul>
                            </li>
                        )}
                    </ul>
                </nav>
                <button type="button" onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme">
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
                <button
                    type="button"
                    className="hamburger"
                    aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={isOpen}
                    aria-controls="primary-navigation"
                    onClick={() => setOpen((open) => !open)}
                >
                    ☰
                </button>
            </div>
        </div>
    )
}