
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "./Navbar.css";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const [isOpen, setOpen] = useState(false);
    const [isAccountOpen, setAccountOpen] = useState(false);

    const accountMenuRef = useRef(null);
    const accountToggleRef = useRef(null);

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

    const closeMenus = () => {
        setOpen(false);
        setAccountOpen(false);
    };

    return (
        <header className="navbar">
            <Link
                to={token ? "/dashboard" : "/"}
                className="navbar-brand"
                aria-label="Finance Manager home"
                onClick={closeMenus}
            >
                <span className="brand-mark" aria-hidden="true">
                    f.
                </span>
                <span className="brand-name">
                    Finance<span>Manager</span>
                </span>
            </Link>

            <div className="navbar-right">
                <nav
                    className={`navbar-navigation${isOpen ? " is-open" : ""}`}
                    aria-label="Main navigation"
                >
                    <ul id="primary-navigation" className="nav-links">
                        {token ? (
                            <>
                                <li>
                                    <NavLink to="/dashboard">Dashboard</NavLink>
                                </li>
                                <li>
                                    <NavLink to="/categories">Categories</NavLink>
                                </li>
                                <li>
                                    <NavLink to="/budgets">Budgets</NavLink>
                                </li>
                                <li>
                                    <NavLink to="/forecast">Forecast</NavLink>
                                </li>
                                <li>
                                    <NavLink to="/scenarios">Scenarios</NavLink>
                                </li>
                                <li>
                                    <NavLink to="/goals">Goals</NavLink>
                                </li>

                                <li className="mobile-add-transaction">
                                    <button
                                        type="button"
                                        className="add-transaction-button"
                                        onClick={() => {
                                            closeMenus();
                                            navigate("/addtransaction");
                                        }}
                                    >
                                        <span aria-hidden="true">+</span>
                                        Add Transaction
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <NavLink to="/login">Login</NavLink>
                                </li>
                                <li>
                                    <NavLink to="/signup">Sign Up</NavLink>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>

                {token && (
                    <button
                        type="button"
                        className="add-transaction-button desktop-add-transaction"
                        onClick={() => {
                            closeMenus();
                            navigate("/addtransaction");
                        }}
                    >
                        <span aria-hidden="true">+</span>
                        Add Transaction
                    </button>
                )}

                {token && (
                    <div className="account-menu" ref={accountMenuRef}>
                        <button
                            type="button"
                            className={`account-menu-toggle${isAccountOpen ? " is-open" : ""}`}
                            ref={accountToggleRef}
                            aria-expanded={isAccountOpen}
                            aria-controls="account-menu"
                            onClick={() => setAccountOpen((open) => !open)}
                        >
                            <span className="account-avatar" aria-hidden="true">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    <circle cx="12" cy="8" r="3.5" />
                                    <path d="M5 20c.5-3.5 3.2-5.5 7-5.5s6.5 2 7 5.5" />
                                </svg>
                            </span>
                            {/* <span className="account-label">Account</span> */}
                            <span className="account-chevron" aria-hidden="true">
                                ▾
                            </span>
                        </button>

                        <ul
                            id="account-menu"
                            className="account-menu-items"
                            hidden={!isAccountOpen}
                        >
                            <li className="account-menu-heading">
                                Your account
                            </li>
                            <li>
                                <NavLink
                                    to="/settings"
                                    onClick={() => setAccountOpen(false)}
                                >
                                    <span aria-hidden="true">⚙</span>
                                    Settings
                                </NavLink>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    className="logout-button"
                                    onClick={() => {
                                        closeMenus();
                                        logout();
                                        navigate("/login");
                                    }}
                                >
                                    <span aria-hidden="true">↪</span>
                                    Log Out
                                </button>
                            </li>
                        </ul>
                    </div>
                )}

                <button
                    type="button"
                    onClick={toggleTheme}
                    className="theme-toggle-btn"
                    aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
                    title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
                >
                    <span key={theme} className="theme-toggle-icon" aria-hidden="true">
                        {theme === "light" ? "☾" : "☀"}
                    </span>
                </button>

                <button
                    type="button"
                    className={`hamburger${isOpen ? " is-open" : ""}`}
                    aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={isOpen}
                    aria-controls="primary-navigation"
                    onClick={() => {
                        setOpen((open) => !open);
                        setAccountOpen(false);
                    }}
                >
                    <span />
                    <span />
                    <span />
                </button>
            </div>
        </header>
    );
}
