import time
import random

class DataGenerator:
    def __init__(self, node_id: str = "node-001") -> None:
        self.node_id = node_id
        self.is_anomaly_active = False
        self.anomaly_end_time = 0.0

    def set_anomaly(self, duration: float = 10.0) -> None:
        self.is_anomaly_active = True
        self.anomaly_end_time = time.time() + duration

    def check_anomaly_status(self) -> None:
        if self.is_anomaly_active and time.time() > self.anomaly_end_time:
            self.is_anomaly_active = False

    def generate_reading(self) -> dict:
        self.check_anomaly_status()
        
        # Generate baseline readings with slight random noise (Gaussian distribution)
        if self.is_anomaly_active:
            # Drastically altered contamination event values
            ph = random.gauss(5.0, 0.2)
            turbidity = random.gauss(12.0, 1.0)
            do = random.gauss(4.0, 0.3)
            tds = random.gauss(600.0, 25.0)
        else:
            # Baseline parameters (complying with BIS IS:10500 limits)
            ph = random.gauss(7.2, 0.1)
            turbidity = random.gauss(0.5, 0.05) # BIS IS:10500 acceptable limit is <= 1.0 NTU
            do = random.gauss(8.0, 0.2)
            tds = random.gauss(300.0, 10.0)

        # Apply realistic physical clamps
        ph = max(0.0, min(14.0, ph))
        turbidity = max(0.0, turbidity)
        do = max(0.0, do)
        tds = max(0.0, tds)

        return {
            "timestamp": time.time(),
            "node_id": self.node_id,
            "ph": round(ph, 2),
            "turbidity": round(turbidity, 2),
            "do": round(do, 2),
            "tds": round(tds, 2)
        }

# Global shared instance
generator = DataGenerator()
