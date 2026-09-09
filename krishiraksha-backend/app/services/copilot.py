"""
Grounded AI Agricultural Copilot Service powered by Ollama gpt-oss:120b-cloud.

CRITICAL ARCHITECTURAL BOUNDARY:
--------------------------------
gpt-oss:120b-cloud is a language and reasoning model — IT CANNOT LOOK AT OR CLASSIFY IMAGES.
It must never be fed image pixels or asked to perform leaf disease classification.
The computer vision layer (app/services/vision_pipeline.py & app/ml/) performs the actual
image feature extraction and classification. gpt-oss:120b-cloud strictly consumes the
vision layer's structured output (disease, confidence, severity, differentials) and turns it
into human-readable, simplified, translated, farmer-friendly advisories and drives Copilot chat.
Keep OLLAMA_API_KEY server-side only — never expose it in client bundles.
"""

import os
import json
import logging
from datetime import datetime
from app.database import query_db

logger = logging.getLogger("krishiraksha.copilot")

# Model configuration
COPILOT_MODEL = "gpt-oss:120b-cloud"
OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY", "")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "https://ollama.com")


def get_ollama_client():
    """
    Initializes Ollama client for Ollama Cloud (https://ollama.com) or local daemon.
    """
    try:
        import ollama
        if OLLAMA_API_KEY:
            return ollama.Client(
                host=OLLAMA_HOST,
                headers={"Authorization": f"Bearer {OLLAMA_API_KEY}"}
            )
        else:
            return ollama.Client(host=os.getenv("OLLAMA_LOCAL_HOST", "http://localhost:11434"))
    except Exception as e:
        logger.warning(f"Could not initialize Ollama client: {e}")
        return None


def get_field_context_bundle(field_id: str):
    """
    Assembles a comprehensive, grounded context package from the database.
    """
    field = query_db("SELECT * FROM fields WHERE field_id = ?", (field_id,), one=True)
    if not field and field_id:
        field = query_db("SELECT * FROM fields LIMIT 1", one=True)
        if field:
            field_id = field["field_id"]

    passport = query_db("SELECT * FROM health_passports WHERE field_id = ?", (field_id,), one=True)
    observations = query_db("SELECT * FROM observations WHERE field_id = ? ORDER BY created_at DESC LIMIT 4", (field_id,))
    reviews = query_db("""
        SELECT er.*, o.created_at as obs_time
        FROM expert_reviews er
        JOIN observations o ON er.observation_id = o.observation_id
        WHERE o.field_id = ?
        ORDER BY er.created_at DESC LIMIT 3;
    """, (field_id,))
    risk = query_db("SELECT * FROM risk_assessments WHERE field_id = ? ORDER BY created_at DESC LIMIT 1", (field_id,), one=True)
    interventions = query_db("SELECT * FROM interventions WHERE field_id = ? ORDER BY created_at DESC LIMIT 2", (field_id,))
    cluster = query_db("SELECT * FROM clusters WHERE active_status = 'active' LIMIT 1", one=True)
    alerts = query_db("SELECT * FROM alerts WHERE field_id = ? ORDER BY created_at DESC LIMIT 2", (field_id,))
    kb_docs = query_db("SELECT disease, description, escalation_note FROM knowledge_documents LIMIT 4")

    return {
        "field": field,
        "passport": passport,
        "observations": observations,
        "reviews": reviews,
        "risk": risk,
        "interventions": interventions,
        "cluster": cluster,
        "alerts": alerts,
        "kb_docs": kb_docs
    }


