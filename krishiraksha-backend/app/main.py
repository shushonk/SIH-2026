from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.seed_data import seed_all
from app.routers import (
    auth, fields, observations, experts, officer,
    followups, alerts, copilot, simulator, admin,
    sensors, forecast, messages, ws
)

app = FastAPI(
    title="KrishiRaksha API",
    description="AI-Powered Closed-Loop Agricultural Decision-Support Platform (SIH26131)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket routes
app.include_router(ws.router)

# Include both non-prefixed and /api-prefixed routes for maximum client compatibility
for prefix in ["", "/api"]:
    app.include_router(auth.router, prefix=prefix)
    app.include_router(fields.router, prefix=prefix)
    app.include_router(observations.router, prefix=prefix)
    app.include_router(experts.router, prefix=prefix)
    app.include_router(officer.router, prefix=prefix)
    app.include_router(followups.router, prefix=prefix)
    app.include_router(alerts.router, prefix=prefix)
    app.include_router(copilot.router, prefix=prefix)
    app.include_router(simulator.router, prefix=prefix)
    app.include_router(admin.router, prefix=prefix)
    app.include_router(sensors.router, prefix=prefix)
    app.include_router(forecast.router, prefix=prefix)
    app.include_router(messages.router, prefix=prefix)


@app.on_event("startup")
def startup():
    seed_all()


@app.get("/model-info")
@app.get("/api/model-info")
def model_info():
    """
    Model metadata and honest disclosures regarding deterministic simulation mode
    and lab-trained computer vision limitations.
    """
    return {
        "model_name": "KrishiRaksha Hybrid Uncertainty Classifier v1.2",
        "mode": "deterministic_simulation",
        "classes": ["Early Blight", "Septoria Leaf Spot", "Nutrient Deficiency (Potassium)", "Tomato Leaf Mold", "Healthy Leaf"],
        "lab_accuracy_baseline_pct": 98.3,
        "uncertainty_threshold": 0.70,
        "differential_threshold": 0.20,
        "safe_action_policy": "Strict Non-Prescriptive IPM (No arbitrary pesticide dosages)",
        "disclaimer": "Simulated AI outputs for hackathon demonstration. High-severity cases require licensed agronomist verification."
    }


@app.get("/")
def root():
    return {
        "status": "ok",
        "platform": "KrishiRaksha (SIH26131)",
        "decision_loop": "Observe -> Investigate -> Verify -> Assess -> Prioritize -> Act -> Monitor -> Learn",
        "database": "SQLite (24 relational tables persisted)",
        "version": "1.0.0"
    }
