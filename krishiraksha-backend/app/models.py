from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid


def new_id() -> str:
    return str(uuid.uuid4())[:8]


class FieldIn(BaseModel):
    owner_name: str
    crop: str
    variety: str
    growth_stage: str
    latitude: float
    longitude: float
    soil_type: Optional[str] = None
    soil_moisture_pct: Optional[float] = None


class FieldOut(FieldIn):
    field_id: str


class ObservationIn(BaseModel):
    field_id: str
    image_ref: str  # filename/reference, kept for display purposes
    image_base64: Optional[str] = None  # if provided, the REAL trained classifier runs on this
    symptom_keywords: List[str] = []  # fallback path only, used when no image is provided
    notes: Optional[str] = None


class DifferentialDiagnosisEntry(BaseModel):
    disease: str
    confidence: float


class AIAnalysisOut(BaseModel):
    analysis_id: str
    observation_id: str
    differential: List[DifferentialDiagnosisEntry]
    top_confidence: float
    severity_estimate: str
    needs_investigation: bool
    investigation_request: Optional[str] = None
    created_at: datetime


class ExpertReviewIn(BaseModel):
    observation_id: str
    confirmed_disease: str
    severity: str  # Low / Medium / High
    comments: Optional[str] = None
    expert_name: str


class ExpertReviewOut(ExpertReviewIn):
    review_id: str
    ai_original_diagnosis: str
    ai_original_confidence: float
    agreement: bool
    created_at: datetime


class RiskFactor(BaseModel):
    label: str
    weight: int


class RiskAssessmentOut(BaseModel):
    field_id: str
    score: int
    level: str
    factors: List[RiskFactor]
    created_at: datetime


class AlertOut(BaseModel):
    alert_id: str
    field_id: str
    alert_type: str
    disease: str
    message: str
    treatment_summary: str
    distance_km: float
    created_at: datetime
    sync_status: str = "synced"  # "pending" if generated for an offline farmer, mirrors mobile offline model


class KnowledgeDocumentOut(BaseModel):
    disease: str
    description: str
    symptoms: List[str]
    prevention: List[str]
    safe_next_steps: List[str]
    escalation_note: str


class InterventionIn(BaseModel):
    field_id: str
    action_taken: str
    officer_name: str


class FollowUpOut(BaseModel):
    followup_id: str
    field_id: str
    due_date: str
    status: str


class OutcomeIn(BaseModel):
    field_id: str
    followup_id: str
    new_severity_pct: int


class OutcomeOut(BaseModel):
    field_id: str
    previous_severity_pct: int
    new_severity_pct: int
    interpretation: str
    created_at: datetime


class SensorReadingIn(BaseModel):
    field_id: str
    sensor_type: str  # e.g. "pheromone_trap", "soil_moisture", "leaf_wetness"
    value: float
    unit: str  # e.g. "pests_per_trap", "%", "hours"


class SensorReadingOut(SensorReadingIn):
    reading_id: str
    created_at: datetime


class LabReferralIn(BaseModel):
    field_id: str
    reason: str
    referred_by: str


class LabReferralOut(LabReferralIn):
    referral_id: str
    status: str  # "pending" / "completed"
    created_at: datetime
