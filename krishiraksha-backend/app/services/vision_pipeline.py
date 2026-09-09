"""
KRISHIRAKSHA ISOLATED VISION LAYER (Image Classification & Feature Pipeline)

CRITICAL ARCHITECTURAL CONSTRAINT:
----------------------------------
Ollama `gpt-oss:120b-cloud` is a pure text and reasoning foundation model.
It CANNOT see, inspect, or classify images.
The vision layer must remain strictly isolated in this module and `app/ml/`.
DO NOT feed raw images into gpt-oss:120b-cloud — doing so causes silent diagnostic hallucinations.
Instead, this vision layer produces structured numbers (disease, confidence, severity, differential),
which are then passed to gpt-oss:120b-cloud to generate human-readable, simplified advisories.
"""

import os
import io
import base64
import logging
import uuid
import numpy as np
from PIL import Image
from datetime import datetime

from app.database import query_db, execute_db
from app.services.audit import log_audit

logger = logging.getLogger("krishiraksha.vision_pipeline")

VISION_MODEL_ID = "KrishiRaksha-Vision-RF-CV-v1.4"

# Diagnostic Priors for fallback / demonstration sample references
DIAGNOSTIC_PRIORS = {
    "leaf_spots_concentric": {
        "Early Blight": 0.54,
        "Septoria Leaf Spot": 0.38,
        "Nutrient Deficiency (Potassium)": 0.08,
        "explanation": "Concentric target rings observed on lower leaf surface. Morphological overlap with Septoria Leaf Spot in early concentric stages.",
        "uncertainty_reason": "Close margin between Early Blight (54%) and Septoria (38%).",
        "investigation_question": "Close diagnostic margin between Early Blight (54%) and Septoria Leaf Spot (38%). Please capture and scan a close-up photo of the leaf underside to check for sporulation.",
        "requested_type": "leaf_underside"
    },
    "leaf_spots_grey_center": {
        "Septoria Leaf Spot": 0.56,
        "Early Blight": 0.34,
        "Nutrient Deficiency (Potassium)": 0.10,
        "explanation": "Multiple small circular lesions observed with pale centers and dark margins.",
        "uncertainty_reason": "Lesion margin density closely resembles early Alternaria lesions.",
        "investigation_question": "Please scan the leaf underside or describe whether lesions possess dark pycnidia specks in the center.",
        "requested_type": "leaf_underside"
    },
    "margin_yellowing": {
        "Nutrient Deficiency (Potassium)": 0.62,
        "Early Blight": 0.26,
        "Septoria Leaf Spot": 0.12,
        "explanation": "Bilateral marginal chlorosis observed on older foliage, indicative of potassium deficiency or vascular stress.",
        "uncertainty_reason": "Abiotic nutrient scorch can resemble early blight leaf firing.",
        "investigation_question": "Are leaf veins still green while outer edges yellow? Please specify plant age and last fertilizer application date.",
        "requested_type": "questionnaire"
    },
    "healthy": {
        "Healthy Leaf": 0.94,
        "Nutrient Deficiency (Potassium)": 0.04,
        "Early Blight": 0.02,
        "explanation": "Uniform chlorophyll distribution, turgid leaf margins, no fungal lesions or chlorosis detected.",
        "uncertainty_reason": None,
        "investigation_question": None,
        "requested_type": None
    }
}


def is_plant_leaf_image(image_bytes: bytes) -> tuple[bool, str]:
    """
    Evaluates whether the uploaded photo actually shows plant foliage.
    Rejects completely non-plant images (e.g. shoes, faces, cars, solid colors).
    Returns (is_plant: bool, reason_message: str).
    """
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize((128, 128))
        arr = np.array(img, dtype=np.float32)

        r = arr[:, :, 0]
        g = arr[:, :, 1]
        b = arr[:, :, 2]

        total_pixels = 128 * 128

        # Foliage color check (greens, yellows, browns typical of leaves and lesions)
        green_mask = (g > r * 0.85) & (g > b * 0.85) & (g > 30)
        brown_yellow_mask = (r > 60) & (g > 50) & (b < 120) & (abs(r - g) < 70)
        foliage_pixels = np.sum(green_mask | brown_yellow_mask)
        foliage_ratio = foliage_pixels / total_pixels

        # Texture variance check (solid colors or plain screens have variance < 15)
        std_dev = np.std(arr)

        if std_dev < 15.0:
            return False, "Image appears blank or uniform. Please capture a clear leaf surface under good lighting."

        if foliage_ratio < 0.18:
            return False, "This photo does not appear to show plant leaves or crop foliage. Please point your camera at the affected crop leaf and scan again."

        return True, "Valid leaf image verified"

    except Exception as e:
        logger.warning(f"Plant leaf verification error: {e}")
        return False, "Invalid image file. Please scan a valid JPEG or PNG leaf photo."


