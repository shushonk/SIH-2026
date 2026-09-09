from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.database import lab_referrals_col, fields_col
from app.models import LabReferralIn, new_id

router = APIRouter(prefix="/lab-referrals", tags=["referrals"])


@router.post("")
def create_referral(referral: LabReferralIn):
    """
    Tracks a referral to a lab or extension office as a real, status-tracked
    entity — not just a text string telling the farmer to 'consult an expert'.
    """
    if not fields_col.find_one({"field_id": referral.field_id}):
        raise HTTPException(404, "Field not found")

    doc = referral.dict()
    doc["referral_id"] = new_id()
    doc["status"] = "pending"
    doc["created_at"] = datetime.utcnow()
    lab_referrals_col.insert_one(dict(doc))
    return doc


@router.patch("/{referral_id}/complete")
def complete_referral(referral_id: str):
    result = lab_referrals_col.find_one_and_update(
        {"referral_id": referral_id}, {"$set": {"status": "completed"}}
    )
    if not result:
        raise HTTPException(404, "Referral not found")
    result.pop("_id", None)
    return result


@router.get("/{field_id}")
def get_referrals_for_field(field_id: str):
    return list(lab_referrals_col.find({"field_id": field_id}, {"_id": 0}))
