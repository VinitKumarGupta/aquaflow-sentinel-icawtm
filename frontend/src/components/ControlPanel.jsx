import React, { useState } from 'react';

/**
 * ControlPanel - Rugged, flat municipal control interface.
 * @param {string} status - Parent websocket status ('open', 'connecting', 'closed', 'error')
 * @param {Array} dataWindow - Rolling telemetry data points from the parent
 */
export default function ControlPanel({ status, dataWindow }) {
  const [triggering, setTriggering] = useState(false);
  const [activeAnomaly, setActiveAnomaly] = useState(false);

  const handleTriggerAnomaly = async () => {
    if (triggering || activeAnomaly) return;
    
    setTriggering(true);
    try {
      const response = await fetch('http://localhost:8000/api/trigger-anomaly', {
        method: 'POST',
      });
      if (response.ok) {
        setActiveAnomaly(true);
        // Backend anomaly reverts automatically in 10 seconds
        setTimeout(() => {
          setActiveAnomaly(false);
        }, 10000);
      } else {
        console.error('Failed to trigger contamination anomaly:', response.statusText);
      }
    } catch (err) {
      console.error('Network error triggering anomaly:', err);
    } finally {
      setTriggering(false);
    }
  };

  const handleExportCSV = () => {
    if (!dataWindow || dataWindow.length === 0) return;
    
    const headers = [
      "Timestamp",
      "Node ID",
      "pH",
      "Turbidity (NTU)",
      "Dissolved Oxygen (mg/L)",
      "Total Dissolved Solids (mg/L)",
      "AI_Anomaly"
    ];
    
    const rows = dataWindow.map((d) => [
      new Date(d.timestamp * 1000).toISOString(),
      d.node_id,
      d.ph,
      d.turbidity,
      d.do,
      d.tds,
      d.ml_anomaly ? "YES" : "NO"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `water_quality_report_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 rounded-none bg-white border border-gray-300 shadow-none">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide mb-1">
            Governance Control & Export Center
          </h2>
          <p className="text-sm text-gray-600">
            Simulate parameter contamination alerts or generate verified water quality compliance reports for municipal archives.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* CSV Export Button (Utility Navy Blue) */}
          <button
            onClick={handleExportCSV}
            disabled={!dataWindow || dataWindow.length === 0}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-none font-bold text-xs tracking-wider uppercase border transition-all duration-150 shadow-none ${
              !dataWindow || dataWindow.length === 0
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-blue-900 hover:bg-blue-800 text-white border-blue-900 cursor-pointer'
            }`}
          >
            Export Compliance Report (CSV)
          </button>

          {/* Trigger Event Button (Industrial Red) */}
          <button
            onClick={handleTriggerAnomaly}
            disabled={status !== 'open' || triggering || activeAnomaly}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-none font-bold text-xs tracking-wider uppercase border transition-all duration-150 shadow-none ${
              activeAnomaly
                ? 'bg-red-100 text-red-800 border-red-200 cursor-not-allowed animate-pulse'
                : status !== 'open'
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-red-700 hover:bg-red-800 text-white border-red-700 cursor-pointer'
            }`}
          >
            {activeAnomaly 
              ? '🚨 Contamination Incident Active (10s)' 
              : triggering 
              ? 'Triggering...' 
              : 'Trigger Contamination Event'}
          </button>
        </div>
      </div>
    </div>
  );
}
