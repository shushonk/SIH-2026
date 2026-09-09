"""
Weather-Based Outbreak Forecasting Router (Item 10b & 10c).
Distinguished from reactive alerts: returns 3-7 day forward outbreak predictions
with explicit probability metrics and preventive IPM guidance in English, Hindi, and Marathi.
"""

from fastapi import APIRouter, Depends, Query
from app.auth.dependencies import get_current_user
from app.services.forecasting import get_field_forecast_alerts, evaluate_field_forecast
from app.services.multilingual import get_multilingual_advisory

router = APIRouter(prefix="/forecast", tags=["forecast"])


@router.get("/alerts/{field_id}")
def get_forecasts(field_id: str, lang: str = Query("en"), current_user: dict = Depends(get_current_user)):
    """
    Returns active 3-7 day forward outbreak forecasts for a field, localized in en/hi/mr.
    """
    alerts = get_field_forecast_alerts(field_id)
    
    # If language is Hindi or Marathi, enrich with localized translations
    if lang in ["hi", "mr"]:
        for alert in alerts:
            disease = alert.get("disease", "")
            trans = get_multilingual_advisory(disease, lang)
            if trans:
                alert["localized_disease"] = trans.get("name", disease)
                alert["localized_warning"] = trans.get("forecast_warning", alert["favorable_conditions_summary"])
                alert["localized_actions"] = trans.get("ipm_advisory", alert["preventive_actions"])
            else:
                alert["localized_disease"] = disease
                alert["localized_warning"] = alert["favorable_conditions_summary"]
                alert["localized_actions"] = alert["preventive_actions"]

    return alerts


@router.post("/evaluate/{field_id}")
def run_forecast_evaluation(field_id: str, days_ahead: int = 5, current_user: dict = Depends(get_current_user)):
    """
    Forces recalculation of forward weather microclimate forecast for a field.
    """
    res = evaluate_field_forecast(field_id, days_ahead)
    return res
