from pydantic import BaseModel

class SensorPayload(BaseModel):
    timestamp: float
    node_id: str
    ph: float
    turbidity: float
    do: float
    tds: float
    ml_anomaly: bool
