
import { Link } from "react-router-dom";
import "../styles/index.css";

const features = [
    {
        icon: "↗",
        title: "Understand your money",
        description:
            "See where your money comes from, where it goes, and how your financial position changes.",
        className: "income",
    },
    {
        icon: "◷",
        title: "Plan with confidence",
        description:
            "Set budgets and financial goals, then track your progress as life happens.",
        className: "planning",
    },
    {
        icon: "⌁",
        title: "Explore what’s possible",
        description:
            "Experiment with financial scenarios before committing to real-world decisions.",
        className: "scenarios",
    },
];

export default function Index() {
    return (
        <div className="landing-page">

            <section className="landing-hero">
                <div className="hero-copy">
                    <div className="hero-eyebrow">
                        <span className="eyebrow-dot" />
                        YOUR MONEY. YOUR DIRECTION.
                    </div>

                    <h1>
                        Make your money
                        <br />
                        <span>make sense.</span>
                    </h1>

                    <p className="hero-description">
                        A clearer picture of your finances. A smarter way to
                        plan. More confidence in the decisions that shape your
                        future.
                    </p>

                    <div className="hero-actions">
                        <Link to="/signup" className="hero-primary">
                            Take control of your money
                            <span aria-hidden="true">→</span>
                        </Link>
                        <Link to="/login" className="hero-secondary">
                            I already have an account
                        </Link>
                    </div>

                    <div className="hero-note">
                        <span aria-hidden="true">✳</span>
                        Your finances, organised around you.
                    </div>
                </div>

                <div
                    className="hero-visual"
                    aria-label="Illustrative preview of the Finance Manager dashboard"
                >
                    <div className="visual-glow" />

                    <div className="dashboard-preview">
                        <div className="preview-topbar">
                            <div className="preview-brand">
                                <span className="preview-brand-mark">f.</span>
                                <span>Overview</span>
                            </div>
                            <span className="preview-period">THIS MONTH</span>
                        </div>

                        <div className="preview-greeting">
                            <div>
                                <p>Your financial picture</p>
                                <h2>See the bigger picture.</h2>
                            </div>
                            <span className="preview-status">
                                <span /> OVERVIEW
                            </span>
                        </div>

                        <div className="preview-balance">
                            <div className="preview-balance-heading">
                                <span>Net flow</span>
                                <span className="preview-mini-icon">↗</span>
                            </div>
                            <div className="preview-balance-value">
                                ₹24,850
                            </div>
                            <div className="preview-balance-caption">
                                <span>Illustrative monthly surplus</span>
                            </div>

                            <div className="preview-chart" aria-hidden="true">
                                {[32, 46, 39, 61, 48, 72, 57, 84, 66, 95, 76, 100].map(
                                    (height, index) => (
                                        <div
                                            className={`preview-bar ${
                                                index === 9 ? "highlight" : ""
                                            }`}
                                            key={index}
                                            style={{ height: `${height}%` }}
                                        />
                                    )
                                )}
                            </div>
                            <div className="preview-chart-labels">
                                <span>WEEK 1</span>
                                <span>WEEK 2</span>
                                <span>WEEK 3</span>
                                <span>WEEK 4</span>
                            </div>
                        </div>

                        <div className="preview-stats">
                            <div className="preview-stat">
                                <div className="preview-stat-label">
                                    <span className="stat-dot income-dot" />
                                    Income
                                </div>
                                <strong>₹42,000</strong>
                                <span className="preview-stat-caption">
                                    Money coming in
                                </span>
                            </div>

                            <div className="preview-stat">
                                <div className="preview-stat-label">
                                    <span className="stat-dot expense-dot" />
                                    Expenses
                                </div>
                                <strong>₹17,150</strong>
                                <span className="preview-stat-caption">
                                    Money going out
                                </span>
                            </div>
                        </div>

                        <div className="preview-bottom">
                            <div className="preview-bottom-icon">◎</div>
                            <div>
                                <strong>Your next financial move</strong>
                                <p>Review your goals and spending plans</p>
                            </div>
                            <span aria-hidden="true">→</span>
                        </div>
                    </div>

                    <div className="floating-note floating-note-top">
                        <span className="floating-note-icon">↗</span>
                        <span>
                            <small>Financial clarity</small>
                            <strong>One place. The full picture.</strong>
                        </span>
                    </div>

                    <div className="floating-note floating-note-bottom">
                        <span className="floating-note-icon goal-icon">◎</span>
                        <span>
                            <small>Built for your future</small>
                            <strong>Plan beyond today.</strong>
                        </span>
                    </div>
                </div>
            </section>

            <section className="landing-features" id="features">
                <div className="features-heading">
                    <span className="section-eyebrow">MORE THAN TRACKING</span>
                    <h2>
                        From knowing your numbers
                        <br />
                        to shaping your future.
                    </h2>
                    <p>
                        Your financial life is connected. Your tools should be
                        too.
                    </p>
                </div>

                <div className="feature-grid">
                    {features.map((feature, index) => (
                        <article
                            className={`feature-card feature-${feature.className}`}
                            key={feature.title}
                        >
                            <div className="feature-card-top">
                                <span className="feature-icon" aria-hidden="true">
                                    {feature.icon}
                                </span>
                                <span className="feature-number">
                                    0{index + 1}
                                </span>
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                            <span className="feature-line" />
                        </article>
                    ))}
                </div>
            </section>

            <section className="landing-cta">
                <div>
                    <span className="section-eyebrow">START WHERE YOU ARE</span>
                    <h2>A better relationship with money starts here.</h2>
                    <p>
                        Build awareness today. Make more informed decisions
                        tomorrow.
                    </p>
                </div>
                <Link to="/signup" className="hero-primary">
                    Get started <span aria-hidden="true">→</span>
                </Link>
            </section>

            <footer className="landing-footer">
                <Link to="/" className="landing-brand footer-brand">
                    <span className="brand-mark">f.</span>
                    <span>Finance Manager</span>
                </Link>
                <span>Make every financial decision more intentional.</span>
                <div className="landing-footer-links">
                    <Link to="/privacy">Privacy</Link>
                    <Link to="/terms">Terms</Link>
                    <a
                        href="https://github.com/govardhangopu/financemanager/issues"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Feedback
                    </a>
                    <Link to="/login">Log in →</Link>
                </div>
            </footer>
        </div>
    );
}
