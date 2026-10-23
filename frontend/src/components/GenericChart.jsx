import { useEffect, useRef } from "react";
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Tooltip,
    Legend
);

export function GenericChart({ labels, datasets, type = "line", options: customOptions }) {
    const wrapperRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        const dismissTooltipOutsideChart = (event) => {
            const chart = chartRef.current;
            if (!chart || wrapperRef.current?.contains(event.target)) return;
            if (chart.tooltip?.getActiveElements().length === 0) return;

            chart.setActiveElements([]);
            chart.tooltip.setActiveElements([], { x: 0, y: 0 });
            chart.update("none");
        };

        // Touch devices do not reliably dispatch mouseout after a tap.
        document.addEventListener("pointerdown", dismissTooltipOutsideChart, true);
        return () => document.removeEventListener("pointerdown", dismissTooltipOutsideChart, true);
    }, []);

    const chartData = {
        labels,
        datasets
    };

    const rupeeFormatter = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    });

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 12,
                },
            },
            y: {
                beginAtZero: false,
                ticks: {
                    callback: (value) => rupeeFormatter.format(value),
                },
            },
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) => `${context.dataset.label}: ${rupeeFormatter.format(context.raw)}`,
                },
            },
        },
    };

    const finalOptions = {
        ...options,
        ...customOptions,
        plugins: {
            ...options.plugins,
            ...customOptions?.plugins,
        },
    };

    return (
        <div ref={wrapperRef} style={{ flex: 1, minHeight: 0, position: 'relative', width: '100%', height: '100%', minWidth: '0' }} >
            {
                labels.length > 0 ? (
                    type === "bar"
                        ? <Bar ref={chartRef} data={chartData} options={finalOptions} />
                        : <Line ref={chartRef} data={chartData} options={finalOptions} />
                ) : (
                    <p>No data to show for this time range.</p>
                )
            }
        </div >
    );
}
