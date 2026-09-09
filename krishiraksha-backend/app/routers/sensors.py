"""
Sensor Readings and Pest Trap Telemetry Router (Item 10a).
Allows manual entry or IoT feed ingestion of pheromone/light trap counts and field sensor readings.
Breaching trap thresholds or sensor wetness limits directly feeds into the explainable risk engine.
"""

import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from app.database import query_db, execute_db
from app.auth.dependencies import get_current_user
from app.engine import calculate_risk_score

router = APIRouter(prefix="/sensors", tags=["sensors"])


class TrapCountCreate(BaseModel):
    field_id: str
    trap_type: str = "pheromone_trap"
    target_pest: str = "Helicoverpa armigera"
    count: int
    economic_threshold: int = 15
    notes: Optional[str] = "Checked 07:00 AM"


class SensorReadingCreate(BaseModel):
    field_id: str
    sensor_type: str  # soil_moisture, leaf_wetness, canopy_humidity, temperature
    value: float
    unit: str
    source: Optional[str] = "IoT_Station"


@router.get("/traps/{field_id}")
def get_field_traps(field_id: str, current_user: dict = Depends(get_current_user)):
    traps = query_db("""
        SELECT * FROM trap_counts 
        WHERE field_id = ? 
        ORDER BY recorded_at DESC LIMIT 10;
    """, (field_id,))
    return traps or []


@router.post("/traps")
def log_trap_count(payload: TrapCountCreate, current_user: dict = Depends(get_current_user)):
    trap_id = f"trap_{uuid.uuid4().hex[:8]}"
    threshold_breached = 1 if payload.count >= payload.economic_threshold else 0

    execute_db("""
        INSERT INTO trap_counts (
            trap_id, field_id, trap_type, target_pest, count,
            economic_threshold, threshold_breached, logged_by, notes, recorded_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        trap_id,
        payload.field_id,
        payload.trap_type,
        payload.target_pest,
        payload.count,
        payload.economic_threshold,
        threshold_breached,
        current_user.get("name", "Field User"),
        payload.notes,
        datetime.now().isoformat()
    ))

    # Trigger explainable risk engine update immediately
    updated_risk = calculate_risk_score(payload.field_id)

    return {
        "status": "success",
        "trap_id": trap_id,
        "threshold_breached": bool(threshold_breached),
        "message": (
            f"Trap count of {payload.count} logged for {payload.target_pest}. "
            + ("Economic threshold BREACHED! Risk score updated." if threshold_breached else "Within safe tolerance.")
        ),
        "updated_risk": updated_risk
    }


@router.get("/readings/{field_id}")
def get_sensor_readings(field_id: str, current_user: dict = Depends(get_current_user)):
    readings = query_db("""
        SELECT * FROM sensor_readings 
        WHERE field_id = ? 
        ORDER BY recorded_at DESC LIMIT 15;
    """, (field_id,))
    return readings or []


@router.post("/readings")
def log_sensor_reading(payload: SensorReadingCreate, current_user: dict = Depends(get_current_user)):
    reading_id = f"sens_{uuid.uuid4().hex[:8]}"
    
    threshold_exceeded = 0
    if payload.sensor_type == "leaf_wetness" and payload.value >= 8.0:
        threshold_exceeded = 1
    elif payload.sensor_type == "soil_moisture" and payload.value >= 80.0:
        threshold_exceeded = 1
    elif payload.sensor_type == "canopy_humidity" and payload.value >= 85.0:
        threshold_exceeded = 1

    execute_db("""
        INSERT INTO sensor_readings (
            reading_id, field_id, sensor_type, value, unit,
            threshold_exceeded, source, recorded_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        reading_id,
        payload.field_id,
        payload.sensor_type,
        payload.value,
        payload.unit,
        threshold_exceeded,
        payload.source or "IoT_Station",
        datetime.now().isoformat()
    ))

    # Recalculate risk score
    updated_risk = calculate_risk_score(payload.field_id)

    return {
        "status": "success",
        "reading_id": reading_id,
        "threshold_exceeded": bool(threshold_exceeded),
        "updated_risk": updated_risk
    }
