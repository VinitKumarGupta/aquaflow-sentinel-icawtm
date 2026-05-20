import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

def generate_normal_data(n_samples: int = 5000) -> pd.DataFrame:
    # Set seed for reproducible synthetic data generation
    np.random.seed(42)
    
    # Gaussian distribution complying with BIS IS:10500 limits:
    # pH ~7.2, Turbidity ~0.5 NTU, DO ~8.0 mg/L, TDS ~300 mg/L
    ph = np.random.normal(7.2, 0.1, n_samples)
    turbidity = np.random.normal(0.5, 0.05, n_samples)
    do = np.random.normal(8.0, 0.2, n_samples)
    tds = np.random.normal(300.0, 10.0, n_samples)
    
    # Safe physical bounds clamping
    ph = np.clip(ph, 0.0, 14.0)
    turbidity = np.maximum(turbidity, 0.0)
    do = np.maximum(do, 0.0)
    tds = np.maximum(tds, 0.0)
    
    return pd.DataFrame({
        "ph": ph,
        "turbidity": turbidity,
        "do": do,
        "tds": tds
    })

def train_model() -> None:
    print("Generating 5000 normal baseline samples...")
    df = generate_normal_data(5000)
    
    print("Training IsolationForest model (contamination=0.0001)...")
    # isolation forest learns normal patterns and marks anomalous values as outliers (-1)
    # 0.0001 contamination minimizes false positives on normal data tails
    model = IsolationForest(contamination=0.0001, random_state=42)
    model.fit(df)
    
    # Resolve exact destination file path
    ml_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(ml_dir, "saved_model.joblib")
    
    print(f"Saving serialized model to {model_path}...")
    joblib.dump(model, model_path)
    print("Model trained and saved successfully!")

if __name__ == "__main__":
    train_model()