def call_gpt_oss_120b(query: str, role: str, context_bundle: dict, lang: str = "en"):
    """
    Queries gpt-oss:120b-cloud via Ollama with rich agricultural context.
    """
    try:
        import ollama

        field = context_bundle["field"] or {}
        passport = context_bundle["passport"] or {}
        reviews = context_bundle["reviews"] or []
        risk = context_bundle["risk"] or {}
        cluster = context_bundle["cluster"] or {}
        alerts = context_bundle["alerts"] or []

        # Construct context summary for LLM prompt
        context_str = f"""
FIELD CONTEXT:
- Field ID: {field.get('field_id', '104')}
- Farmer: {field.get('owner_name', 'Ramesh Patil')} (Village: {field.get('village', 'Khed')})
- Crop: {field.get('crop', 'Tomato')} ({field.get('variety', 'Abhinav')})
- Growth Stage: {field.get('growth_stage', 'Flowering')}
- Soil / Moisture: {field.get('soil_type', 'Black Cotton')}, Moisture {field.get('moisture_level', 'High')}
- Current Risk: {field.get('current_risk_score', 82)}/100 ({field.get('current_risk_level', 'High')})

HEALTH PASSPORT:
- Status Trend: {passport.get('trend_label', 'Worsening')}
- Total Scans: {passport.get('total_scans_recorded', 4)}
- Primary Recurring Issue: {passport.get('primary_recurring_issue', 'Alternaria Solani (Early Blight)')}
- Summary: {passport.get('summary_narrative', 'Elevated canopy moisture has increased foliar lesions.')}

LATEST EXPERT VERIFICATION:
{f"- Pathologist {reviews[0].get('expert_name')}: Confirmed '{reviews[0].get('confirmed_disease')}' with severity '{reviews[0].get('severity')}'. Notes: {reviews[0].get('comments')}" if reviews else "- None yet recorded."}

SPATIAL & REGIONAL SIGNALS:
- Active Regional Cluster: {cluster.get('cluster_name', 'Pune Solanaceae Blight Outbreak')} (Radius: {cluster.get('radius_km', 4.2)} km, Risk: {cluster.get('risk_tier', 'Tier 2 Escalation')})
- Proximity Alerts: {alerts[0].get('message') if alerts else 'No immediate proximity alert.'}
"""

        # Role-based prompt specialization (Item 6)
        if role == "farmer":
            system_instruction = f"""You are CultivAI AI Agricultural Copilot for Farmers, powered by the reasoning model gpt-oss:120b-cloud.
Your role: Provide concise, trustworthy, empathetic, and culturally grounded agricultural guidance.
Rules:
- Keep answers to 2-4 sentences max.
- Always cite specific evidence from the Field Health Passport or regional clusters provided below.
- Strictly non-prescriptive IPM: No chemical pesticide brand names or toxic dosages. Recommend safe cultural steps (pruning, drip irrigation) and contacting the local Krishi Vigyan Kendra (KVK).
"""
        else:
            system_instruction = f"""You are CultivAI AI Copilot for Agricultural Extension Officers and Plant Pathologists, powered by gpt-oss:120b-cloud.
Provide concise, dense, evidence-based epidemiological analysis referencing ICAR protocols, spatial risk indices, and differential margins.
TARGET LANGUAGE: {'Hindi' if lang == 'hi' else ('Marathi' if lang == 'mr' else 'English')}"""

        user_prompt = f"""Context:
{context_str}

User Question ({role}): "{query}"

Please provide a clear response in {'Hindi' if lang == 'hi' else ('Marathi' if lang == 'mr' else 'English')} adhering strictly to your role style constraints."""

        client = get_ollama_client()
        if client:
            response = client.chat(
                model=COPILOT_MODEL,
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": user_prompt}
                ],
                options={"temperature": 0.2}
            )
            content = response["message"]["content"]
            return content, True
        return None, False

    except Exception as e:
        logger.warning(f"Ollama {COPILOT_MODEL} invocation error: {e}. Utilizing grounded fallback.")
        return None, False


