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

export function GenericChart({ labels, datasets, type="line", }) {
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
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => rupeeFormatter.format(value),
                },
            },
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) => rupeeFormatter.format(context.raw),
                },
            },
        },
    };
            
    return (
        labels.length > 0 
        ?  (
            type === "bar" 
            ? <Bar data={chartData} options={options} />
            : <Line data={chartData} options={options} />
        )
        : (<p height={"100%"}>No data to show for this time range.</p>)
    );
}