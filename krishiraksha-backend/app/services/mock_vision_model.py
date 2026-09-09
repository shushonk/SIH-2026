"""
MOCK VISION & UNCERTAINTY ENGINE (Explicitly Labeled Deterministic Mock)

IMPORTANT DISCLOSURE:
This module is a deterministic AI vision and diagnostic uncertainty simulation engine.
It demonstrates the closed-loop decision architecture:
  Observe -> Investigate -> Verify -> Assess -> Prioritize -> Act -> Monitor -> Learn
It simulates real probabilistic outputs, uncertainty flagging, differential diagnosis,
and evidence-based narrowing upon follow-up investigation.
"""

import os
import base64
import logging
import json
import uuid
from datetime import datetime
from app.database import query_db, execute_db
from app.services.audit import log_audit

logger = logging.getLogger("krishiraksha.vision")
MODEL_IDENTIFIER = "KrishiRaksha-UncertaintyVision-v1.2 (Deterministic Simulation Mode)"

# Knowledge base disease characteristics and diagnostic priors
DIAGNOSTIC_PRIORS = {
    "leaf_spots_concentric": {
        "Early Blight": 0.54,
        "Septoria Leaf Spot": 0.38,
        "Nutrient Deficiency (Potassium)": 0.08,
        "explanation": "Concentric target rings observed on lower leaf surface. However, early lesions share border characteristics with Septoria Leaf Spot at this resolution.",
        "uncertainty_reason": "High morphological overlap between Early Blight and Septoria Leaf Spot in early concentric stages.",
        "investigation_question": "Close diagnostic margin between Early Blight (54%) and Septoria Leaf Spot (38%). Please upload a clear photo of the leaf underside to check for diagnostic sporulation, or specify symptom onset in days.",
        "requested_type": "leaf_underside"
    },
    "leaf_spots_grey_center": {
        "Septoria Leaf Spot": 0.56,
        "Early Blight": 0.34,
        "Nutrient Deficiency (Potassium)": 0.10,
        "explanation": "Multiple small circular lesions observed with pale centers. Margin contrast is subtle under current lighting.",
        "uncertainty_reason": "Margin density closely approximates early Alternaria lesions.",
        "investigation_question": "Please upload a photo of the leaf underside or describe whether lesions possess dark pycnidia specks in the center.",
        "requested_type": "leaf_underside"
    },
    "margin_yellowing": {
        "Nutrient Deficiency (Potassium)": 0.62,
        "Early Blight": 0.26,
        "Septoria Leaf Spot": 0.12,
        "explanation": "Bilateral marginal chlorosis observed on older foliage, characteristic of potassium deficiency or early vascular stress.",
        "uncertainty_reason": "Abiotic nutrient scorch can resemble early blight leaf firing.",
        "investigation_question": "Are leaf veins green while edges yellow? Please specify plant age and last fertilizer application date.",
        "requested_type": "questionnaire"
    },
    "healthy": {
        "Healthy Leaf": 0.94,
        "Nutrient Deficiency (Potassium)": 0.04,
        "Early Blight": 0.02,
        "explanation": "Uniform chlorophyll distribution, turgid leaf margins, no fungal lesions detected.",
        "uncertainty_reason": None,
        "investigation_question": None,
        "requested_type": None
    }
}


