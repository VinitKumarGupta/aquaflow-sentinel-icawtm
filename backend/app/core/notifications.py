import time
import logging

logger = logging.getLogger("uvicorn.error")

class NotificationManager:
    def __init__(self) -> None:
        # Simple debounce: store the timestamp of the last email notification sent.
        self.last_email_time = 0.0
        # Debounce limit in seconds (30 seconds)
        self.debounce_seconds = 30.0

    def send_anomaly_email(self, payload: dict) -> None:
        current_time = time.time()
        
        # Debounce check: only proceed if enough time has elapsed
        if current_time - self.last_email_time < self.debounce_seconds:
            return

        self.last_email_time = current_time

        # Format deviation text based on BIS IS:10500 guidelines
        deviations = []
        if payload.get("ph", 7.2) < 6.5 or payload.get("ph", 7.2) > 8.5:
            deviations.append(f"pH level: {payload.get('ph')} (Standard Acceptable: 6.5 - 8.5)")
        if payload.get("turbidity", 0.5) > 1.0:
            deviations.append(f"Turbidity: {payload.get('turbidity')} NTU (Standard Acceptable: <= 1.0 NTU)")
        if payload.get("do", 8.0) < 5.0:
            deviations.append(f"Dissolved Oxygen (DO): {payload.get('do')} mg/L (Standard Acceptable: >= 5.0 mg/L)")
        if payload.get("tds", 300) > 500:
            deviations.append(f"Total Dissolved Solids (TDS): {payload.get('tds')} mg/L (Standard Acceptable: <= 500 mg/L)")

        deviation_str = "\n".join([f"   - {dev}" for dev in deviations])

        email_body = f"""
================================================================================
OFFICIAL MUNICIPAL GOVERNANCE WATER QUALITY NOTIFICATION
DEPARTMENT OF URBAN LOCAL BODIES (ULB) & SANITATION
--------------------------------------------------------------------------------
ALERT DATE/TIME  : {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(current_time))}
MONITORING NODE  : {payload.get('node_id', 'N/A')}
CRITICAL LEVEL   : HIGH SENSITIVITY ANOMALY DETECTED BY AI INFERENCE

Dear Administrator,

This is an official automated advisory notification from the AquaFlow Sentinel platform.
Our scikit-learn Isolation Forest model has flagged a critical water contamination incident.

Parameter Deviations Flagged:
{deviation_str}

Immediate Action Required:
1. Verify the telemetry readings on the web console dashboard.
2. Direct the field team to perform physical water sample testing at Node {payload.get('node_id', 'N/A')}.
3. Inspect valves and filtration systems at the designated zone.

Verify time-series history at: http://localhost:5173/ or http://localhost:5174/

--------------------------------------------------------------------------------
AQUAFLOW WATER GOVERNANCE INFRASTRUCTURE CONTROL
================================================================================
"""
        logger.warning("NotificationManager: [MOCK EMAIL DISPATCHED TO MUNICIPAL ADMIN]")
        print(email_body)

# Global notification manager instance
notification_manager = NotificationManager()