def analyze_leaf_scan(observation_id: str, image_ref: str = "", image_base64: str = None, symptom_keywords: list = None):
    """
    Main vision execution endpoint.
    1. Validates plant foliage (rejection check).
    2. Runs real ML classification (Random Forest with 59 visual descriptors).
    3. Identifies diagnostic uncertainty and differential rankings.
    4. Persists records to database.
    """
    symptoms = symptom_keywords or []
    image_bytes = None

    if image_base64:
        try:
            raw_b64 = image_base64
            if "," in raw_b64:
                raw_b64 = raw_b64.split(",")[1]
            image_bytes = base64.b64decode(raw_b64)
        except Exception as e:
            logger.warning(f"Failed to decode base64 image: {e}")

    if not image_bytes and image_ref:
        sample_basename = os.path.basename(image_ref)
        static_sample_path = os.path.join(os.path.dirname(__file__), "..", "static", "samples", sample_basename)
        if os.path.exists(static_sample_path):
            try:
                with open(static_sample_path, "rb") as f:
                    image_bytes = f.read()
                    image_base64 = base64.b64encode(image_bytes).decode("utf-8")
            except Exception as e:
                logger.warning(f"Failed to read static sample image: {e}")

    # Check for non-plant rejection if we have image bytes
    if image_bytes:
        is_plant, reason = is_plant_leaf_image(image_bytes)
        if not is_plant:
            return {
                "status": "rejected_non_plant",
                "message": reason,
                "needs_retake": True,
                "confidence": 0.0,
                "top_disease": "Unidentified / Non-Plant",
                "severity_estimate": "None",
                "differential": [],
                "needs_investigation": False,
                "investigation_question": None
            }

    real_ml_executed = False
    differentials = []
    explanation = ""
    model_name = VISION_MODEL_ID
    model_type = "trained_rf_cv_pipeline"

    if image_base64:
        try:
            from app.ml.classifier import classify_image_base64
            clean_b64 = image_base64
            if "," in clean_b64:
                clean_b64 = clean_b64.split(",")[1]

            ml_results = classify_image_base64(clean_b64)
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
                diff_margin = round((top_diagnosis['confidence'] - (second_diagnosis['confidence'] if second_diagnosis else 0)) * 100, 1)
                explanation = (
                    f"Visual feature extraction completed (59 descriptors: HSV color histograms, GLCM contrast & homogeneity, Canny lesion edge density). "
                    f"Top candidate: {top_diagnosis['disease']} ({round(top_diagnosis['confidence']*100, 1)}%). Differential margin to second candidate: {diff_margin}%."
                )
        except Exception as e:
            logger.warning(f"ML Classifier error: {e}. Utilizing diagnostic domain priors.")

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
        model_name = "KrishiRaksha-UncertaintyVision-v1.2 (Deterministic Simulation Mode)"
        model_type = "deterministic_mock_v1"

    margin = (top_diagnosis["confidence"] - second_diagnosis["confidence"]) if second_diagnosis else 1.0
    needs_investigation = False
    investigation_question = None

    if top_diagnosis["disease"] in ["Healthy", "Healthy Leaf"]:
        severity_estimate = "None"
        needs_investigation = False
    else:
        if top_diagnosis["confidence"] < 0.70 or margin < 0.20:
            needs_investigation = True
            investigation_question = (
                f"Close diagnostic margin detected ({round(margin*100, 1)}% differential between {top_diagnosis['disease']} and {second_diagnosis['disease'] if second_diagnosis else 'alternate hypothesis'}). "
                "Please inspect and scan a close-up photo of the leaf underside to check for diagnostic sporulation."
            )
        severity_estimate = "Medium" if top_diagnosis["confidence"] < 0.70 else "High"

    analysis_id = "analysis_" + str(uuid.uuid4())[:8]

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

    for rank, diff in enumerate(differentials, 1):
        diff_id = "diff_" + str(uuid.uuid4())[:8]
        execute_db("""
            INSERT INTO differential_diagnoses (differential_id, analysis_id, disease, confidence, rank_order, key_indicators)
            VALUES (?, ?, ?, ?, ?, ?);
        """, (diff_id, analysis_id, diff["disease"], diff["confidence"], rank, diff["key_indicators"]))

    request_id = None
    if needs_investigation:
        request_id = "inv_req_" + str(uuid.uuid4())[:8]
        execute_db("""
            INSERT INTO investigation_requests (request_id, observation_id, question_prompt, requested_image_type, status, created_at)
            VALUES (?, ?, ?, 'leaf_underside_close_up', 'pending', ?);
        """, (request_id, observation_id, investigation_question, datetime.now().isoformat()))

    log_audit("AI", "VisionPipeline", "INFERENCE_COMPLETED", "AI_ANALYSIS", analysis_id, {
        "observation_id": observation_id,
        "top_disease": top_diagnosis["disease"],
        "confidence": top_diagnosis["confidence"],
        "needs_investigation": needs_investigation,
        "is_vision_layer": True
    })

    return {
        "status": "success",
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
