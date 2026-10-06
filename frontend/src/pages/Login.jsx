import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from '../components/Loader.jsx';
import { login } from "../api/authApi";
import "../styles/Auth.css";
import googleLogo from "../assets/google.svg";

const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { setUser, setToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const handleLogin = async () => {
        setLoading(true);

        try {
            const data = await login(username, password);
            const { user, token } = data;

            // console.log(user, token)

            setUser(user);
            setToken(token);

            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", token);

            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const googleError = searchParams.get("googleError");
        const googleLinked = searchParams.get("googleLinked");

        if (googleError) {
            alert(googleError);
        }

        if (googleLinked === "true") {
            alert("Google account connected successfully.");
        }

        if (googleError || googleLinked) {
            searchParams.delete("googleError");
            searchParams.delete("googleLinked");
            setSearchParams(searchParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

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

                        <button
                            className={`auth-button ${loading ? "disabled" : ""}`}
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? <Loader size="small" /> : "Login"}
                        </button>

                        <div className="auth-divider">
                            <span>OR</span>
                        </div>

                        <button
                            type="button"
                            className="auth-google-button"
                            onClick={() => {
                                window.location.href = `${API_URL}/users/google`;
                            }}
                        >
                            <img
                                src={googleLogo}
                                alt=""
                                className="google-logo"
                            />
                            <span>Continue with Google</span>
                        </button>

                        <Link to="/forgot-password">
                            Forgot password?
                        </Link>

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