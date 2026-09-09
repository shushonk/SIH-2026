from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime
from app.database import query_db, execute_db
from app.engine import compute_risk, broadcast_regional_alert
from app.services.audit import log_audit
from app.auth.dependencies import require_role

router = APIRouter(
    prefix="/expert-reviews",
    tags=["expert"],
    dependencies=[Depends(require_role(["Expert", "Admin"]))]
)


class ExpertReviewSubmit(BaseModel):
    observation_id: str
    confirmed_disease: str
    severity: str  # Low / Medium / High
    comments: Optional[str] = "Clinical confirmation completed."
    advisory_notes: Optional[str] = "Follow IPM sanitation and consult local extension."
    expert_name: Optional[str] = "Dr. Meera Nair"
    action_decision: Optional[str] = "confirmed"  # confirmed / rejected / modified


@router.get("/pending")
def list_pending_expert_cases():
    """
    Expert Pending Cases Queue:
    Sorted by uncertainty (lowest confidence margin / needs investigation first).
    Enriched with differential diagnosis, farmer answers, and field metadata.
    """
    # Find all observations that have NOT been reviewed yet
    cases = query_db("""
        SELECT o.observation_id, o.field_id, o.image_ref, o.symptom_notes, o.status, o.created_at as obs_created_at,
               f.owner_name, f.crop, f.variety, f.growth_stage, f.soil_type, f.current_risk_score,
               a.analysis_id, a.top_disease, a.top_confidence, a.severity_estimate,
               a.explanation, a.needs_investigation, a.investigation_question,
               ir.question_prompt, ir.farmer_answer, ir.narrowed_disease, ir.narrowed_confidence, ir.status as inv_status
        FROM observations o
        JOIN fields f ON o.field_id = f.field_id
        LEFT JOIN ai_analyses a ON o.observation_id = a.observation_id
        LEFT JOIN investigation_requests ir ON o.observation_id = ir.observation_id
        WHERE o.observation_id NOT IN (SELECT observation_id FROM expert_reviews)
        ORDER BY a.needs_investigation DESC, a.top_confidence ASC, o.created_at DESC;
    """)

    enriched_cases = []
    for c in cases:
        c_dict = dict(c)
        differentials = []
        if c.get("analysis_id"):
            differentials = query_db(
                "SELECT * FROM differential_diagnoses WHERE analysis_id = ? ORDER BY rank_order ASC;",
                (c["analysis_id"],)
            )
        c_dict["differential"] = differentials

        # Historical count
        prev_obs = query_db("SELECT COUNT(*) as count FROM observations WHERE field_id = ?;", (c["field_id"],), one=True)
        c_dict["field_total_scans"] = prev_obs["count"] if prev_obs else 1

        # Uncertainty metric: 1 - top_confidence
        c_dict["uncertainty_score"] = round(1.0 - (c.get("top_confidence") or 0.5), 2)
        enriched_cases.append(c_dict)

    return enriched_cases


@router.post("")
def submit_expert_review(review: ExpertReviewSubmit):
    """
    Expert Verification:
    Confirms, rejects, or adjusts severity.
    Stores the AI-Expert pair as a training loop benchmark.
    Triggers explainable risk recomputation and regional alerts.
    """
    obs = query_db("SELECT * FROM observations WHERE observation_id = ?", (review.observation_id,), one=True)
    if not obs:
        raise HTTPException(404, "Observation not found")

    analysis = query_db(
        "SELECT * FROM ai_analyses WHERE observation_id = ? ORDER BY created_at DESC LIMIT 1;",
        (review.observation_id,),
        one=True
    )
    ai_top_disease = analysis["top_disease"] if analysis else "Unknown"
    ai_top_conf = analysis["top_confidence"] if analysis else 0.0

    agreement = 1 if (ai_top_disease.lower() == review.confirmed_disease.lower()) else 0

    review_id = "rev_" + str(uuid.uuid4())[:8]

    execute_db("""
        INSERT INTO expert_reviews (
            review_id, observation_id, expert_name, confirmed_disease,
            original_ai_disease, original_ai_confidence, agreement, severity,
            comments, advisory_notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        review_id,
        review.observation_id,
        review.expert_name or "Dr. Meera Nair",
        review.confirmed_disease,
        ai_top_disease,
        ai_top_conf,
        agreement,
        review.severity,
        review.comments,
        review.advisory_notes,
        datetime.now().isoformat()
    ))

    # Mark observation verified
    execute_db("UPDATE observations SET status = 'verified' WHERE observation_id = ?;", (review.observation_id,))

    # Recalculate field risk and broadcast regional alert
    risk = compute_risk(obs["field_id"])
    alerts = broadcast_regional_alert(obs["field_id"], review.confirmed_disease)

    # Update Health Passport trend
    execute_db("""
        UPDATE health_passports
        SET trend_label = ?, summary_narrative = ?, last_updated = ?
        WHERE field_id = ?;
    """, (
        "Worsening" if review.severity in ["High", "Medium-High"] else "Stable",
        f"Verified by {review.expert_name}: {review.confirmed_disease} ({review.severity}). {review.advisory_notes}",
        datetime.now().isoformat(),
        obs["field_id"]
    ))

    # Log audit event
    log_audit("Expert", review.expert_name, "VERIFY_OBSERVATION", "EXPERT_REVIEW", review_id, {
        "observation_id": review.observation_id,
        "confirmed_disease": review.confirmed_disease,
        "ai_original": ai_top_disease,
        "agreement": bool(agreement),
        "severity": review.severity
    })

    return {
        "review_id": review_id,
        "observation_id": review.observation_id,
        "confirmed_disease": review.confirmed_disease,
        "agreement": bool(agreement),
        "severity": review.severity,
        "risk_assessment": risk,
        "alerts_broadcast": alerts,
        "created_at": datetime.now().isoformat()
    }


@router.get("/history")
def list_expert_review_history(limit: int = 20):
    reviews = query_db("""
        SELECT er.*, o.field_id, f.owner_name, f.crop
        FROM expert_reviews er
        JOIN observations o ON er.observation_id = o.observation_id
        JOIN fields f ON o.field_id = f.field_id
        ORDER BY er.created_at DESC LIMIT ?;
    """, (limit,))
    return reviews
