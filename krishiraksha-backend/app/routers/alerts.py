from fastapi import APIRouter, HTTPException
import json
from app.database import query_db, execute_db

router = APIRouter(tags=["alerts & knowledge"])


@router.get("/alerts/{field_id}")
def get_alerts_for_field(field_id: str):
    """
    Returns prioritized regional alerts for a specific field.
    Includes delivery sync status (synced vs pending for offline relay).
    """
    alerts = query_db("SELECT * FROM alerts WHERE field_id = ? ORDER BY created_at DESC;", (field_id,))
    return alerts


@router.get("/alerts")
def list_all_alerts(limit: int = 25):
    alerts = query_db("SELECT a.*, f.owner_name, f.field_name FROM alerts a JOIN fields f ON a.field_id = f.field_id ORDER BY a.created_at DESC LIMIT ?;", (limit,))
    return alerts


@router.post("/alerts/{alert_id}/read")
def mark_alert_read(alert_id: str):
    execute_db("UPDATE alerts SET is_read = 1 WHERE alert_id = ?;", (alert_id,))
    return {"status": "ok", "alert_id": alert_id}


@router.get("/knowledge/{disease}")
def get_disease_knowledge(disease: str, lang: str = "en"):
    """
    Retrieves disease knowledge documentation with safe integrated pest management
    practices (strictly non-prescriptive regarding unverified chemicals).
    """
    doc = query_db("SELECT * FROM knowledge_documents WHERE LOWER(disease) = LOWER(?);", (disease,), one=True)
    if not doc:
        # Fallback partial match
        doc = query_db("SELECT * FROM knowledge_documents WHERE LOWER(disease) LIKE ? LIMIT 1;", (f"%{disease.lower()}%",), one=True)
        if not doc:
            raise HTTPException(404, "Disease knowledge entry not found")

    try:
        symptoms = json.loads(doc["symptoms_json"])
        prevention = json.loads(doc["prevention_json"])
        safe_steps = json.loads(doc["safe_next_steps_json"])
        translations = json.loads(doc["translations_json"])
    except Exception:
        symptoms, prevention, safe_steps, translations = [], [], [], {}

    res = {
        "doc_id": doc["doc_id"],
        "disease": doc["disease"],
        "description": doc["description"],
        "symptoms": symptoms,
        "prevention": prevention,
        "safe_next_steps": safe_steps,
        "escalation_note": doc["escalation_note"]
    }

    if lang == "hi" and "hi" in translations:
        hi = translations["hi"]
        if "disease_name" in hi:
            res["disease_name_hi"] = hi["disease_name"]
        if "description" in hi:
            res["description"] = hi["description"]
        if "safe_next_steps" in hi:
            res["safe_next_steps"] = hi["safe_next_steps"]
        if "escalation_note" in hi:
            res["escalation_note"] = hi["escalation_note"]
        res["_lang"] = "hi"
    else:
        res["_lang"] = "en"

    return res


@router.get("/knowledge")
def list_knowledge():
    docs = query_db("SELECT * FROM knowledge_documents;")
    res = []
    for d in docs:
        try:
            symptoms = json.loads(d["symptoms_json"])
            safe_steps = json.loads(d["safe_next_steps_json"])
        except Exception:
            symptoms, safe_steps = [], []
        res.append({
            "doc_id": d["doc_id"],
            "disease": d["disease"],
            "description": d["description"],
            "symptoms": symptoms,
            "safe_next_steps": safe_steps
        })
    return res
