import { Link } from "react-router-dom";
import "../styles/PrivacyPolicy.css";

const TermsOfService = () => (
    <main className="privacy-policy-page">
        <article className="privacy-policy">
            <header className="privacy-policy-header">
                <p className="privacy-policy-eyebrow">Finance Manager</p>
                <h1>Terms of Service</h1>
                <p>Last updated: 15 October 2026</p>
                <p>
                    These terms apply when you access or use Finance Manager,
                    operated by Govardhan Gopu. By using the app, you agree to
                    these terms.
                </p>
            </header>

            <section>
                <h2>Using the app</h2>
                <p>
                    Finance Manager lets you record and review financial
                    activity, create budgets and goals, and explore financial
                    scenarios. You are responsible for the information you
                    enter and for keeping your account credentials secure.
                    Provide accurate information and use only accounts and
                    data you are authorized to access.
                </p>
            </section>

            <section>
                <h2>Not financial advice</h2>
                <p>
                    Summaries and projections are generated to help you explore
                    your entered data and possible scenarios. They may be
                    incomplete or inaccurate and are not financial, investment,
                    tax, or legal advice, a promise of future results, or a
                    substitute for advice from a qualified professional. You
                    are responsible for decisions you make using the app.
                </p>
            </section>

            <section>
                <h2>Acceptable use</h2>
                <p>
                    Do not misuse the app, attempt to access another person's
                    account or data, interfere with its operation or security,
                    or use it for unlawful purposes. Access may be suspended
                    where reasonably necessary to protect the app, its users,
                    or its providers.
                </p>
            </section>

            <section>
                <h2>Your account and data</h2>
                <p>
                    You may update your profile or delete your account through
                    the available app controls. Account deletion removes your
                    account and associated financial information from the
                    app's operational database. Provider-managed backups or
                    operational records may be governed by separate retention
                    practices. See the{" "}
                    <Link to="/privacy">Privacy Policy</Link> for details
                    about information handling.
                </p>
            </section>

            <section>
                <h2>Availability and changes</h2>
                <p>
                    The app is provided as-is and may change, be unavailable,
                    or be discontinued. I will make reasonable efforts to
                    protect the service, but cannot guarantee uninterrupted
                    availability or error-free operation. Do not rely on the
                    app as the only copy of important financial records.
                </p>
            </section>

            <section>
                <h2>Limitation</h2>
                <p>
                    To the extent permitted by applicable law, the app is
                    provided without warranties, and Govardhan Gopu is not
                    responsible for losses resulting from reliance on its
                    calculations, projections, or availability. Nothing in
                    these terms limits rights or responsibilities that cannot
                    be excluded under applicable law.
                </p>
            </section>

            <section>
                <h2>Contact and feedback</h2>
                <p>
                    For questions about these terms, contact{" "}
                    <a href="mailto:govardhangopu.dev@gmail.com">
                        govardhangopu.dev@gmail.com
                    </a>
                    . You can report bugs or share feedback through{" "}
                    <a
                        href="https://github.com/govardhangopu/financemanager/issues"
                        target="_blank"
                        rel="noreferrer"
                    >
                        the project’s GitHub issues
                    </a>
                    .
                </p>
            </section>

            <footer className="privacy-policy-footer">
                <Link to="/">Finance Manager</Link>
                <Link to="/privacy">Privacy Policy</Link>
                <a
                    href="https://github.com/govardhangopu/"
                    target="_blank"
                    rel="noreferrer"
                >
                    Maintainer profile
                </a>
            </footer>
        </article>
    </main>
);

export default TermsOfService;
