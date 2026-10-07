import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setPassword, changePassword, updateProfile, deleteAccount, startGoogleLink, unlinkGoogle, getAuthStatus } from "../api/authApi";
import "../styles/Settings.css";

const sections = [
    { id: "account", label: "Account" },
    { id: "appearance", label: "Appearance" },
    { id: "security", label: "Security" },
    { id: "about", label: "About" },
];

export default function Settings() {
    const { user, token, setUser, setToken } = useAuth();
    const { theme, changeTheme } = useTheme();
    const navigate = useNavigate();

    const [authStatus, setAuthStatus] = useState({
        authMethods: {
            password: false,
            google: false
        },
        googleEmail: null
    });
    const hasPasswordAuth = authStatus?.authMethods?.password === true;
    const hasGoogleAuth = authStatus?.authMethods?.google === true;
    const googleEmail = authStatus.googleEmail;
    const [authStatusLoading, setAuthStatusLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    const [activeSection, setActiveSection] = useState("account");
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const [editingProfile, setEditingProfile] = useState(false);
    const [name, setName] = useState(user?.name || "");
    const [username, setUsername] = useState(user?.username || "");
    const [email, setEmail] = useState(user?.email || "");

    const [savingProfile, setSavingProfile] = useState(false);

    // 1. DYNAMIC CHECKS: Derived directly from existing input state
    // Only show errors if the user has actually started typing in those fields
    const matchError = confirmPassword.length > 0 && newPassword !== confirmPassword;
    const sameError = newPassword.length > 0 && currentPassword === newPassword
        ? "New password must be different from your current password."
        : "";

    const scrollToSection = (id) => {
        document.getElementById(id)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (matchError || (hasPasswordAuth && sameError)) {
            return;
        }

        setPasswordLoading(true);

        try {
            if (hasPasswordAuth) {
                await changePassword(token, currentPassword, newPassword);
            } else {
                await setPassword(token, newPassword);
            }

            alert(
                hasPasswordAuth
                    ? "Password changed successfully."
                    : "Password set successfully."
            );
            const status = await getAuthStatus(token);
            setAuthStatus(status);

            setIsPasswordModalOpen(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Unable to update password.");
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();

        setSavingProfile(true);

        try {
            const response = await updateProfile(
                { name, username, email },
                token
            );

            setUser(response.user);

            localStorage.setItem(
                "user",
                JSON.stringify(response.user)
            );

            setEditingProfile(false);
        } catch (err) {
            console.error(err);
            alert(
                err.response?.data?.message ||
                "Failed to update profile."
            );
        } finally {
            setSavingProfile(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeletingAccount(true);
        setDeleteError("");

        try {
            await deleteAccount(token);

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            setUser(null);
            setToken(null);

            navigate("/login", { replace: true });
        } catch (err) {
            console.error(err);

            setDeleteError(
                err.response?.data?.message ||
                "Failed to delete account."
            );
        } finally {
            setDeletingAccount(false);
        }
    };

    const handleConnectGoogle = async () => {
        try {
            const { url } = await startGoogleLink(token);

            window.location.href = url;
        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.message ||
                "Unable to connect Google account."
            );
        }
    };

    const handleUnlinkGoogle = async () => {
        try {
            await unlinkGoogle(token);

            const status = await getAuthStatus(token);
            setAuthStatus(status);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Unable to disconnect Google account.");
        }
    };

    useEffect(() => {
        const loadAuthStatus = async () => {
            if (!token) return;

            try {
                const status = await getAuthStatus(token);
                setAuthStatus(status);
            } catch (err) {
                console.error("Failed to load authentication status:", err);
            } finally {
                setAuthStatusLoading(false);
            }
        };

        loadAuthStatus();
    }, [token]);

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

    useEffect(() => {
        const firstSection = document.getElementById(sections[0].id);
        const usesPageScroll = window.matchMedia("(max-width: 1024px)").matches;
        let scrollContainer = usesPageScroll ? null : firstSection?.parentElement;

        while (scrollContainer && scrollContainer !== document.body) {
            const { overflowY } = window.getComputedStyle(scrollContainer);
            const canScroll =
                /(auto|scroll|overlay)/.test(overflowY) &&
                scrollContainer.scrollHeight > scrollContainer.clientHeight;

            if (canScroll) break;
            scrollContainer = scrollContainer.parentElement;
        }

        const handleScroll = () => {
            const viewport = scrollContainer
                ? scrollContainer.getBoundingClientRect()
                : { top: 0, height: window.innerHeight };

            const activationLine = viewport.top + Math.min(120, viewport.height * 0.25);
            let currentSection = sections[0].id;

            sections.forEach((section) => {
                const element = document.getElementById(section.id);

                if (element && element.getBoundingClientRect().top <= activationLine) {
                    currentSection = section.id;
                }
            });

            const hasReachedBottom = scrollContainer
                ? scrollContainer.scrollTop + scrollContainer.clientHeight >=
                scrollContainer.scrollHeight - 1
                : window.scrollY + window.innerHeight >=
                document.documentElement.scrollHeight - 1;

            if (hasReachedBottom) {
                currentSection = sections[sections.length - 1].id;
            }

            setActiveSection(currentSection);
        };

        window.addEventListener("scroll", handleScroll);
        scrollContainer?.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
            scrollContainer?.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
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
                            <div>
                                <h2>Account</h2>
                                <p>Your account information.</p>
                            </div>
                        </div>

                        {!editingProfile ? (
                            <>
                                <div className="settings-account">
                                    <div className="settings-field">
                                        <span className="settings-field-label">
                                            Name
                                        </span>
                                        <p className="settings-field-value">
                                            {user?.name || "Not available"}
                                        </p>
                                    </div>

                                    <div className="settings-field">
                                        <span className="settings-field-label">
                                            Username
                                        </span>
                                        <p className="settings-field-value">
                                            {user?.username || "Not available"}
                                        </p>
                                    </div>

                                    <div className="settings-field">
                                        <span className="settings-field-label">
                                            Email
                                        </span>
                                        <p className="settings-field-value">
                                            {user?.email || "Not available"}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="settings-primary-button"
                                    onClick={() => setEditingProfile(true)}
                                >
                                    Edit profile
                                </button>
                            </>
                        ) : (
                            <form
                                className="settings-profile-form"
                                onSubmit={handleProfileSave}
                            >
                                <div className="settings-field">
                                    <label
                                        className="settings-field-label"
                                        htmlFor="profile-name"
                                    >
                                        Name
                                    </label>

                                    <input
                                        id="profile-name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>

                                <div className="settings-field">
                                    <label
                                        className="settings-field-label"
                                        htmlFor="profile-username"
                                    >
                                        Username
                                    </label>

                                    <input
                                        id="profile-username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>

                                <div className="settings-field">
                                    <label
                                        className="settings-field-label"
                                        htmlFor="profile-email"
                                    >
                                        Email
                                    </label>

                                    <input
                                        id="profile-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <div className="settings-form-actions">
                                    <button
                                        type="button"
                                        onClick={() => setEditingProfile(false)}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="settings-primary-button"
                                        disabled={savingProfile}
                                    >
                                        {savingProfile ? "Saving..." : "Save changes"}
                                    </button>
                                </div>
                            </form>
                        )}
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

                        {hasPasswordAuth ? (
                            <div className="settings-security">
                                <div>
                                    <span className="settings-field-label">
                                        Password
                                    </span>

                                    <p className="settings-option-description">
                                        Change your Finance Manager password.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="settings-secondary-button"
                                    onClick={() => setIsPasswordModalOpen(true)}
                                >
                                    Change password
                                </button>
                            </div>
                        ) : (
                            <div className="settings-security">
                                <div>
                                    <span className="settings-field-label">Password</span>
                                    <p className="settings-option-description">
                                        Add a password so you can also sign in without Google.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="settings-primary-button"
                                    onClick={() => setIsPasswordModalOpen(true)}
                                >
                                    Set password
                                </button>
                            </div>
                        )}

                        <div className="settings-security">
                            <div>
                                <span className="settings-field-label">
                                    Google account
                                </span>

                                {authStatusLoading ? (
                                    <p className="settings-option-description">
                                        Checking...
                                    </p>
                                ) : hasGoogleAuth ? (
                                    <p className="settings-option-description">
                                        Connected as {googleEmail}
                                    </p>
                                ) : (
                                    <p className="settings-option-description">
                                        Connect your Google account for easier sign-in.
                                    </p>
                                )}
                            </div>

                            {authStatusLoading ? (
                                <button
                                    type="button"
                                    className="settings-secondary-button"
                                    disabled
                                >
                                    Checking...
                                </button>
                            ) : hasGoogleAuth ? (
                                <button
                                    type="button"
                                    className="settings-secondary-button"
                                    onClick={handleUnlinkGoogle}
                                >
                                    Disconnect
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="settings-primary-button"
                                    onClick={handleConnectGoogle}
                                >
                                    Connect Google
                                </button>
                            )}
                        </div>

                        <div className="divider"></div>

                        <div className="settings-section">
                            <div className="settings-section-header">
                                <h4>Danger Zone</h4>
                                <p>Irreversible account actions.</p>
                            </div>

                            <div className="settings-danger">
                                <h3>Delete account</h3>

                                <p>
                                    Permanently delete your account and all associated financial data.
                                    This action cannot be undone.
                                </p>

                                <button type="button" className="settings-danger-button" onClick={() => setShowDeleteModal(true)}>
                                    Delete account
                                </button>
                            </div>
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
                                <p className="settings-field-value">
                                    Finance Manager
                                </p>
                            </div>

                            <div className="settings-field">
                                <span className="settings-field-label">
                                    Version
                                </span>
                                <p className="settings-field-value">
                                    v1.0.0
                                </p>
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
                                <h2>{hasPasswordAuth ? "Change password" : "Set password"}</h2>
                                <p>
                                    {hasPasswordAuth
                                        ? "Update your account password."
                                        : "Add a password to your account so you can sign in without Google."
                                    }
                                </p>
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
                            autoComplete="off"
                            onSubmit={handlePasswordChange}
                        >
                            {hasPasswordAuth && (
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
                                        autoComplete="off"
                                        placeholder="Enter your current password"
                                        value={currentPassword}
                                        onChange={(e) =>
                                            setCurrentPassword(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                            )}

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
                                    autoComplete="off"
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
                                    autoComplete="off"
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
                                    {passwordLoading
                                        ? hasPasswordAuth ? "Changing..." : "Setting..."
                                        : hasPasswordAuth ? "Change password" : "Set password"
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showDeleteModal && (
                <div className="settings-modal-overlay">
                    <div className="settings-modal">
                        <div className="settings-modal-header">
                            <div>
                                <h2>Delete account?</h2>
                                <p>
                                    This will permanently delete your account and all
                                    associated financial data.
                                </p>
                            </div>

                            <button
                                className="settings-modal-close"
                                onClick={() => setShowDeleteModal(false)}
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        <p className="settings-option-description">
                            This action cannot be undone. Your transactions, budgets,
                            scenarios, goals, and other account data will be permanently
                            removed.
                        </p>

                        {deleteError && (
                            <p className="error-message">
                                {deleteError}
                            </p>
                        )}

                        <div className="settings-modal-actions">
                            <button
                                className="settings-secondary-button"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={deletingAccount}
                            >
                                Cancel
                            </button>

                            <button
                                className="settings-danger-button"
                                onClick={handleDeleteAccount}
                                disabled={deletingAccount}
                            >
                                {deletingAccount ? "Deleting..." : "Delete account"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}