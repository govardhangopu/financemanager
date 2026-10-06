import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../api/authApi";
//import "../styles/ForgotPassword.css";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        try {
            const data = await requestPasswordReset(email);
            setMessage(data.message);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to process your request."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="forgot-password-page">
            <div className="forgot-password-card">
                <h1>Forgot password?</h1>

                <p>
                    Enter your email address and we'll send you a
                    password reset link if an account exists.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="forgot-password-field">
                        <label htmlFor="email">Email</label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send reset link"}
                    </button>
                </form>

                {message && (
                    <p className="forgot-password-message">
                        {message}
                    </p>
                )}

                {error && (
                    <p className="forgot-password-error">
                        {error}
                    </p>
                )}

                <Link to="/login">
                    Back to login
                </Link>
            </div>
        </main>
    );
};

export default ForgotPassword;