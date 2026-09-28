import "../styles/Forecast.css"
import { useEffect, useState } from "react";
import { getForecast } from "../api/forecastApi";
import { GenericChart } from "../components/GenericChart";

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
                <div className="forecast-card">
                    <div className="forecast-message">
                        Loading your forecast...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="forecast-page">
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
                <div className="forecast-card">
                    <div className="forecast-header">
                        <div className="forecast-title-area">
                            <h1>Forecast</h1>
                            <p className="forecast-description">
                                See where your financial position could go if
                                nothing changes.
                            </p>
                        </div>
                    </div>

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

    const labels = forecast.projection.map((item) => item.month);
    const cumulativeNetFlow = forecast.projection.map((item) => item.cumulativeNetFlow);
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
            <div className="forecast-card">
                <div className="forecast-header">
                    <div className="forecast-title-area">
                        <h1>Forecast</h1>
                        <p className="forecast-description">
                            See where your cumulative net flow could go if your current
                            financial habits continue.
                        </p>
                    </div>

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

                <div className="forecast-summary">
                    <div>
                        <span>Average monthly net flow</span>
                        <strong>
                            {formatCurrency(
                                forecast.averageMonthlyNetFlow
                            )}
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
                    <p className="forecast-projection-context">
                        Projected over the next{" "}
                        {horizon / 12 === 1
                            ? "1 year"
                            : `${horizon / 12} years`}
                        {" "}using your average historical monthly net flow.
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