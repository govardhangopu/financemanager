import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

const baseURL = import.meta.env.VITE_API_URL;

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { setUser, setToken } = useAuth();
    const navigate = useNavigate();
    
    const handleLogin = async () => {
        try {
            const res = await axios.post(`${baseURL}/users/login`, { username, password });
            const { user, token } = res.data.token;
            setUser(user);
            setToken(token);
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", token);

            navigate("/dashboard"); 
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-card">
                <article className="auth-visual">
                    <div>
                        <span className="auth-badge">Finance Manager</span>
                        <h1>Welcome back to your financial command center.</h1>
                        <p>Track expenses, monitor budgets, and stay on top of your goals with a clean, modern dashboard.</p>
                    </div>

                    <div className="auth-highlights">
                        <div className="auth-highlight">
                            <span className="auth-highlight-icon">✓</span>
                            <div>
                                <strong>See your cash flow</strong>
                                <p>Instant insight into income, spending, and savings trends.</p>
                            </div>
                        </div>
                        <div className="auth-highlight">
                            <span className="auth-highlight-icon">✦</span>
                            <div>
                                <strong>Keep your budgets on track</strong>
                                <p>Organize every category and stay focused on your targets.</p>
                            </div>
                        </div>
                    </div>
                </article>

                <article className="auth-panel">
                    <div className="auth-panel-header">
                        <p className="auth-badge">Sign in</p>
                        <h2>Log in to continue</h2>
                        <p>Use your account to access your dashboard and budget insights.</p>
                    </div>

                    <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                        <div className="auth-field">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                name="username"
                                id="username"
                                placeholder="Enter your username"
                                onChange={(e) => setUsername(e.target.value)}
                                /*required*/
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                placeholder="Enter your password"
                                onChange={(e) => setPassword(e.target.value)}
                                /*required*/
                            />
                        </div>

                        <button className="auth-button" type="submit">Login</button>
                        <p className="auth-switch">
                            New here? <Link to="/signup">Create an account</Link>
                        </p>
                    </form>
                </article>
            </section>
        </main>
    );
}

export default Login;