"""
Explainable Risk Engine & Spatial Utilities for KrishiRaksha.
Computes 0-100 risk score with dynamic factor breakdown.
"""

import math
import json
import uuid
from datetime import datetime
from app.database import query_db, execute_db
from app.weather import get_weather_risk_factor
from app.services.audit import log_audit


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2
    return 2.0 * R * math.asin(math.sqrt(a))


SEVERITY_POINTS = {
    "Low": 8,
    "Medium": 15,
    "Medium-High": 20,
    "High": 25
}

VULNERABLE_STAGES = {
    "Flowering": 15,
    "Fruiting": 15,
    "Vegetative": 5
}

VARIETY_SUSCEPTIBILITY = {
    "Pusa Ruby": {"Early Blight": 6, "Septoria Leaf Spot": 4},
    "Arka Rakshak": {"Early Blight": -8, "Septoria Leaf Spot": -6},  # bred for disease resistance
    "Kufri Jyoti": {"Early Blight": 5, "Late Blight": 8},
    "Pusa Jwala": {"Leaf Curl": 5}
}


def compute_risk(field_id: str):
    """
    Computes explainable 0-100 risk score and persists to SQLite.
    Returns: { field_id, score, level, factors: [{label, weight}], created_at }
    """
    field = query_db("SELECT * FROM fields WHERE field_id = ?", (field_id,), one=True)
    if not field:
        return None

    # Retrieve most recent expert review or AI analysis for this field
    reviews = query_db("""
        SELECT er.*, o.created_at as obs_date
        FROM expert_reviews er
        JOIN observations o ON er.observation_id = o.observation_id
        WHERE o.field_id = ?
        ORDER BY er.created_at DESC LIMIT 1;
    """, (field_id,), one=True)

    latest_analysis = query_db("""
        SELECT a.*
        FROM ai_analyses a
        JOIN observations o ON a.observation_id = o.observation_id
        WHERE o.field_id = ?
        ORDER BY a.created_at DESC LIMIT 1;
    """, (field_id,), one=True)

    factors = []
    score = 0

    confirmed_disease = None
    severity_label = "Medium"

    if reviews:
        confirmed_disease = reviews["confirmed_disease"]
        severity_label = reviews["severity"]
        pts = SEVERITY_POINTS.get(severity_label, 15)
        factors.append({"label": f"Expert Verified Severity: {severity_label}", "weight": pts})
        score += pts
    elif latest_analysis:
        confirmed_disease = latest_analysis["top_disease"]
        severity_label = latest_analysis["severity_estimate"]
        pts = 12 if severity_label == "Medium" else 18
        factors.append({"label": f"AI Preliminary Severity: {severity_label} ({latest_analysis['top_disease']})", "weight": pts})
        score += pts
    else:
        factors.append({"label": "Baseline Regional Microclimate Risk", "weight": 10})
        score += 10

    # Growth stage vulnerability
    stage = field.get("growth_stage", "Vegetative")
    stage_pts = VULNERABLE_STAGES.get(stage, 5)
    factors.append({"label": f"Phenological Stage Sensitivity ({stage})", "weight": stage_pts})
    score += stage_pts

    # Nearby verified cases (Haversine distance <= 3.0 km)
    all_fields = query_db("SELECT * FROM fields WHERE field_id != ?", (field_id,))
    nearby_count = 0
    for other in all_fields:
        dist = haversine_km(field["latitude"], field["longitude"], other["latitude"], other["longitude"])
        if dist <= 3.0:
            other_reviews = query_db("""
                SELECT er.review_id
                FROM expert_reviews er
                JOIN observations o ON er.observation_id = o.observation_id
                WHERE o.field_id = ? LIMIT 1;
            """, (other["field_id"],), one=True)
            if other_reviews:
                nearby_count += 1

    if nearby_count > 0:
        pts = min(nearby_count * 12, 24)
        factors.append({"label": f"Proximity to {nearby_count} verified case(s) within 3.0 km", "weight": pts})
        score += pts
    else:
        factors.append({"label": "No verified active cases within immediate 3.0 km buffer", "weight": 0})

    # Weather risk factor
    weather = get_weather_risk_factor(field["latitude"], field["longitude"])
    if weather["points"] > 0:
        src_note = "Live Open-Meteo" if weather["source"] == "live_forecast" else "Seasonal Microclimate Model"
        factors.append({
            "label": f"Atmospheric Humidity: {weather['humidity_pct']}% RH ({src_note})",
            "weight": weather["points"]
        })
        score += weather["points"]

    # Cultivar genetic susceptibility
    variety = field.get("variety", "")
    if confirmed_disease and variety in VARIETY_SUSCEPTIBILITY:
        mod = VARIETY_SUSCEPTIBILITY[variety].get(confirmed_disease, 0)
        if mod != 0:
            direction = "Elevated susceptibility" if mod > 0 else "Genetic resistance benefit"
            factors.append({"label": f"Cultivar '{variety}' {direction} ({confirmed_disease})", "weight": mod})
            score += mod

    # Soil moisture condition
    soil_moisture = field.get("soil_moisture_pct")
    if soil_moisture is not None and soil_moisture >= 70:
        factors.append({"label": f"Elevated Root Zone Moisture ({soil_moisture}% in {field.get('soil_type', 'soil')})", "weight": 8})
        score += 8

    # Pest trap counts (Item 10a: independent evidence stream)
    try:
        traps = query_db("""
            SELECT * FROM trap_counts 
            WHERE field_id = ? 
            ORDER BY recorded_at DESC LIMIT 3;
        """, (field_id,))
        for trap in traps:
            if trap.get("threshold_breached") or trap.get("count", 0) >= trap.get("economic_threshold", 999):
                t_weight = 18
                factors.append({
                    "label": f"Pheromone Trap Economic Threshold Breached: {trap['target_pest']} ({trap['count']}/trap/night > threshold {trap['economic_threshold']})",
                    "weight": t_weight
                })
                score += t_weight
                break
    except Exception:
        pass

    # Basic field IoT sensor readings (Item 10a)
    try:
        sensors = query_db("""
            SELECT * FROM sensor_readings
            WHERE field_id = ?
            ORDER BY recorded_at DESC LIMIT 5;
        """, (field_id,))
        for s in sensors:
            if s.get("threshold_exceeded") or (s.get("sensor_type") == "leaf_wetness" and s.get("value", 0) >= 8):
                s_weight = 12
                factors.append({
                    "label": f"IoT Sensor Warning: {s['sensor_type'].replace('_', ' ').title()} at {s['value']} {s['unit']} (Disease proliferation threshold)",
                    "weight": s_weight
                })
                score += s_weight
                break
    except Exception:
        pass

    # Final score clamping (0 to 100)
    score = max(min(score, 100), 0)
    level = "HIGH" if score >= 70 else "MEDIUM" if score >= 40 else "LOW"

    assessment_id = "risk_" + str(uuid.uuid4())[:8]
    factors_json = json.dumps(factors)

    execute_db("""
        INSERT INTO risk_assessments (assessment_id, field_id, score, level, factors_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?);
    """, (assessment_id, field_id, score, level, factors_json, datetime.now().isoformat()))

    # Update current field risk
    execute_db("""
        UPDATE fields
        SET current_risk_score = ?, current_risk_level = ?
        WHERE field_id = ?;
    """, (score, level, field_id))

    # Re-calculate inspection priority rank
    _recalculate_inspection_priorities()

    return {
        "assessment_id": assessment_id,
        "field_id": field_id,
        "score": score,
        "level": level,
        "factors": factors,
        "created_at": datetime.now().isoformat()
    }