def ask_copilot(query: str, role: str = "Farmer", field_id: str = "104", lang: str = "en"):
    """
    RAG-grounded copilot answering user queries across 4 roles using gpt-oss:120b-cloud.
    Includes source citations and fallback rule-based generation if LLM is unavailable.
    """
    q = query.lower()
    citations = []
    
    # 1. Fetch DB Grounded Context Bundle
    context_bundle = get_field_context_bundle(field_id)
    field = context_bundle["field"] or {"field_id": field_id, "owner_name": "Farmer", "crop": "Tomato"}
    
    citations.append(f"Field Health Passport #{field.get('field_id', '104')}")
    if context_bundle["reviews"]:
        r = context_bundle["reviews"][0]
        citations.append(f"ICAR Expert Review #{r['review_id']} ({r['expert_name']})")
    if context_bundle["cluster"]:
        citations.append(f"Spatial Cluster Register: {context_bundle['cluster']['cluster_name']}")

    # 2. Query gpt-oss:120b-cloud
    llm_answer, success = call_gpt_oss_120b(query, role, context_bundle, lang)

    if success and llm_answer:
        return {
            "query": query,
            "role": role,
            "field_id": field_id,
            "language": lang,
            "response": llm_answer,
            "citations": citations,
            "model_used": COPILOT_MODEL,
            "engine": "gpt-oss:120b-cloud (Local LLM via Ollama)",
            "execution_mode": "live_foundation_model",
            "timestamp": datetime.now().isoformat()
        }

    # 3. Deterministic Fallback if LLM is offline
    logger.info("Executing rule-based fallback response.")
    answer_en = ""
    answer_hi = ""

    if any(k in q for k in ["what happened", "history", "last month", "past scan", "record"]):
        observations = context_bundle["observations"]
        reviews = context_bundle["reviews"]
        answer_en = (
            f"**Historical Timeline for Field {field_id} ({field.get('owner_name', '')} — {field.get('crop', '')}):**\n"
            f"• **Scans Recorded:** {len(observations)} observation scans on file.\n"
        )
        if reviews:
            r = reviews[0]
            answer_en += f"• **Expert Review:** {r['expert_name']} confirmed **{r['confirmed_disease']}** ({r['severity']} severity).\n"
        answer_en += "• **Follow-Up:** Longitudinal health passport indicates active surveillance needed.\n"

        answer_hi = (
            f"**खेत {field_id} ({field.get('owner_name', '')} - {field.get('crop', '')}) का इतिहास:**\n"
            f"• कुल {len(observations)} स्कैन दर्ज किए गए हैं।\n"
            f"• विशेषज्ञ ने स्थिति की समीक्षा की है और नियमित निगरानी की सलाह दी है।"
        )

    elif any(k in q for k in ["why is this field", "high risk", "risk score", "risk factor"]):
        risk = context_bundle["risk"]
        score = risk["score"] if risk else field.get("current_risk_score", 82)
        level = risk["level"] if risk else field.get("current_risk_level", "High")
        answer_en = (
            f"**Risk Assessment for Field {field_id} ({score}/100 — {level} Risk):**\n"
            f"The risk score is calculated objectively from verified indicators:\n"
            f"• Phenological susceptibility during flowering stage.\n"
            f"• High relative canopy humidity following morning fog.\n"
            f"• Proximity to the Pune Solanaceae Blight cluster."
        )
        answer_hi = (
            f"**खेत {field_id} का जोखिम स्कोर: {score}/100 ({level})**\n"
            f"यह स्कोर फसल अवस्था, रोग की गंभीरता और पास के खेतों में पुष्टि हुए मामलों पर आधारित है।"
        )

    elif any(k in q for k in ["nearby", "cluster", "verified case", "spread", "neighbor"]):
        cluster = context_bundle["cluster"]
        answer_en = (
            f"**Regional Cluster Intelligence around Field {field_id}:**\n"
            f"• **Active Cluster:** '{cluster['cluster_name'] if cluster else 'Pune Solanaceae Blight'}' (Radius: {cluster['radius_km'] if cluster else 4.2} km).\n"
            f"• **Recommended Action:** Maintain row ventilation and inspect lower foliage for early spots."
        )
        answer_hi = (
            f"**आसपास के क्षेत्र में रोग की स्थिति:**\n"
            f"• सक्रिय क्लस्टर: पुणे-खेड सोलानेसी ब्लाइट (दायरा: 4.2 किमी)।\n"
            f"• सावधानी: निचली पत्तियों पर धब्बों की निगरानी रखें।"
        )

    else:
        response_text = (
            f"**CultivAI Agricultural Advisory for Field {field_id}:**\n"
            f"• Current Crop: {field.get('crop', 'Tomato')} ({field.get('variety', 'Abhinav')})\n"
            f"• Recommended Safe Practice: Practice crop sanitation, prune infected lower leaves with sterilized shears, and avoid evening overhead sprinkler irrigation.\n"
            f"• Consult your local KVK extension officer for verified field recommendations."
        )
        answer_en = response_text
        answer_hi = (
            f"**खेत {field_id} के लिए कृषि रक्षा परामर्श:**\n"
            f"• फसल: {field.get('crop', 'टमाटर')}\n"
            f"• सुरक्षित सलाह: संक्रमित पत्तियों को हटाकर नष्ट करें, ड्रिप सिंचाई का प्रयोग करें और केवीके अधिकारी से संपर्क करें।"
        )

    final_text = answer_hi if lang == "hi" else answer_en

    return {
        "query": query,
        "role": role,
        "field_id": field_id,
        "language": lang,
        "response": final_text,
        "citations": citations,
        "model_used": "deterministic_grounded_fallback",
        "engine": "Fallback Rule-Based Engine",
        "execution_mode": "fallback",
        "timestamp": datetime.now().isoformat()
    }


