from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
import asyncio
from app.simulation.generator import generator
from app.schemas.sensor_data import SensorPayload
from app.ml.model import AnomalyDetector
from app.core.notifications import notification_manager

router = APIRouter()
# Instantiate the anomaly detector
detector = AnomalyDetector()

class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: dict, websocket: WebSocket) -> None:
        await websocket.send_json(message)

    async def broadcast(self, message: dict) -> None:
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await manager.connect(websocket)
    try:
        while True:
            # Generate simulated data reading
            reading = generator.generate_reading()
            
            # Predict anomaly using the trained scikit-learn Isolation Forest model
            ml_anomaly = detector.predict(
                ph=reading["ph"],
                turbidity=reading["turbidity"],
                do=reading["do"],
                tds=reading["tds"]
            )
            
            # Enforce validation on the payload schema
            payload = SensorPayload(
                timestamp=reading["timestamp"],
                node_id=reading["node_id"],
                ph=reading["ph"],
                turbidity=reading["turbidity"],
                do=reading["do"],
                tds=reading["tds"],
                ml_anomaly=ml_anomaly
            )
            
            # Send notification if anomaly is detected (internally debounced)
            if ml_anomaly:
                notification_manager.send_anomaly_email(payload.model_dump())
            
            # Broadcast the validated payload as JSON
            await websocket.send_json(payload.model_dump())
            
            # Sleep for 1 second
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
