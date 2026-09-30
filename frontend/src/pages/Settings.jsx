import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { changePassword } from "../api/authApi";
import "../styles/Settings.css";

export default function Settings() {
    const { user, token } = useAuth();
    const { theme, changeTheme } = useTheme();
    const [activeSection, setActiveSection] = useState("account");
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);

    // 1. DYNAMIC CHECKS: Derived directly from existing input state
    // Only show errors if the user has actually started typing in those fields
    const matchError = confirmPassword.length > 0 && newPassword !== confirmPassword;
    const sameError = newPassword.length > 0 && currentPassword === newPassword
        ? "New password must be different from your current password."
        : "";

    const sections = [
        { id: "account", label: "Account" },
        { id: "appearance", label: "Appearance" },
        { id: "security", label: "Security" },
        { id: "about", label: "About" },
    ];

    const scrollToSection = (id) => {
        document.getElementById(id)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (showMatchError || showSameError) return; // Block submit if dynamic errors exist

        setPasswordLoading(true);

        try {
            await changePassword(token, currentPassword, newPassword);

            alert("Password changed successfully.");

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            setIsPasswordModalOpen(false);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to change password. Please try again.");
        } finally {
            setPasswordLoading(false);
        }
    };

    useEffect(() => {
        const sectionElements = sections
            .map(section => document.getElementById(section.id))
            .filter(Boolean);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: "-20% 0px -50% 0px",
            }
        );

        sectionElements.forEach(section => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    return (
        <main className="settings-page">

            <header className="settings-page-header">
                <h1>Settings</h1>
                <p>Manage your account and application preferences.</p>
            </header>

            <div className="settings-container">

                {/* Sidebar */}
                <aside className="settings-sidebar">
                    <nav>
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                type="button"
                                className={activeSection === section.id ? "active" : ""}
                                onClick={() => scrollToSection(section.id)}
                            >
                                {section.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Content */}
                <div className="settings-content">

                    <div id="account" className="settings-section">
                        <div className="settings-section-header">
                            <h2>Account</h2>
                            <p>Your account information.</p>
                        </div>

                        <div className="settings-account">
                            <div className="settings-field">
                                <span className="settings-field-label">
                                    Name
                                </span>
                                <span className="settings-field-value">
                                    {user?.name || "Not available"}
                                </span>
                            </div>

                            <div className="settings-field">
                                <span className="settings-field-label">
                                    Username
                                </span>
                                <span className="settings-field-value">
                                    {user?.username || "Not available"}
                                </span>
                            </div>

                            <div className="settings-field">
                                <span className="settings-field-label">
                                    Email
                                </span>
                                <span className="settings-field-value">
                                    {user?.email || "Not available"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div id="appearance" className="settings-section">
                        <div className="settings-section-header">
                            <h2>Appearance</h2>
                            <p>Customize how Finance Manager looks.</p>
                        </div>

                        <div className="settings-option">
                            <div>
                                <span className="settings-field-label">
                                    Theme
                                </span>
                                <p>
                                    Choose between light and dark mode.
                                </p>
                            </div>

                            <div className="settings-theme-options">
                                <button
                                    type="button"
                                    className={
                                        theme === "light" ? "active" : ""
                                    }
                                    onClick={() => changeTheme("light")}
                                >
                                    Light
                                </button>

                                <button
                                    type="button"
                                    className={
                                        theme === "dark" ? "active" : ""
                                    }
                                    onClick={() => changeTheme("dark")}
                                >
                                    Dark
                                </button>
                            </div>
                        </div>
                    </div>

                    <div id="security" className="settings-section">
                        <div className="settings-section-header">
                            <h2>Security</h2>
                            <p>Manage your account security.</p>
                        </div>

                        <div className="settings-security">
                            <div>
                                <span className="settings-field-label">Password</span>
                                <p className="settings-option-description">
                                    Keep your account protected with a strong password.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="settings-primary-button"
                                onClick={() => setIsPasswordModalOpen(true)}
                            >
                                Change password
                            </button>
                        </div>
                    </div>

                    <div id="about" className="settings-section">
                        <div className="settings-section-header">
                            <h2>About</h2>
                            <p>Information about Finance Manager.</p>
                        </div>

                        <div className="settings-about">
                            <div className="settings-about-intro">
                                <h3>Finance Manager</h3>
                                <p>
                                    Personal finance management made simple.
                                </p>
                            </div>

                            <div className="settings-field">
                                <span className="settings-field-label">
                                    Application
                                </span>
                                <span className="settings-field-value">
                                    Finance Manager
                                </span>
                            </div>

                            <div className="settings-field">
                                <span className="settings-field-label">
                                    Version
                                </span>
                                <span className="settings-field-value">
                                    v1.0.0
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            {isPasswordModalOpen && (
                <div
                    className="settings-modal-overlay"
                    onClick={() => setIsPasswordModalOpen(false)}
                >
                    <div
                        className="settings-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="settings-modal-header">
                            <div>
                                <h2>Change password</h2>
                                <p>Update your account password.</p>
                            </div>

                            <button
                                type="button"
                                className="settings-modal-close"
                                onClick={() => setIsPasswordModalOpen(false)}
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        <form
                            className="settings-security-form"
                            onSubmit={handlePasswordChange}
                        >
                            <div className="settings-field">
                                <label
                                    className="settings-field-label"
                                    htmlFor="current-password"
                                >
                                    Current password
                                </label>

                                <input
                                    id="current-password"
                                    type="password"
                                    placeholder="Enter your current password"
                                    value={currentPassword}
                                    onChange={(e) =>
                                        setCurrentPassword(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="settings-field">
                                <label
                                    className="settings-field-label"
                                    htmlFor="new-password"
                                >
                                    New password
                                </label>

                                <input
                                    id="new-password"
                                    type="password"
                                    placeholder="Enter your new password"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                    required
                                />
                                {sameError &&
                                    <p className="error-message">
                                        New password must be different from your current password.
                                    </p>
                                }
                            </div>

                            <div className="settings-field">
                                <label
                                    className="settings-field-label"
                                    htmlFor="confirm-password"
                                >
                                    Confirm new password
                                </label>

                                <input
                                    id="confirm-password"
                                    type="password"
                                    placeholder="Confirm your new password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    required
                                />
                                {matchError &&
                                    <p className="error-message">
                                        New passwords do not match.
                                    </p>
                                }

                            </div>

                            <div className="settings-modal-actions">
                                <button
                                    type="button"
                                    className="settings-secondary-button"
                                    onClick={() => setIsPasswordModalOpen(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="settings-primary-button"
                                    disabled={passwordLoading || matchError || sameError}
                                >
                                    {passwordLoading ? "Changing..." : "Change password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}