calculate_risk_score = compute_risk


def _recalculate_inspection_priorities():
    """
    Ranks all fields by current_risk_score descending, updating the inspection_priorities table.
    """
    fields = query_db("SELECT * FROM fields ORDER BY current_risk_score DESC, field_id ASC;")
    for idx, f in enumerate(fields, 1):
        latest_risk = query_db(
            "SELECT * FROM risk_assessments WHERE field_id = ? ORDER BY created_at DESC LIMIT 1;",
            (f["field_id"],),
            one=True
        )
        driving_reasons = []
        if latest_risk:
            factors = json.loads(latest_risk["factors_json"])
            driving_reasons = [item for item in factors if item.get("weight", 0) > 0][:4]
        else:
            driving_reasons = [{"label": f"Baseline status ({f['growth_stage']})", "weight": f["current_risk_score"]}]

        existing_prio = query_db("SELECT * FROM inspection_priorities WHERE field_id = ?;", (f["field_id"],), one=True)
        if existing_prio:
            execute_db("""
                UPDATE inspection_priorities
                SET rank_order = ?, priority_score = ?, driving_reasons_json = ?, last_updated = ?
                WHERE field_id = ?;
            """, (idx, f["current_risk_score"], json.dumps(driving_reasons), datetime.now().isoformat(), f["field_id"]))
        else:
            prio_id = "prio_" + str(uuid.uuid4())[:8]
            execute_db("""
                INSERT INTO inspection_priorities (priority_id, field_id, rank_order, priority_score, driving_reasons_json, status, assigned_officer, last_updated)
                VALUES (?, ?, ?, ?, ?, 'pending', 'Officer Deshmukh', ?);
            """, (prio_id, f["field_id"], idx, f["current_risk_score"], json.dumps(driving_reasons), datetime.now().isoformat()))


