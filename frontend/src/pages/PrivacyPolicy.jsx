import { Link } from "react-router-dom";
import "../styles/PrivacyPolicy.css";

const PrivacyPolicy = () => (
    <main className="privacy-policy-page">
        <article className="privacy-policy">
            <header className="privacy-policy-header">
                <p className="privacy-policy-eyebrow">Finance Manager</p>
                <h1>Privacy Policy</h1>
                <p>Last updated: 15 October 2026</p>
                <p>
                    This policy explains how Govardhan Gopu ("I", "me", or "the
                    operator") handles information when you use Finance
                    Manager.
                </p>
            </header>

            <section>
                <h2>Information you provide</h2>
                <p>
                    Depending on how you use the app, it may store your name,
                    username, email address, and password hash; transactions
                    (including amounts, dates, and categories); budgets and
                    linked transactions; financial goals; and scenarios and
                    the changes you model in them. Financial entries may reveal
                    sensitive details about your finances. The app is
                    functional and processes information you enter; the
                    illustrative financial figures on the landing page are
                    examples and are not taken from user accounts.
                </p>
            </section>

            <section>
                <h2>Sign-in and account information</h2>
                <p>
                    You can create an account with a password or choose Google
                    sign-in. Passwords are stored as bcrypt hashes rather than
                    in plain text. If you connect Google, the app receives
                    basic profile and email information through Google sign-in
                    and stores the account-link information needed to support
                    that connection. Google handles its own processing under
                    its privacy policy.
                </p>
                <p>
                    The app uses a sign-in token in your browser's local
                    storage to keep you signed in. Do not use a shared or
                    untrusted device to access an account.
                </p>
            </section>

            <section>
                <h2>How information is used</h2>
                <p>
                    Information is used to create and secure your account,
                    provide the app's transaction, budgeting, goal, and
                    scenario features, calculate the summaries and projections
                    you request, and respond to password-reset requests. The
                    app's projections are estimates for planning and are not
                    financial advice.
                </p>
            </section>

            <section>
                <h2>Service providers and sharing</h2>
                <p>
                    The app uses Google when you choose Google sign-in or
                    account linking. Password-reset emails are sent through
                    Resend. The frontend is hosted on Vercel, the API is
                    hosted on Render, and the MySQL database is hosted on
                    Aiven. These providers may process information as needed
                    to host, operate, secure, and maintain their services.
                    Data locations and provider-specific retention practices
                    depend on the deployment configuration and each
                    provider's terms and policies.
                </p>
                <p>
                    I do not intentionally make your financial records public
                    or share them with other users, and the app does not
                    deliberately maintain activity logs. Hosting providers may
                    create operational logs or records as part of their
                    services. Information may also be disclosed when required
                    by law or to protect the service and its users.
                </p>
            </section>

            <section>
                <h2>Retention and deletion</h2>
                <p>
                    Account and financial information is kept while your
                    account is active so the app can provide its features. You
                    can request account deletion using the Delete account
                    control in Settings. Deleting your account deletes your
                    account and associated information stored by the app,
                    including your financial records. Provider-managed
                    backups or operational records may be subject to separate
                    retention practices and are not directly controlled by
                    the app.
                </p>
            </section>

            <section>
                <h2>Your choices and requests</h2>
                <p>
                    You can update profile information in Settings, disconnect
                    a linked Google account where available, and request
                    account deletion in the app. For privacy questions or
                    requests about your information, contact{" "}
                    <a href="mailto:govardhangopu.dev@gmail.com">
                        govardhangopu.dev@gmail.com
                    </a>
                    .
                </p>
            </section>

            <section>
                <h2>Security</h2>
                <p>
                    The app uses password hashing and authenticated requests
                    to protect accounts. No online service can guarantee
                    perfect security. Use a strong, unique password and
                    contact me if you believe your account or information has
                    been accessed without authorization.
                </p>
            </section>

            <section>
                <h2>Changes to this policy</h2>
                <p>
                    This policy may be updated as the app or its providers
                    change. The latest version and its update date will be
                    available on this page.
                </p>
            </section>

            <footer className="privacy-policy-footer">
                <Link to="/">Finance Manager</Link>
                <Link to="/terms">Terms of Service</Link>
                <Link to="/signup">Create an account</Link>
            </footer>
        </article>
    </main>
);

export default PrivacyPolicy;
