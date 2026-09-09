from fastapi import APIRouter, HTTPException
import json
from app.database import query_db, execute_db
from app.services.field_memory import analyze_field_memory
from app.engine import compute_risk

router = APIRouter(prefix="/fields", tags=["fields"])


@router.get("")
def list_fields():
    fields = query_db("SELECT * FROM fields ORDER BY field_id ASC;")
    return fields


@router.get("/{field_id}")
def get_field(field_id: str):
    field = query_db("SELECT * FROM fields WHERE field_id = ?", (field_id,), one=True)
    if not field:
        raise HTTPException(404, "Field not found")
    return field


@router.get("/{field_id}/passport")
def get_health_passport(field_id: str):
    """
    Field Health Passport: full longitudinal profile, scan history,
    expert verifications, risk assessments, and trend label.
    """
    field = query_db("SELECT * FROM fields WHERE field_id = ?", (field_id,), one=True)
    if not field:
        raise HTTPException(404, "Field not found")

    passport = query_db("SELECT * FROM health_passports WHERE field_id = ?", (field_id,), one=True)
    observations = query_db("SELECT * FROM observations WHERE field_id = ? ORDER BY created_at DESC;", (field_id,))

    # Collect analyses and reviews
    obs_ids = [o["observation_id"] for o in observations]
    analyses = []
    reviews = []
    if obs_ids:
        placeholders = ",".join(["?"] * len(obs_ids))
        analyses = query_db(f"SELECT * FROM ai_analyses WHERE observation_id IN ({placeholders}) ORDER BY created_at DESC;", tuple(obs_ids))
        reviews = query_db(f"SELECT * FROM expert_reviews WHERE observation_id IN ({placeholders}) ORDER BY created_at DESC;", tuple(obs_ids))

    risk_history = query_db("SELECT * FROM risk_assessments WHERE field_id = ? ORDER BY created_at DESC LIMIT 10;", (field_id,))
    parsed_risks = []
    for r in risk_history:
        r_dict = dict(r)
        try:
            r_dict["factors"] = json.loads(r["factors_json"])
        except Exception:
            r_dict["factors"] = []
        parsed_risks.append(r_dict)

    interventions = query_db("SELECT * FROM interventions WHERE field_id = ? ORDER BY created_at DESC;", (field_id,))
    outcomes = query_db("SELECT * FROM outcomes WHERE field_id = ? ORDER BY created_at DESC;", (field_id,))

    # Compute trend
    severities = [{"Low": 1, "Medium": 2, "Medium-High": 3, "High": 4}.get(r["severity"], 2) for r in reviews]
    trend = passport["trend_label"] if passport else "Stable"
    if len(severities) >= 2:
        trend = "Worsening" if severities[0] > severities[1] else (
            "Improving" if severities[0] < severities[1] else "Stable")

    return {
        "field": field,
        "passport": passport,
        "observations": observations,
        "ai_analyses": analyses,
        "expert_reviews": reviews,
        "interventions": interventions,
        "outcomes": outcomes,
        "risk_history": parsed_risks,
        "trend": trend,
    }


@router.get("/{field_id}/memory")
def get_field_memory(field_id: str):
    """
    Field Memory: longitudinal comparison of lesion expansion,
    recurrence, and sequence descriptions using cautious non-causal language.
    """
    return analyze_field_memory(field_id)


@router.post("/{field_id}/recompute-risk")
def recompute_field_risk(field_id: str):
    result = compute_risk(field_id)
    if not result:
        raise HTTPException(404, "Field not found")
    return result
