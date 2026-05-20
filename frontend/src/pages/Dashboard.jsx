import React, { useState, useEffect } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import LiveLineChart from "../components/charts/LiveLineChart";
import ControlPanel from "../components/ControlPanel";

const WEBSOCKET_URL = "ws://localhost:8000/ws";

export default function Dashboard() {
    const { status, lastMessage } = useWebSocket(WEBSOCKET_URL);
    const [dataWindow, setDataWindow] = useState([]);
    const [anomalyLogs, setAnomalyLogs] = useState([]);

    // Maintain a rolling window of the latest 60 telemetry samples
    useEffect(() => {
        if (lastMessage && lastMessage.ph !== undefined) {
            setDataWindow((prev) => {
                const next = [...prev, lastMessage];
                return next.slice(-60); // Retain latest 60 packets
            });

            // Record any anomaly flagged by the machine learning model
            if (lastMessage.ml_anomaly === true) {
                setAnomalyLogs((prev) => {
                    const timestamp = new Date().toLocaleTimeString();
                    const newLog = `[${timestamp}] AI Engine: Outlier deviation flagged in sensor telemetry.`;
                    const next = [newLog, ...prev];
                    return next.slice(0, 10); // Retain latest 10 logs
                });
            }
        }
    }, [lastMessage]);

    // Determine if a contamination event is actively occurring based on pH threshold
    const isCurrentlyAnomaly =
        dataWindow.length > 0 && dataWindow[dataWindow.length - 1].ph < 6.0;

    const formatTime = (timestamp) => {
        // Multiply by 1000 to convert Python seconds to JavaScript milliseconds
        const jsTimestamp = timestamp * 1000;

        return new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            fractionalSecondDigits: 3,
            hour12: true,
        }).format(new Date(jsTimestamp));
    };

    const getStatusStyles = () => {
        switch (status) {
            case "open":
                return {
                    dotClass: "bg-emerald-600 animate-pulse",
                    badgeText: "CONNECTED",
                    badgeClass: "bg-white text-emerald-700 border-gray-300",
                };
            case "connecting":
                return {
                    dotClass: "bg-amber-600 animate-bounce",
                    badgeText: "CONNECTING...",
                    badgeClass: "bg-white text-amber-700 border-gray-300",
                };
            case "closed":
                return {
                    dotClass: "bg-red-600 animate-ping",
                    badgeText: "DISCONNECTED",
                    badgeClass: "bg-white text-red-700 border-gray-300",
                };
            case "error":
            default:
                return {
                    dotClass: "bg-red-700",
                    badgeText: "CONNECTION ERROR",
                    badgeClass: "bg-white text-red-800 border-gray-300",
                };
        }
    };

    const statusStyle = getStatusStyles();
    const latestData = dataWindow[dataWindow.length - 1] || {};

    return (
        <div className="min-h-screen bg-slate-50 p-6 text-gray-900">
            {/* Main Container */}
            <div className="max-w-7xl mx-auto space-y-6 relative z-10">
                {/* Top Header */}
                <header className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-300 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex items-center justify-center w-12 h-12 rounded-none bg-blue-900 border border-blue-950">
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-wide text-gray-900 uppercase">
                                AquaFlow Sentinel
                            </h1>
                            <p className="text-sm text-gray-700 font-bold">
                                Urban Local Bodies (ULB) Water Governance &
                                Real-Time Telemetry Platform
                            </p>
                        </div>
                    </div>

                    {/* Connection Status Badge */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 font-mono hidden sm:inline">
                            {WEBSOCKET_URL}
                        </span>
                        <div
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-none border text-sm font-bold tracking-wider ${statusStyle.badgeClass}`}
                        >
                            <span
                                className={`w-2.5 h-2.5 rounded-full ${statusStyle.dotClass}`}
                            />
                            {statusStyle.badgeText}
                        </div>
                    </div>
                </header>

                {/* Governance Control Center with CSV Export */}
                <ControlPanel status={status} dataWindow={dataWindow} />

                {/* 2x2 Live Chart Grid */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* pH Chart */}
                    <article className="p-6 rounded-none bg-white border border-gray-300 shadow-none">
                        <LiveLineChart
                            title="Potential of Hydrogen (pH)"
                            subtitle="6.5 - 8.5 (Acceptable)"
                            label="ph"
                            color="#2563eb" // Blue-600
                            data={dataWindow}
                            unit="pH"
                            yMin={4.0}
                            yMax={9.0}
                        />
                    </article>

                    {/* Turbidity Chart */}
                    <article className="p-6 rounded-none bg-white border border-gray-300 shadow-none">
                        <LiveLineChart
                            title="Turbidity"
                            subtitle="Max 1 NTU (Acceptable) / 5 NTU (Permissible)"
                            label="turbidity"
                            color="#d97706" // Amber-600
                            data={dataWindow}
                            unit="NTU"
                            yMin={0.0}
                            yMax={15.0}
                        />
                    </article>

                    {/* Dissolved Oxygen (DO) Chart */}
                    <article className="p-6 rounded-none bg-white border border-gray-300 shadow-none">
                        <LiveLineChart
                            title="Dissolved Oxygen (DO)"
                            subtitle="Operational Network Health Indicator"
                            label="do"
                            color="#059669" // Emerald-600
                            data={dataWindow}
                            unit="mg/L"
                            yMin={2.0}
                            yMax={10.0}
                        />
                    </article>

                    {/* Total Dissolved Solids (TDS) Chart */}
                    <article className="p-6 rounded-none bg-white border border-gray-300 shadow-none">
                        <LiveLineChart
                            title="Total Dissolved Solids (TDS)"
                            subtitle="Max 500 mg/L (Acceptable) / 2000 mg/L (Permissible)"
                            label="tds"
                            color="#7c3aed" // Violet-600
                            data={dataWindow}
                            unit="mg/L"
                            yMin={200.0}
                            yMax={700.0}
                        />
                    </article>
                </section>

                {/* Secondary Info, Logs, and Alarm Status (Bento Grid) */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Real-time Alert Board */}
                    <div
                        className={`p-6 rounded-none border transition-all duration-150 bg-white shadow-none h-[220px] flex flex-col justify-between ${
                            isCurrentlyAnomaly
                                ? "border-red-500 bg-red-50"
                                : "border-gray-300"
                        }`}
                    >
                        <h2 className="text-base font-bold tracking-wider text-gray-900 uppercase">
                            Real-time Alert Board
                        </h2>

                        <div className="flex-1 flex flex-col justify-center">
                            {isCurrentlyAnomaly ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2.5 text-red-700">
                                        <span className="flex h-3.5 w-3.5 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-red-400 opacity-75" />
                                            <span className="relative inline-flex rounded-none h-3.5 w-3.5 bg-red-600" />
                                        </span>
                                        <span className="text-xs font-bold tracking-tight uppercase">
                                            Contamination Active
                                        </span>
                                    </div>
                                    <p className="text-xs text-red-950 leading-relaxed font-bold">
                                        pH level has dropped below 6.0 and
                                        Turbidity has spiked above normal
                                        limits. Automated response triggered.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2.5 text-emerald-700">
                                        <span className="h-3 w-3 rounded-none bg-emerald-600" />
                                        <span className="text-xs font-bold tracking-tight uppercase">
                                            System Nominal
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-700 leading-relaxed font-bold">
                                        All municipal water parameters are
                                        currently within BIS IS:10500 baseline
                                        limits. No active alerts.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* AI Anomaly Stream Log */}
                    <div className="p-6 rounded-none bg-white border border-gray-300 shadow-none flex flex-col h-[220px] md:col-span-2">
                        <h2 className="text-base font-bold tracking-wider text-gray-900 uppercase mb-3">
                            AI Anomaly Stream Log
                        </h2>
                        <div className="flex-1 bg-slate-100 p-3 rounded-none border border-gray-300 font-mono text-[10px] overflow-y-auto space-y-1.5">
                            {anomalyLogs.length > 0 ? (
                                anomalyLogs.map((log, index) => (
                                    <div
                                        key={index}
                                        className="text-red-800 border-l-2 border-red-600 pl-2 leading-tight font-bold"
                                    >
                                        {log}
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500 italic">
                                    No anomalies flagged by AI.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Node Metadata Board */}
                    <div className="p-6 rounded-none bg-white border border-gray-300 shadow-none h-[220px] flex flex-col justify-between">
                        <h2 className="text-base font-bold tracking-wider text-gray-900 uppercase">
                            Node Telemetry Metadata
                        </h2>
                        <div className="grid grid-cols-2 gap-4 flex-1 items-center text-[11px] mt-2">
                            <div>
                                <span className="text-xs text-gray-600 block font-bold">
                                    Active Node ID
                                </span>
                                <span className="font-mono text-gray-900 font-bold text-sm">
                                    {latestData.node_id || "N/A"}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-600 block font-bold">
                                    Server Timestamp
                                </span>
                                <span className="font-mono text-gray-900 font-bold text-sm">
                                    {latestData.timestamp
                                        ? formatTime(latestData.timestamp)
                                        : "N/A"}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-600 block font-bold">
                                    Data Frequency
                                </span>
                                <span className="font-mono text-gray-900 font-bold text-sm">
                                    1.0 Hz (1 pkt/s)
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-600 block font-bold">
                                    Rolling Limit
                                </span>
                                <span className="font-mono text-gray-900 font-bold text-sm">
                                    60 points (1 min)
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Raw Payload Inspector */}
                    <div className="p-6 rounded-none bg-white border border-gray-300 shadow-none flex flex-col h-[220px] md:col-span-2">
                        <h2 className="text-base font-bold tracking-wider text-gray-900 uppercase mb-2">
                            Latest Live Payload
                        </h2>
                        <div className="flex-1 bg-slate-100 p-3 rounded-none border border-gray-300 font-mono text-[10px] overflow-auto">
                            {latestData.timestamp ? (
                                <pre className="text-blue-900 font-bold">
                                    {JSON.stringify(latestData, null, 2)}
                                </pre>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500 italic">
                                    Awaiting WebSocket stream...
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="text-center pt-4 text-xs text-gray-600 font-mono font-bold">
                    Urban Local Body (ULB) Water Quality Surveillance Network -
                    Live Telemetry
                </footer>
            </div>
        </div>
    );
}
