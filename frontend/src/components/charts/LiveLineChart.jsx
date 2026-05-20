import React from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler,
);

/**
 * LiveLineChart - High performance line chart adapted for high-contrast light theme.
 * @param {string} title - Chart header text
 * @param {string} subtitle - BIS IS:10500 regulatory standards/guidelines text
 * @param {string} label - Data key in the payload (e.g., 'ph', 'turbidity')
 * @param {string} color - Hex/RGB border color for the line (e.g., '#3b82f6')
 * @param {Array} data - Rolling window data array
 * @param {string} unit - Measurement unit (e.g., 'pH', 'NTU')
 * @param {number} yMin - Y-axis minimum value
 * @param {number} yMax - Y-axis maximum value
 */
export default function LiveLineChart({
    title,
    subtitle,
    label,
    color,
    data,
    unit,
    yMin,
    yMax,
}) {
    const chartLabels = data.map((d) => {
        const date = new Date(d.timestamp * 1000);
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    });

    const chartValues = data.map((d) => d[label]);

    const chartData = {
        labels: chartLabels,
        datasets: [
            {
                data: chartValues,
                borderColor: color,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                fill: true,
                backgroundColor: `${color}0c`, // Soft light glow fill
                tension: 0.2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 0,
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true,
                mode: "index",
                intersect: false,
                backgroundColor: "#ffffff",
                titleColor: "#475569",
                bodyColor: "#0f172a",
                borderColor: "#cbd5e1",
                borderWidth: 1,
                bodyFont: {
                    family: "Outfit",
                    size: 12,
                },
                titleFont: {
                    family: "Outfit",
                    weight: "bold",
                    size: 11,
                },
                callbacks: {
                    label: (context) => ` ${context.parsed.y} ${unit || ""}`,
                },
            },
        },
        scales: {
            x: {
                display: false,
                grid: {
                    display: false,
                },
            },
            y: {
                min: yMin,
                max: yMax,
                grid: {
                    color: "rgba(15, 23, 42, 0.06)",
                    drawBorder: false,
                },
                ticks: {
                    color: "#475569",
                    font: {
                        family: "Outfit",
                        size: 10,
                    },
                    maxTicksLimit: 5,
                },
            },
        },
    };

    return (
        <div className="h-full flex flex-col justify-between">
            <div className="flex flex-col mb-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                        {title}
                    </h3>
                    {data.length > 0 && (
                        <div className="text-right">
                            <span className="text-2xl font-black text-gray-900 tracking-tight">
                                {data[data.length - 1][label]}
                            </span>
                            <span className="text-sm font-bold text-gray-700 ml-1 font-mono">
                                {unit}
                            </span>
                        </div>
                    )}
                </div>
                {subtitle && (
                    <div className="text-sm text-gray-600 font-mono mt-1">
                        {subtitle}
                    </div>
                )}
            </div>
            <div className="flex-1 min-h-[140px] relative">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
}
