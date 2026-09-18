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
    //console.log(props);

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
        <div style={{ flex: 1, minHeight: 0, position: 'relative', width: '100%' }}>
            {labels.length > 0 ? (
                type === "bar"
                    ? <Bar data={chartData} options={finalOptions} />
                    : <Line data={chartData} options={finalOptions} />
            ) : (
                <p>No data to show for this time range.</p>
            )}
        </div>
    );
}