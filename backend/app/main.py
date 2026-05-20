from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.websockets import router as ws_router
from app.simulation.generator import generator

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS middleware to allow React frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include WebSocket router
app.include_router(ws_router)

@app.post("/api/trigger-anomaly")
def trigger_anomaly() -> dict:
    generator.set_anomaly(duration=10.0)
    return {
        "status": "anomaly_triggered",
        "duration": 10.0,
        "is_anomaly_active": True
    }

@app.get("/")
def read_root() -> dict:
    return {"message": f"Welcome to the {settings.PROJECT_NAME} Backend."}