def broadcast_regional_alert(field_id: str, disease: str, radius_km: float = 5.0):
    """
    Broadcasts regional notification to neighboring fields within radius_km.
    Adheres strictly to safe non-prescriptive action guidelines.
    """
    source_field = query_db("SELECT * FROM fields WHERE field_id = ?", (field_id,), one=True)
    knowledge = query_db("SELECT * FROM knowledge_documents WHERE disease = ?", (disease,), one=True)
    if not source_field:
        return []

    treatment_summary = "Consult local Krishi Vigyan Kendra extension officer for approved integrated pest management (IPM) measures."
    if knowledge:
        safe_steps = json.loads(knowledge["safe_next_steps_json"])
        treatment_summary = "; ".join(safe_steps[:2])

    created_alerts = []
    other_fields = query_db("SELECT * FROM fields WHERE field_id != ?", (field_id,))
    for other in other_fields:
        dist = haversine_km(source_field["latitude"], source_field["longitude"], other["latitude"], other["longitude"])
        if dist <= radius_km:
            alert_id = "alert_" + str(uuid.uuid4())[:8]
            message = (
                f"Active confirmed case of {disease} identified {round(dist, 1)} km from your field "
                f"({other['field_name']}). Prioritize lower canopy inspection."
            )
            execute_db("""
                INSERT INTO alerts (alert_id, field_id, alert_type, disease, message, treatment_summary, distance_km, sync_status, is_read, created_at)
                VALUES (?, ?, 'regional_case_nearby', ?, ?, ?, ?, 'synced', 0, ?);
            """, (alert_id, other["field_id"], disease, message, treatment_summary, round(dist, 1), datetime.now().isoformat()))

            created_alerts.append({
                "alert_id": alert_id,
                "field_id": other["field_id"],
                "target_owner": other["owner_name"],
                "disease": disease,
                "distance_km": round(dist, 1),
                "message": message,
                "treatment_summary": treatment_summary
            })

    log_audit("System", "RiskEngine", "BROADCAST_ALERTS", "FIELD", field_id, {
        "disease": disease,
        "recipient_count": len(created_alerts)
    })

    return created_alerts
