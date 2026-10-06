import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
    verifyPasswordResetToken,
    resetPassword
} from "../api/authApi";
//import "../styles/ResetPassword.css";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");

    const [loading, setLoading] = useState(true);
    const [validToken, setValidToken] = useState(false);
    const [error, setError] = useState("");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setError("Invalid or missing password reset link.");
                setLoading(false);
                return;
            }

            try {
                await verifyPasswordResetToken(token);
                setValidToken(true);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Invalid or expired password reset link."
                );
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setSubmitting(true);

        try {
            const data = await resetPassword(token, newPassword);

            setSuccess(data.message);

            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to reset your password."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <main className="reset-password-page">
                <div className="reset-password-card">
                    <p>Checking reset link...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="reset-password-page">
            <div className="reset-password-card">

                {!validToken ? (
                    <>
                        <h1>Invalid reset link</h1>

                        <p className="reset-password-error">
                            {error}
                        </p>

                        <Link to="/forgot-password">
                            Request a new reset link
                        </Link>
                    </>
                ) : (
                    <>
                        <h1>Reset your password</h1>

                        <p>
                            Choose a new password for your Finance Manager
                            account.
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div className="reset-password-field">
                                <label htmlFor="new-password">
                                    New password
                                </label>

                                <input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="reset-password-field">
                                <label htmlFor="confirm-password">
                                    Confirm password
                                </label>

                                <input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                            >
                                {submitting
                                    ? "Resetting..."
                                    : "Reset password"}
                            </button>
                        </form>

                        {error && (
                            <p className="reset-password-error">
                                {error}
                            </p>
                        )}

                        {success && (
                            <p className="reset-password-success">
                                {success}
                            </p>
                        )}
                    </>
                )}

            </div>
        </main>
    );
};

export default ResetPassword;