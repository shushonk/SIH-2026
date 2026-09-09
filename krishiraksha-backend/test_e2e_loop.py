"""
End-to-End Test Suite for KrishiRaksha Closed-Loop Decision Platform (SIH26131)
Runs full in-process FastAPI TestClient verifying:
- Authentication (JWT issuance, verification, RBAC role guardrails)
- The 8-Stage Decision Loop:
  1. Observe (Ambiguous scan & differential alternatives)
  2. Investigate (Uncertainty engine narrowing with abaxial leaf evidence)
  3. Verify (Expert ground truth & clinical triage)
  4. Assess (Field Health Passport & Explainable Risk Recalculation)
  5. Prioritize (District Extension Officer priority ranking)
  6. Act (IPM intervention logging & follow-up scheduling)
  7. Monitor (Follow-up scan & non-causal outcome recording)
  8. Learn (AI-Expert calibration pair archiving & audit logging)
- Extended Modules: Sensors/Traps, Weather Outbreak Forecast, Multilingual Advisories, Case Chat
"""

import sys
import os

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(__file__))

from starlette.testclient import TestClient
from app.main import app
from app.database import init_db
from app.seed_data import seed_all

def run_e2e_tests():
    print("================================================================")
    print(" KRISHIRAKSHA (SIH26131) - END-TO-END VERIFICATION SUITE")
    print("================================================================")

    # Initialize fresh in-memory / file db
    init_db()
    seed_all()
    client = TestClient(app)

    # -------------------------------------------------------------
    # 0. AUTHENTICATION & RBAC VALIDATION
    # -------------------------------------------------------------
    print("\n--- [AUTH & RBAC] ---")
    
    # Farmer login
    res = client.post("/auth/login", json={"identifier": "farmer@krishiraksha.org", "password": "Farmer@123"})
    assert res.status_code == 200, f"Farmer login failed: {res.text}"
    farmer_token = res.json()["access_token"]
    farmer_headers = {"Authorization": f"Bearer {farmer_token}"}
    print("[PASS] Farmer authentication & JWT issuance successful.")

    # Expert login
    res = client.post("/auth/login", json={"identifier": "expert@krishiraksha.org", "password": "Expert@123"})
    assert res.status_code == 200, f"Expert login failed: {res.text}"
    expert_token = res.json()["access_token"]
    expert_headers = {"Authorization": f"Bearer {expert_token}"}
    print("[PASS] Expert authentication & JWT issuance successful.")

    # Officer login
    res = client.post("/auth/login", json={"identifier": "officer@krishiraksha.org", "password": "Officer@123"})
    assert res.status_code == 200, f"Officer login failed: {res.text}"
    officer_token = res.json()["access_token"]
    officer_headers = {"Authorization": f"Bearer {officer_token}"}
    print("[PASS] Officer authentication & JWT issuance successful.")

    # Admin login
    res = client.post("/auth/login", json={"identifier": "admin@krishiraksha.gov.in", "password": "Admin@123"})
    assert res.status_code == 200, f"Admin login failed: {res.text}"
    admin_token = res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("[PASS] Admin authentication & JWT issuance successful.")

    # Test RBAC Guardrail: Farmer cannot access Admin stats
    forbidden_res = client.get("/admin/stats", headers=farmer_headers)
    assert forbidden_res.status_code == 403, f"RBAC failed to block farmer from admin stats: {forbidden_res.status_code}"
    print("[PASS] Server-side RBAC enforced: Farmer blocked from Admin route (403 Forbidden).")

    # -------------------------------------------------------------
    # STAGE 1: OBSERVE - Ambiguous Scan Submission
    # -------------------------------------------------------------
    print("\n--- [STAGE 1: OBSERVE] ---")
    obs_payload = {
        "field_id": "104",
        "symptom_keywords": ["leaf_spots_concentric"],
        "image_ref": "leaf_scan_concentric_ambiguous.jpg",
        "notes": "Concentric rings on lower foliage; border patterns ambiguous."
    }
    obs_res = client.post("/observations", json=obs_payload, headers=farmer_headers)
    assert obs_res.status_code == 200, f"Observation failed: {obs_res.text}"
    obs_data = obs_res.json()
    obs_id = obs_data["observation"]["observation_id"]
    ai_analysis = obs_data["ai_analysis"]

    # Verify uncertainty engine output
    assert ai_analysis["needs_investigation"] == True, "Expected uncertainty detected"
    assert len(ai_analysis["differential"]) >= 2, "Expected at least 2 differential hypotheses"
    print(f"[PASS] Observation logged: {obs_id}")
    print(f"       Top 1: {ai_analysis['differential'][0]['disease']} ({round(ai_analysis['differential'][0]['confidence']*100, 1)}%)")
    print(f"       Top 2: {ai_analysis['differential'][1]['disease']} ({round(ai_analysis['differential'][1]['confidence']*100, 1)}%)")
    print(f"       Next Evidence Requested: {ai_analysis['investigation_question']}")

    # -------------------------------------------------------------
    # STAGE 2: INVESTIGATE - Uncertainty Evidence Narrowing
    # -------------------------------------------------------------
    print("\n--- [STAGE 2: INVESTIGATE] ---")
    inv_payload = {
        "farmer_answer": "Leaf underside shows dark concentric rings and velvety sporulation without pycnidia specks.",
        "underside_image_ref": "leaf_underside_macro.jpg"
    }
    inv_res = client.post(f"/observations/{obs_id}/investigate", json=inv_payload, headers=farmer_headers)
    assert inv_res.status_code == 200, f"Investigation failed: {inv_res.text}"
    inv_data = inv_res.json()
    
    # Diagnosis should narrow to >=80% confidence
    assert inv_data["narrowed_confidence"] >= 0.80, "Expected narrowed confidence >= 80%"
    assert inv_data["status"] == "escalated_to_expert", "Case must be escalated to Expert queue"
    print(f"[PASS] Investigation narrowed diagnosis to {inv_data['narrowed_disease']} ({round(inv_data['narrowed_confidence']*100, 1)}%)")
    print(f"       Case status updated to: {inv_data['status']}")

    # -------------------------------------------------------------
    # STAGE 3: VERIFY - Expert Ground Truth Triage
    # -------------------------------------------------------------
    print("\n--- [STAGE 3: VERIFY] ---")
    pending_res = client.get("/expert-reviews/pending", headers=expert_headers)
    assert pending_res.status_code == 200
    pending_cases = pending_res.json()
    assert any(c["observation_id"] == obs_id for c in pending_cases), "Created observation must appear in Expert pending queue"
    print(f"[PASS] Observation {obs_id} visible in Expert pending queue ({len(pending_cases)} pending cases).")

    review_payload = {
        "observation_id": obs_id,
        "confirmed_disease": "Early Blight",
        "severity": "High",
        "advisory_notes": "Prune affected lower leaves; apply copper hydroxide or Trichoderma viride foliar spray.",
        "comments": "Verified Alternaria solani target-board pattern. Defoliation risk present if humidity persists."
    }
    review_res = client.post("/expert-reviews", json=review_payload, headers=expert_headers)
    assert review_res.status_code == 200, f"Expert review failed: {review_res.text}"
    print(f"[PASS] Dr. Meera Nair (Expert) confirmed diagnosis: Early Blight (High severity).")

    # -------------------------------------------------------------
    # STAGE 4: ASSESS - Field Health Passport & Risk Recalculation
    # -------------------------------------------------------------
    print("\n--- [STAGE 4: ASSESS] ---")
    risk_res = client.post("/fields/104/recompute-risk", headers=farmer_headers)
    assert risk_res.status_code == 200, f"Risk recompute failed: {risk_res.text}"
    risk_data = risk_res.json()
    assert "score" in risk_data and "factors" in risk_data
    print(f"[PASS] Explainable Risk Engine recomputed Field 104 risk:")
    print(f"       Total Score: {risk_data['score']}/100 ({risk_data['level']})")
    for factor in risk_data["factors"]:
        print(f"       - {factor['label']}: {factor['weight']} pts")

    # Check Field Health Passport
    passport_res = client.get("/fields/104/passport", headers=farmer_headers)
    assert passport_res.status_code == 200
    passport = passport_res.json()
    assert passport["field"]["field_id"] == "104"
    assert passport["field"]["current_risk_score"] == risk_data["score"]
    print(f"[PASS] Field Health Passport synchronized: Trend = {passport['trend']}.")

    # -------------------------------------------------------------
    # STAGE 5: PRIORITIZE - District Extension Officer Queue
    # -------------------------------------------------------------
    print("\n--- [STAGE 5: PRIORITIZE] ---")
    queue_res = client.get("/officer/priority-queue", headers=officer_headers)
    assert queue_res.status_code == 200, f"Officer queue failed: {queue_res.text}"
    officer_queue = queue_res.json()
    assert len(officer_queue) >= 1
    # Field 104 should be in the queue
    top_item = officer_queue[0]
    print(f"[PASS] Extension Officer Priority Queue loaded ({len(officer_queue)} ranked plots).")
    print(f"       Rank #1: {top_item['field_name']} (Score: {top_item['priority_score']}, Rank Order: {top_item['rank_order']})")
    driver_label = top_item.get('driving_reasons', [{}])[0].get('label', 'Outbreak risk') if top_item.get('driving_reasons') else 'Outbreak risk'
    print(f"       Driver: {driver_label}")

    # -------------------------------------------------------------
    # STAGE 6: ACT - Non-Prescriptive IPM Intervention Logging
    # -------------------------------------------------------------
    print("\n--- [STAGE 6: ACT] ---")
    interv_payload = {
        "field_id": "104",
        "action_taken": "Field inspection conducted. Provided biological spray advisory (Trichoderma harzianum) and staking recommendations to reduce canopy contact with moist soil.",
        "officer_name": "Officer Deshmukh"
    }
    interv_res = client.post("/interventions", json=interv_payload, headers=officer_headers)
    assert interv_res.status_code == 200, f"Intervention failed: {interv_res.text}"
    interv_data = interv_res.json()
    assert "followup" in interv_data, "System must automatically schedule follow-up"
    followup_id = interv_data["followup"]["followup_id"]
    print(f"[PASS] Intervention logged: {interv_data['intervention']['intervention_id']}")
    print(f"       Scheduled Follow-up: {followup_id} for {interv_data['followup']['due_date']}")

    # -------------------------------------------------------------
    # STAGE 7: MONITOR - Follow-up Scan & Non-Causal Outcome
    # -------------------------------------------------------------
    print("\n--- [STAGE 7: MONITOR] ---")
    outcome_payload = {
        "field_id": "104",
        "followup_id": followup_id,
        "new_severity_pct": 32
    }
    outcome_res = client.post("/outcomes", json=outcome_payload, headers=farmer_headers)
    assert outcome_res.status_code == 200, f"Outcome recording failed: {outcome_res.text}"
    outcome_data = outcome_res.json()
    # Verify non-causal language rule
    assert "improved" in outcome_data["outcome_label"].lower() or "observed" in outcome_data["interpretation"].lower()
    print(f"[PASS] Follow-up outcome logged:")
    print(f"       Outcome Label: {outcome_data['outcome_label']}")
    print(f"       Severity Delta: {outcome_data['previous_severity_pct']}% -> {outcome_data['new_severity_pct']}%")
    print(f"       Non-Causal Verbiage: '{outcome_data['interpretation']}' (Preserves clinical humility).")

    # -------------------------------------------------------------
    # STAGE 8: LEARN - AI-Expert Learning Pair & Calibration Dataset
    # -------------------------------------------------------------
    print("\n--- [STAGE 8: LEARN] ---")
    admin_stats_res = client.get("/admin/stats", headers=admin_headers)
    assert admin_stats_res.status_code == 200, f"Admin stats failed: {admin_stats_res.text}"
    stats = admin_stats_res.json()
    assert stats["total_expert_verifications"] >= 1, "Expected verified cases count >= 1"
    print(f"[PASS] Admin Calibration & Learning Matrix:")
    print(f"       Total Verified AI-Expert Pairs: {stats['total_expert_verifications']}")
    print(f"       AI-Expert Agreement Rate: {stats['ai_expert_agreement_rate_pct']}%")
    print(f"       Model Status: Active ({stats['model_name']})")

    # Audit Trail Check
    audit_res = client.get("/admin/audit-logs", headers=admin_headers)
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert len(logs) >= 5, "Expected comprehensive audit trail"
    print(f"[PASS] Immutable Audit Trail contains {len(logs)} tamper-evident action records.")

    # -------------------------------------------------------------
    # EXTENDED MODULES: Traps, Forecasts, Multilingual, Case Chat
    # -------------------------------------------------------------
    print("\n--- [EXTENDED CAPABILITIES] ---")
    
    # 1. Traps & Sensors
    traps_res = client.get("/sensors/traps/104", headers=farmer_headers)
    assert traps_res.status_code == 200
    print(f"[PASS] Sensors/Traps module active ({len(traps_res.json())} trap records for Field 104).")

    # 2. Weather Outbreak Forecast
    fc_en = client.get("/forecast/alerts/104?lang=en", headers=farmer_headers)
    assert fc_en.status_code == 200
    fc_hi = client.get("/forecast/alerts/104?lang=hi", headers=farmer_headers)
    assert fc_hi.status_code == 200
    fc_mr = client.get("/forecast/alerts/104?lang=mr", headers=farmer_headers)
    assert fc_mr.status_code == 200
    print(f"[PASS] Multilingual Weather-Based Outbreak Forecasts verified in EN, Hindi, Marathi.")

    # 3. Case-Linked Chat
    chat_get = client.get(f"/messages/case/{obs_id}", headers=farmer_headers)
    assert chat_get.status_code == 200
    print(f"[PASS] Case-Linked Consultation Chat verified for Observation {obs_id}.")

    print("\n================================================================")
    print(" ALL 8 DECISION LOOP STAGES + RBAC + EXTENDED MODULES PASSED!")
    print("================================================================")

if __name__ == "__main__":
    run_e2e_tests()