def explain_vision_diagnosis(vision_result: dict, role: str = "Farmer", lang: str = "en") -> dict:
    """
    Takes structured output from the vision layer (disease, confidence, severity, differential)
    and uses gpt-oss:120b-cloud to generate a simplified, translated, farmer-friendly explanation.
    Does NOT ask gpt-oss to classify images — purely interprets the structured numbers.
    """
    disease = vision_result.get("top_disease", "Foliar Spot")
    conf = round(float(vision_result.get("top_confidence", 0.7)) * 100, 1)
    sev = vision_result.get("severity_estimate", "Medium")

    target_lang = "Hindi" if lang == "hi" else ("Marathi" if lang == "mr" else "English")

    system_prompt = f"""You are CultivAI Reasoning Assistant, powered by gpt-oss:120b-cloud.
A separate computer vision model detected: Disease '{disease}' with {conf}% confidence and {sev} severity.
Explain this diagnosis to an Indian farmer in 2 to 3 short, comforting sentences.
State clearly what they should do next (e.g. prune diseased leaves, avoid wet canopy).
Do NOT recommend specific chemical pesticides.
Respond in {target_lang}."""

    client = get_ollama_client()
    if client:
        try:
            res = client.chat(
                model=COPILOT_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Summarize diagnosis: {disease} ({conf}%, {sev} severity)."}
                ],
                options={"temperature": 0.2}
            )
            return {
                "explanation": res["message"]["content"],
                "engine": "gpt-oss:120b-cloud (Language Layer)",
                "status": "llm_generated"
            }
        except Exception as e:
            logger.warning(f"Ollama explain error: {e}")

    # Fallback explanation
    if lang == "hi":
        fallback_text = f"पत्तियों पर {disease} के लक्षण ({conf}% निश्चितता) देखे गए हैं। रोगग्रस्त पत्तियों को काटकर अलग करें और पानी सीधे जड़ों में दें।"
    elif lang == "mr":
        fallback_text = f"पानांवर {disease} ची लक्षणे ({conf}% शक्यता) आढळली आहेत. बाधित पाने काढून टाका आणि झाडांना योग्य हवा खेळती ठेवा."
    else:
        fallback_text = f"Your plant shows signs of {disease} ({conf}% confidence, {sev} severity). Isolate affected lower leaves to halt spore spread and ensure good canopy airflow."

    return {
        "explanation": fallback_text,
        "engine": "Grounded Fallback Engine",
        "status": "fallback_generated"
    }

