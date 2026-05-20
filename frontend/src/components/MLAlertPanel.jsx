import React from 'react';

/**
 * MLAlertPanel - UI indicator for Isolation Forest predictions in Light Theme.
 * @param {boolean} mlAnomaly - Whether an anomaly was predicted by the ML engine
 */
export default function MLAlertPanel({ mlAnomaly }) {
  return (
    <div className="w-full transition-all duration-300">
      {mlAnomaly ? (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-wider text-red-600 uppercase">
                AI Detection Alert
              </div>
              <div className="text-sm font-bold text-red-950 tracking-tight">
                AI DETECTED CONTAMINATION: Telemetry deviations flagged by Isolation Forest.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase">
                AI Security Status
              </div>
              <div className="text-sm font-semibold text-emerald-950">
                System Status: Nominal (AI Verified)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
