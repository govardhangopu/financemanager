import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signUp } from "../api/authApi.js";
import "../styles/Auth.css";
import googleLogo from "../assets/google.svg";

const SignUp = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSignUp = async () => {
        try {
            const data = await signUp(name, email, username, password);
            console.log(data);
            navigate("/login");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="auth-page">
            <section className="auth-card">
                <article className="auth-visual">
                    <div>
                        <span className="auth-badge">Start fresh</span>
                        <h1>Create your budget planner in minutes.</h1>
                        <p>Set up your account, organize spending categories, and begin tracking your financial progress with clarity.</p>
                    </div>

                    <div className="auth-highlights">
                        <div className="auth-highlight">
                            <span className="auth-highlight-icon">$</span>
                            <div>
                                <strong>Plan smarter</strong>
                                <p>Build savings goals and monitor spending habits from day one.</p>
                            </div>
                        </div>
                        <div className="auth-highlight">
                            <span className="auth-highlight-icon">↗</span>
                            <div>
                                <strong>Watch progress grow</strong>
                                <p>See your financial story evolve with elegant, simple reports.</p>
                            </div>
                        </div>
                    </div>
                </article>

                <article className="auth-panel">
                    <div className="auth-panel-header">
                        <p className="auth-badge">Create account</p>
                        <h2>Sign up for your account</h2>
                        <p>Join and manage budgets, expenses, and savings in one place.</p>
                    </div>

                    <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleSignUp(); }}>
                        <div className="auth-field">
                            <label htmlFor="name">Full name</label>
                            <input type="text" name="name" id="name" placeholder="Enter your full name" onChange={(e) => setName(e.target.value)} />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="email">Email</label>
                            <input type="email" name="email" id="email" placeholder="Enter your email address" onChange={(e) => setEmail(e.target.value)} />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="username">Username</label>
                            <input type="text" name="username" id="username" placeholder="Choose a username" onChange={(e) => setUsername(e.target.value)} required />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="password">Password</label>
                            <input type="password" name="password" id="password" placeholder="Create a secure password" onChange={(e) => setPassword(e.target.value)} required />
                        </div>

                        <button className="auth-button" type="submit">Create account</button>

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

                        <p className="auth-switch">
                            Already have an account? <Link to="/login">Sign in</Link>
                        </p>
                    </form>
                </article>
            </section>
        </div>
    );
}

export default SignUp;