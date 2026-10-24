import "../styles/Forecast.css"
import { useEffect, useState } from "react";
import { getForecast } from "../api/forecastApi";
import { GenericChart } from "../components/GenericChart";
import Loader from "../components/Loader";

const horizons = [
    { label: "1Y", months: 12 },
    { label: "3Y", months: 36 },
    { label: "5Y", months: 60 },
    { label: "10Y", months: 120 },
];

const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 0,
    })}`;

export default function Forecast() {
    const [horizon, setHorizon] = useState(12);
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadForecast = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getForecast(horizon);
                setForecast(data);
            } catch (err) {
                console.error(err);
                setError("Unable to load your forecast.");
            } finally {
                setLoading(false);
            }
        };

        loadForecast();
    }, [horizon]);

    if (loading) {
        return (
            <div className="forecast-page">
                <header className="finance-page-header forecast-page-header">
                    <div className="finance-page-heading">
                        <h1>Forecast</h1>
                        <p>See where your financial position could go if nothing changes.</p>
                    </div>
                    <div className="forecast-controls-row">
                        <div className="forecast-horizon-controls">
                            {horizons.map((item) => (
                                <button
                                    key={item.months}
                                    type="button"
                                    className={horizon === item.months ? "active" : ""}
                                    onClick={() => setHorizon(item.months)}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>
                <div className="forecast-card">
                    <div className="forecast-loading-shell">
                        <Loader text="Loading your forecast..." />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="forecast-page">
                <header className="finance-page-header forecast-page-header">
                    <div className="finance-page-heading">
                        <h1>Forecast</h1>
                        <p>See where your financial position could go if nothing changes.</p>
                    </div>
                </header>
                <div className="forecast-card">
                    <div className="forecast-message">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    if (!forecast?.hasData) {
        return (
            <div className="forecast-page">
                <header className="finance-page-header forecast-page-header">
                    <div className="finance-page-heading">
                        <h1>Forecast</h1>
                        <p>
                            See where your financial position could go if
                            nothing changes.
                        </p>
                    </div>
                </header>
                <div className="forecast-card">
                    <div className="forecast-empty-state">
                        <h2>Not enough history yet</h2>
                        <p>
                            Add some transactions first. Once there is enough
                            financial history, Forecast can project your future
                            cumulative net flow.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const labels = ["Today", ...forecast.projection.map((item) => item.date ?? item.month)];
    const cumulativeNetFlow = [
        forecast.startingCumulativeNetFlow,
        ...forecast.projection.map((item) => item.cumulativeNetFlow),
    ];
    const linkColor = getComputedStyle(document.documentElement).getPropertyValue("--link-color").trim();

    const datasets = [
        {
            label: "Projected cumulative net flow",
            data: cumulativeNetFlow,
            tension: 0.3,

            borderColor: linkColor,
            backgroundColor: `${linkColor}`,

            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,

            fill: true,
        },
    ];

    return (
        <div className="forecast-page">
            <header className="finance-page-header forecast-page-header">
                <div className="finance-page-heading">
                    <h1>Forecast</h1>
                    <p>
                        See where your cumulative net flow could go if your
                        current financial habits continue.
                    </p>
                </div>
                <div className="forecast-controls-row">
                    <div className="forecast-horizon-controls">
                        {horizons.map((item) => (
                            <button
                                key={item.months}
                                type="button"
                                className={
                                    horizon === item.months
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setHorizon(item.months)
                                }
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>
            <div className="forecast-card">
                <div className="forecast-summary">
                    <div>
                        <span>{forecast.isScheduledOnly ? "Historical average" : "Average monthly net flow"}</span>
                        <strong>
                            {forecast.isScheduledOnly ? "Not available" : formatCurrency(forecast.averageMonthlyNetFlow)}
                        </strong>
                    </div>

                    <div>
                        <span>Projected cumulative net flow</span>
                        <strong>
                            {formatCurrency(
                                forecast.summary.finalCumulativeNetFlow
                            )}
                        </strong>
                    </div>
                </div>

                <div className="forecast-projection-section">
                    {forecast.isScheduledOnly && (
                        <div className="forecast-history-notice" role="status">
                            Scheduled transactions are shown on their dates. Add past transactions to enable trend forecasting.
                        </div>
                    )}
                    <p className="forecast-projection-context">
                        Projected over the next{" "}
                        {horizon / 12 === 1
                            ? "1 year"
                            : `${horizon / 12} years`}
                        {" "}{forecast.isScheduledOnly
                            ? "using scheduled transactions only."
                            : "using your average historical monthly net flow and scheduled transactions."}
                    </p>
                    <div className="forecast-projection-chart">
                        <GenericChart
                            type="line"
                            labels={labels}
                            datasets={datasets}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