def run_observation_analysis(observation_id: str, symptom_keywords: list = None, image_ref: str = "", image_base64: str = None):
    """
    Executes primary observation inference.
    Supports real ML classification when an image is uploaded or selected from curated samples,
    with deterministic prior fallback.
    Returns: top disease, confidence, differential diagnosis list, severity,
    uncertainty flag, and targeted investigation request.
    """
    symptoms = symptom_keywords or []
    real_ml_executed = False
    differentials = []
    model_name = MODEL_IDENTIFIER
    model_type = "deterministic_mock_v1"
    explanation = ""

    # Check if image_ref matches a local static sample
    if not image_base64 and image_ref:
        sample_basename = os.path.basename(image_ref)
        static_sample_path = os.path.join(os.path.dirname(__file__), "..", "static", "samples", sample_basename)
        if os.path.exists(static_sample_path):
            try:
                with open(static_sample_path, "rb") as f:
                    image_base64 = base64.b64encode(f.read()).decode("utf-8")
            except Exception as e:
                logger.warning(f"Could not read static sample image: {e}")

    # Attempt real trained ML feature extraction and Random Forest inference
    if image_base64:
        try:
            from app.ml.classifier import classify_image_base64
            ml_results = classify_image_base64(image_base64)
            if ml_results and len(ml_results) > 0:
                differentials = [
                    {
                        "disease": r["disease"],
                        "confidence": float(r["confidence"]),
                        "key_indicators": "Visual descriptors (HSV color spaces, GLCM texture, edge density) via trained Random Forest"
                    }
                    for r in ml_results
                ]
                differentials.sort(key=lambda x: x["confidence"], reverse=True)
                top_diagnosis = differentials[0]
                second_diagnosis = differentials[1] if len(differentials) > 1 else None
                real_ml_executed = True
                model_name = "KrishiRaksha Hybrid Uncertainty Classifier v1.2"
                model_type = "trained_rf_cv_pipeline"
                diff_margin = round((top_diagnosis['confidence'] - (second_diagnosis['confidence'] if second_diagnosis else 0)) * 100, 1)
                explanation = (
                    f"Machine learning feature analysis completed (59 visual descriptors: HSV color histograms, GLCM contrast & homogeneity, Canny lesion edge density). "
                    f"Top candidate: {top_diagnosis['disease']} ({round(top_diagnosis['confidence']*100, 1)}%). Margin to second candidate: {diff_margin}%."
                )
        except Exception as e:
            logger.warning(f"ML Classifier error: {e}. Falling back to deterministic prior.")

    # If real ML was not used or failed, use domain priors based on symptoms
    if not real_ml_executed:
        matched_key = "leaf_spots_concentric"
        for s in symptoms:
            if s in DIAGNOSTIC_PRIORS:
                matched_key = s
                break

        profile = DIAGNOSTIC_PRIORS[matched_key]
        differentials = []
        for disease, conf in profile.items():
            if disease not in ["explanation", "uncertainty_reason", "investigation_question", "requested_type"]:
                differentials.append({
                    "disease": disease,
                    "confidence": conf,
                    "key_indicators": f"Primary match for observed {matched_key.replace('_', ' ')}"
                })

        differentials.sort(key=lambda x: x["confidence"], reverse=True)
        top_diagnosis = differentials[0]
        second_diagnosis = differentials[1] if len(differentials) > 1 else None
        explanation = profile["explanation"]

    # Uncertainty evaluation:
    # Trigger investigation if confidence < 0.70 or margin between top 2 < 0.20
    margin = (top_diagnosis["confidence"] - second_diagnosis["confidence"]) if second_diagnosis else 1.0
    needs_investigation = False
    investigation_question = None

    if top_diagnosis["disease"] in ["Healthy", "Healthy Leaf"]:
        severity_estimate = "None"
        needs_investigation = False
        investigation_question = None
    else:
        if top_diagnosis["confidence"] < 0.70 or margin < 0.20:
            needs_investigation = True
            investigation_question = (
                f"Close diagnostic margin detected ({round(margin*100, 1)}% differential between {top_diagnosis['disease']} and {second_diagnosis['disease'] if second_diagnosis else 'alternate hypothesis'}). "
                "Please inspect and upload a close-up photo of the leaf underside to evaluate sporulation and fungal signs."
            )
        severity_estimate = "Medium" if top_diagnosis["confidence"] < 0.70 else "High"

    analysis_id = "analysis_" + str(uuid.uuid4())[:8]

    # Persist in DB
    execute_db("""
        INSERT INTO ai_analyses (
            analysis_id, observation_id, model_name, top_disease, top_confidence,
            severity_estimate, explanation, needs_investigation, investigation_question,
            model_type, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        analysis_id,
        observation_id,
        model_name,
        top_diagnosis["disease"],
        top_diagnosis["confidence"],
        severity_estimate,
        explanation,
        1 if needs_investigation else 0,
        investigation_question,
        model_type,
        datetime.now().isoformat()
    ))

    # Persist differential entries
    for rank, diff in enumerate(differentials, 1):
        diff_id = "diff_" + str(uuid.uuid4())[:8]
        execute_db("""
            INSERT INTO differential_diagnoses (differential_id, analysis_id, disease, confidence, rank_order, key_indicators)
            VALUES (?, ?, ?, ?, ?, ?);
        """, (diff_id, analysis_id, diff["disease"], diff["confidence"], rank, diff["key_indicators"]))

    # If investigation is required, register the pending request
    request_id = None
    if needs_investigation:
        request_id = "inv_req_" + str(uuid.uuid4())[:8]
        req_type = profile.get("requested_type", "leaf_underside_close_up") if not real_ml_executed else "leaf_underside_close_up"
        execute_db("""
            INSERT INTO investigation_requests (request_id, observation_id, question_prompt, requested_image_type, status, created_at)
            VALUES (?, ?, ?, ?, 'pending', ?);
        """, (request_id, observation_id, investigation_question, req_type, datetime.now().isoformat()))

    # Audit log
    log_audit("AI", "MockVisionModel", "INFERENCE_COMPLETED", "AI_ANALYSIS", analysis_id, {
        "observation_id": observation_id,
        "top_disease": top_diagnosis["disease"],
        "confidence": top_diagnosis["confidence"],
        "needs_investigation": needs_investigation
    })

    return {
        "analysis_id": analysis_id,
        "observation_id": observation_id,
        "model_name": model_name,
        "top_disease": top_diagnosis["disease"],
        "top_confidence": top_diagnosis["confidence"],
        "severity_estimate": severity_estimate,
        "explanation": explanation,
        "needs_investigation": needs_investigation,
        "investigation_question": investigation_question,
        "investigation_request_id": request_id,
        "differential": differentials,
        "created_at": datetime.now().isoformat()
    }


def narrow_investigation(observation_id: str, farmer_answer: str = "", underside_image_b64: str = None, underside_image_ref: str = ""):
    """
    Simulates the differential narrowing step upon farmer follow-up evidence.
    When a leaf-underside image or specific answers are provided, the model resolves
    the ambiguity and updates the differential diagnosis with high confidence.
    """
    obs = query_db("SELECT * FROM observations WHERE observation_id = ?", (observation_id,), one=True)
    if not obs:
        raise ValueError("Observation not found")

    existing_analysis = query_db(
        "SELECT * FROM ai_analyses WHERE observation_id = ? ORDER BY created_at DESC LIMIT 1",
        (observation_id,),
        one=True
    )

    # Deterministic narrowing rules:
    # If underside confirms dark velvety concentric sporulation -> Early Blight rises to 88%
    # If user mentions grey center with black dots -> Septoria rises to 87%
    # Default underside upload narrows to Early Blight 88% (matching demo storyline)
    narrowed_disease = "Early Blight"
    narrowed_confidence = 0.88
    alternative_confidence = 0.08
    potassium_confidence = 0.04
    narrative = (
        "Leaf underside evidence received: Micro-concentric sporulation confirmed without Septoria pycnidia specks. "
        "Diagnostic ambiguity resolved. Confidence updated from 54% to 88%. Severity confirmed Medium-High."
    )

    if farmer_answer and "grey" in farmer_answer.lower():
        narrowed_disease = "Septoria Leaf Spot"
        narrowed_confidence = 0.86
        alternative_confidence = 0.09
        potassium_confidence = 0.05
        narrative = "Farmer reported black specks within pale lesion centers. Septoria lycopersici confirmed with 86% confidence."

    # Update the investigation request record
    execute_db("""
        UPDATE investigation_requests
        SET farmer_answer = ?, narrowed_disease = ?, narrowed_confidence = ?, status = 'completed', answered_at = ?
        WHERE observation_id = ?;
    """, (
        farmer_answer or "Leaf underside photo uploaded",
        narrowed_disease,
        narrowed_confidence,
        datetime.now().isoformat(),
        observation_id
    ))

    # Record underside image if provided
    if underside_image_b64 or underside_image_ref:
        img_id = "img_" + str(uuid.uuid4())[:8]
        execute_db("""
            INSERT INTO images (image_id, observation_id, image_type, image_url, image_base64, captured_at)
            VALUES (?, ?, 'underside', ?, ?, ?);
        """, (img_id, observation_id, underside_image_ref or "underside_scan.jpg", underside_image_b64, datetime.now().isoformat()))

    # Update observation status to ready for expert review
    execute_db("UPDATE observations SET status = 'escalated_to_expert' WHERE observation_id = ?;", (observation_id,))

    # Update the AI Analysis record with narrowed results
    execute_db("""
        UPDATE ai_analyses
        SET top_disease = ?, top_confidence = ?, severity_estimate = 'High',
            needs_investigation = 0,
            explanation = ?
        WHERE observation_id = ?;
    """, (narrowed_disease, narrowed_confidence, narrative, observation_id))

    # Update differential diagnoses
    analysis_id = existing_analysis["analysis_id"]
    execute_db("DELETE FROM differential_diagnoses WHERE analysis_id = ?;", (analysis_id,))

    new_differentials = [
        (f"diff_{uuid.uuid4().hex[:8]}", analysis_id, narrowed_disease, narrowed_confidence, 1, "Underside morphological structure verified"),
        (f"diff_{uuid.uuid4().hex[:8]}", analysis_id, "Septoria Leaf Spot" if narrowed_disease == "Early Blight" else "Early Blight", alternative_confidence, 2, "Residual differential entry"),
        (f"diff_{uuid.uuid4().hex[:8]}", analysis_id, "Nutrient Deficiency (Potassium)", potassium_confidence, 3, "Abiotic chlorosis ruled out as primary pathogen"),
    ]
    for d in new_differentials:
        execute_db("""
            INSERT INTO differential_diagnoses (differential_id, analysis_id, disease, confidence, rank_order, key_indicators)
            VALUES (?, ?, ?, ?, ?, ?);
        """, d)

    log_audit("Farmer", "Farmer Investigation Followup", "NARROW_DIAGNOSIS", "OBSERVATION", observation_id, {
        "narrowed_disease": narrowed_disease,
        "new_confidence": narrowed_confidence
    })

    return {
        "observation_id": observation_id,
        "status": "escalated_to_expert",
        "narrowed_disease": narrowed_disease,
        "narrowed_confidence": narrowed_confidence,
        "narrative": narrative,
        "differential": [
            {"disease": d[2], "confidence": d[3], "rank": d[4], "key_indicators": d[5]} for d in new_differentials
        ]
    }
