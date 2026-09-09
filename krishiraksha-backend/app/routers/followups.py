from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime, timedelta
from app.database import query_db, execute_db
from app.services.audit import log_audit

router = APIRouter(tags=["followups"])

SEVERITY_TO_PCT = {"Low": 25, "Medium": 50, "Medium-High": 68, "High": 80}


class InterventionCreate(BaseModel):
    field_id: str
    action_taken: str
    officer_name: Optional[str] = "Officer Deshmukh"
    observation_id: Optional[str] = None
    guidance_type: Optional[str] = "advisory"


class OutcomeCreate(BaseModel):
    field_id: str
    followup_id: str
    new_severity_pct: int


@router.post("/interventions")
def log_intervention(data: InterventionCreate):
    field = query_db("SELECT * FROM fields WHERE field_id = ?", (data.field_id,), one=True)
    if not field:
        raise HTTPException(404, "Field not found")

    intervention_id = "inv_" + str(uuid.uuid4())[:8]
    execute_db("""
        INSERT INTO interventions (intervention_id, field_id, observation_id, action_taken, officer_name, guidance_type, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'completed', ?);
    """, (
        intervention_id,
        data.field_id,
        data.observation_id,
        data.action_taken,
        data.officer_name or "Officer Deshmukh",
        data.guidance_type or "advisory",
        datetime.now().isoformat()
    ))

    # Auto-schedule follow-up check in 3 days
    followup_id = "fol_" + str(uuid.uuid4())[:8]
    due_date = (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d")
    execute_db("""
        INSERT INTO follow_ups (followup_id, field_id, intervention_id, due_date, status, created_at)
        VALUES (?, ?, ?, ?, 'scheduled', ?);
    """, (followup_id, data.field_id, intervention_id, due_date, datetime.now().isoformat()))

    log_audit("Officer", data.officer_name, "LOG_INTERVENTION", "INTERVENTION", intervention_id, {
        "field_id": data.field_id,
        "action": data.action_taken,
        "scheduled_followup": due_date
    })

    return {
        "intervention": {
            "intervention_id": intervention_id,
            "field_id": data.field_id,
            "action_taken": data.action_taken,
            "officer_name": data.officer_name
        },
        "followup": {
            "followup_id": followup_id,
            "field_id": data.field_id,
            "due_date": due_date,
            "status": "scheduled"
        }
    }


@router.get("/followups/{field_id}")
def get_field_followups(field_id: str):
    return query_db("SELECT * FROM follow_ups WHERE field_id = ? ORDER BY created_at DESC;", (field_id,))


@router.post("/outcomes")
def record_outcome(data: OutcomeCreate):
    """
    Evaluates follow-up scan outcomes.
    Enforces cautious non-causal language:
    Classifies as: Improved / Stable / Worsened / Unresolved / Insufficient evidence.
    """
    followup = query_db("SELECT * FROM follow_ups WHERE followup_id = ?", (data.followup_id,), one=True)
    if not followup:
        raise HTTPException(404, "Follow-up record not found")

    reviews = query_db("""
        SELECT er.* FROM expert_reviews er
        JOIN observations o ON er.observation_id = o.observation_id
        WHERE o.field_id = ?
        ORDER BY er.created_at DESC LIMIT 1;
    """, (data.field_id,), one=True)

    prev_pct = SEVERITY_TO_PCT.get(reviews["severity"], 75) if reviews else 70

    # Non-causal classification
    if data.new_severity_pct <= (prev_pct - 15):
        outcome_label = "Improved"
        interpretation = "Improvement observed following the recorded intervention (lesion severity reduced)."
    elif data.new_severity_pct >= (prev_pct + 10):
        outcome_label = "Worsened"
        interpretation = "Increased lesion density observed subsequent to recorded advisory; further field check indicated."
    elif abs(data.new_severity_pct - prev_pct) < 10:
        outcome_label = "Stable"
        interpretation = "Symptom progression appears stable since baseline observation."
    else:
        outcome_label = "Unresolved"
        interpretation = "Partial response observed; continuing periodic monitoring."

    outcome_id = "outc_" + str(uuid.uuid4())[:8]

    execute_db("""
        INSERT INTO outcomes (outcome_id, field_id, followup_id, previous_severity_pct, new_severity_pct, outcome_label, interpretation, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        outcome_id,
        data.field_id,
        data.followup_id,
        prev_pct,
        data.new_severity_pct,
        outcome_label,
        interpretation,
        datetime.now().isoformat()
    ))

    # Mark follow-up completed
    execute_db("UPDATE follow_ups SET status = 'completed' WHERE followup_id = ?;", (data.followup_id,))

    # Update Health Passport trend
    execute_db("""
        UPDATE health_passports
        SET trend_label = ?, summary_narrative = ?, last_updated = ?
        WHERE field_id = ?;
    """, (
        "Improving" if outcome_label == "Improved" else ("Worsening" if outcome_label == "Worsened" else "Stable"),
        f"Post-intervention outcome: {outcome_label}. {interpretation}",
        datetime.now().isoformat(),
        data.field_id
    ))

    log_audit("Farmer", "Farmer Follow-up Scan", "RECORD_OUTCOME", "OUTCOME", outcome_id, {
        "field_id": data.field_id,
        "previous_severity_pct": prev_pct,
        "new_severity_pct": data.new_severity_pct,
        "outcome_label": outcome_label
    })

    return {
        "outcome_id": outcome_id,
        "field_id": data.field_id,
        "previous_severity_pct": prev_pct,
        "new_severity_pct": data.new_severity_pct,
        "outcome_label": outcome_label,
        "interpretation": interpretation,
        "created_at": datetime.now().isoformat()
    }
