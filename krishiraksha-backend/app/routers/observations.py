from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import json
import uuid
from datetime import datetime

from app.database import query_db, execute_db
from app.services.mock_vision_model import narrow_investigation
from app.services.vision_pipeline import analyze_leaf_scan
from app.services.audit import log_audit

router = APIRouter(prefix="/observations", tags=["observations"])


class ObservationCreate(BaseModel):
    field_id: str
    image_ref: Optional[str] = "leaf_scan.jpg"
    image_base64: Optional[str] = None
    symptom_keywords: List[str] = []
    notes: Optional[str] = None
    sync_status: Optional[str] = "synced"


class InvestigationAnswer(BaseModel):
    farmer_answer: Optional[str] = ""
    underside_image_ref: Optional[str] = "leaf_underside.jpg"
    underside_image_b64: Optional[str] = None


@router.post("")
def submit_observation(data: ObservationCreate):
    field = query_db("SELECT * FROM fields WHERE field_id = ?", (data.field_id,), one=True)
    if not field:
        raise HTTPException(404, "Field not found")

    obs_id = "obs_" + str(uuid.uuid4())[:8]
    symptoms_json = json.dumps(data.symptom_keywords)

    execute_db("""
        INSERT INTO observations (
            observation_id, field_id, image_ref, symptom_notes, symptom_keywords_json,
            status, sync_status, created_at
        ) VALUES (?, ?, ?, ?, ?, 'analyzed', ?, ?);
    """, (
        obs_id,
        data.field_id,
        data.image_ref or "leaf_scan.jpg",
        data.notes or "Farmer field scan",
        symptoms_json,
        data.sync_status or "synced",
        datetime.now().isoformat()
    ))

    # Record primary image
    img_id = "img_" + str(uuid.uuid4())[:8]
    execute_db("""
        INSERT INTO images (image_id, observation_id, image_type, image_url, image_base64, captured_at)
        VALUES (?, ?, 'primary', ?, ?, ?);
    """, (img_id, obs_id, data.image_ref, data.image_base64, datetime.now().isoformat()))

    # Run AI Vision Layer (isolated from language model)
    analysis = analyze_leaf_scan(
        observation_id=obs_id,
        symptom_keywords=data.symptom_keywords,
        image_ref=data.image_ref,
        image_base64=data.image_base64
    )

    # Update passport scan count
    execute_db("""
        UPDATE health_passports
        SET total_scans = total_scans + 1, last_observation_date = ?, last_updated = ?
        WHERE field_id = ?;
    """, (datetime.now().strftime("%Y-%m-%d"), datetime.now().isoformat(), data.field_id))

    log_audit("Farmer", field["owner_name"], "SUBMIT_OBSERVATION", "OBSERVATION", obs_id, {
        "field_id": data.field_id,
        "symptoms": data.symptom_keywords,
        "had_photo": bool(data.image_base64)
    })

    obs_record = query_db("SELECT * FROM observations WHERE observation_id = ?", (obs_id,), one=True)

    return {
        "observation": obs_record,
        "ai_analysis": analysis
    }


@router.post("/{observation_id}/investigate")
def submit_investigation_followup(observation_id: str, data: InvestigationAnswer):
    """
    Uncertainty & Investigation Engine: Farmer provides targeted follow-up evidence
    (leaf underside photo or symptom onset answer) which narrows the differential diagnosis.
    """
    try:
        result = narrow_investigation(
            observation_id=observation_id,
            farmer_answer=data.farmer_answer,
            underside_image_b64=data.underside_image_b64,
            underside_image_ref=data.underside_image_ref
        )
        return result
    except ValueError as e:
        raise HTTPException(404, str(e))


@router.get("/{observation_id}")
def get_observation_detail(observation_id: str):
    obs = query_db("SELECT * FROM observations WHERE observation_id = ?", (observation_id,), one=True)
    if not obs:
        raise HTTPException(404, "Observation not found")

    analysis = query_db("SELECT * FROM ai_analyses WHERE observation_id = ? ORDER BY created_at DESC LIMIT 1", (observation_id,), one=True)
    differentials = []
    if analysis:
        differentials = query_db("SELECT * FROM differential_diagnoses WHERE analysis_id = ? ORDER BY rank_order ASC", (analysis["analysis_id"],))

    investigation = query_db("SELECT * FROM investigation_requests WHERE observation_id = ? LIMIT 1", (observation_id,), one=True)
    images = query_db("SELECT image_id, image_type, image_url, captured_at FROM images WHERE observation_id = ?", (observation_id,))

    return {
        "observation": obs,
        "ai_analysis": analysis,
        "differentials": differentials,
        "investigation_request": investigation,
        "images": images
    }


@router.get("")
def list_recent_observations(field_id: Optional[str] = None, limit: int = 15):
    if field_id:
        return query_db("SELECT * FROM observations WHERE field_id = ? ORDER BY created_at DESC LIMIT ?", (field_id, limit))
    return query_db("SELECT * FROM observations ORDER BY created_at DESC LIMIT ?", (limit,))
