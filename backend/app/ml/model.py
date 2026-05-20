import os
import logging
import joblib
import numpy as np

logger = logging.getLogger("uvicorn.error")

class AnomalyDetector:
    def __init__(self) -> None:
        self.model = None
        self.model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "saved_model.joblib")
        self.load_model()

    def load_model(self) -> None:
        if os.path.exists(self.model_path):
            try:
                # Load joblib model
                self.model = joblib.load(self.model_path)
                logger.info(f"AnomalyDetector: Trained model successfully loaded from {self.model_path}")
            except Exception as e:
                logger.error(f"AnomalyDetector: Failed to load model file: {e}")
        else:
            logger.error(f"AnomalyDetector: Model file not found at {self.model_path}. Anomaly detection will default to normal (False).")

    def predict(self, ph: float, turbidity: float, do: float, tds: float) -> bool:
        # Graceful fallback if model loading failed
        if self.model is None:
            return False
        
        try:
            import pandas as pd
            # Create a DataFrame with matching column names to silence scikit-learn feature name UserWarning
            features = pd.DataFrame([{
                "ph": ph,
                "turbidity": turbidity,
                "do": do,
                "tds": tds
            }])
            
            # Predict returns -1 for anomalous outliers and 1 for nominal inliers
            prediction = self.model.predict(features)
            is_anomaly = bool(prediction[0] == -1)
            return is_anomaly
        except Exception as e:
            logger.error(f"AnomalyDetector: Error running prediction model: {e}")
            return False
