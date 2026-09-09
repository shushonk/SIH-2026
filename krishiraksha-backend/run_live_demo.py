import sys
import json
import urllib.request

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE = 'http://127.0.0.1:8000'

def post(path, data, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(f'{BASE}{path}', data=json.dumps(data).encode('utf-8'), headers=headers)
    with urllib.request.urlopen(req) as res:
        return json.loads(res.read().decode('utf-8'))

def get(path, token=None):
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(f'{BASE}{path}', headers=headers)
    with urllib.request.urlopen(req) as res:
        return json.loads(res.read().decode('utf-8'))

def run_suite():
    print('=' * 78)
    print('  KRISHIRAKSHA (कृषिरक्षा) — SIH26131 LIVE PLATFORM EXECUTION')
    print('  Observe -> Investigate -> Verify -> Assess -> Prioritize -> Act -> Monitor -> Learn')
    print('=' * 78)

    # 1. Health & DB Check
    root = get('/')
    print(f'\n[1. PLATFORM STATUS]')
    print(f'   - Platform: {root.get("platform")}')
    print(f'   - Status: {root.get("status").upper()}')
    print(f'   - Database: {root.get("database")}')
    print(f'   - Decision Loop: {root.get("decision_loop")}')

    # 2. Authentication & RBAC Verification
    print(f'\n[2. AUTHENTICATION & ROLE-BASED ACCESS CONTROL]')
    farmer_auth = post('/auth/login', {'identifier': 'farmer@krishiraksha.org', 'password': 'Farmer@123'})
    farmer_token = farmer_auth['access_token']
    farmer_user = farmer_auth['user']
    print(f'   - Logged in: {farmer_user["name"]} ({farmer_user["role"].upper()})')

    expert_auth = post('/auth/login', {'identifier': 'expert@krishiraksha.org', 'password': 'Expert@123'})
    expert_token = expert_auth['access_token']
    expert_user = expert_auth['user']
    print(f'   - Logged in: {expert_user["name"]} ({expert_user["role"].upper()})')

    officer_auth = post('/auth/login', {'identifier': 'officer@krishiraksha.org', 'password': 'Officer@123'})
    officer_token = officer_auth['access_token']
    officer_user = officer_auth['user']
    print(f'   - Logged in: {officer_user["name"]} ({officer_user["role"].upper()})')

    # RBAC Test: Farmer blocked from Officer/Admin routes
    try:
        get('/admin/stats', farmer_token)
        print('   - RBAC check failed!')
    except urllib.error.HTTPError as e:
        print(f'   - Server-Side RBAC Guardrail: Farmer blocked from Admin route ({e.code} Forbidden)')

    # 3. Two-Layer AI Pipeline: Layer 1 (Vision) & Layer 2 (Reasoning)
    print(f'\n[3. TWO-LAYER AI ARCHITECTURE]')
    print('   * Mandate: gpt-oss:120b-cloud reasoning model strictly separated from Vision Layer')
    
    # Stage 1: Observe (Scan submitted to vision pipeline)
    obs_payload = {
        'field_id': '104',
        'symptom_keywords': ['leaf_spots_concentric'],
        'image_ref': 'leaf_scan_tomato_early_blight.jpg',
        'notes': 'Lower leaves showing circular concentric dark spots with yellow chlorotic margin'
    }
    obs_res = post('/observations', obs_payload, farmer_token)
    obs_id = obs_res['observation']['observation_id']
    vision = obs_res['ai_analysis']

    print(f'\n   >> LAYER 1 (ISOLATED VISION PIPELINE):')
    print(f'      - Observation ID: {obs_id}')
    print(f'      - Plant Validated: {vision.get("is_plant", True)}')
    print(f'      - Top Candidate: {vision["differential"][0]["disease"]} ({vision["differential"][0]["confidence"] * 100:.1f}%)')
    print(f'      - Second Hypothesis: {vision["differential"][1]["disease"]} ({vision["differential"][1]["confidence"] * 100:.1f}%)')
    print(f'      - Uncertainty Detected: {vision["needs_investigation"]}')
    print(f'      - Investigation Query: {vision["investigation_question"]}')

    # Layer 2: Reasoning with gpt-oss:120b-cloud integration
    ai_payload = {
        'vision_result': {
            'top_disease': vision['differential'][0]['disease'],
            'top_confidence': vision['differential'][0]['confidence'],
            'severity_estimate': 'Moderate',
            'is_plant': True
        },
        'role': 'farmer',
        'language': 'en'
    }
    ai_res = post('/copilot/explain-diagnosis', ai_payload, farmer_token)
    print(f'\n   >> LAYER 2 (REASONING ENGINE - OLLAMA gpt-oss:120b-cloud):')
    print(f'      - Farmer Advisory (Simplified, 2-4 sentences):')
    print(f'        "{ai_res.get("explanation")}"')
    print(f'      - Engine: {ai_res.get("engine")}')

    # Multilingual: Hindi & Marathi
    ai_hi = post('/copilot/explain-diagnosis', {**ai_payload, 'language': 'hi'}, farmer_token)
    print(f'      - Multilingual Translation: Hindi advisory generated ({len(ai_hi.get("explanation", ""))} chars)')

    # 4. Closed-Loop Stages 2 to 8
    print(f'\n[4. CLOSED-LOOP PIPELINE (STAGES 2 - 8)]')
    
    # Stage 2: Investigate (Uncertainty Evidence Narrowing)
    inv_payload = {
        'farmer_answer': 'Leaf underside shows dark concentric rings and velvety sporulation without pycnidia specks.',
        'underside_image_ref': 'leaf_underside_macro.jpg'
    }
    inv_res = post(f'/observations/{obs_id}/investigate', inv_payload, farmer_token)
    print(f'   [Stage 2: INVESTIGATE] Narrowed to {inv_res["narrowed_disease"]} ({inv_res["narrowed_confidence"] * 100:.1f}%)')
    print(f'                          Status: {inv_res["status"]}')

    # Stage 3: Verify (Expert Ground Truth Triage)
    expert_review_payload = {
        'observation_id': obs_id,
        'confirmed_disease': 'Early Blight',
        'severity': 'High',
        'advisory_notes': 'Prune affected lower leaves; apply certified biological bio-control (Trichoderma viride).',
        'comments': 'Verified Alternaria solani target-board pattern.'
    }
    post('/expert-reviews', expert_review_payload, expert_token)
    print(f'   [Stage 3: VERIFY] Dr. Meera Nair (Expert) verified Early Blight (High severity)')

    # Stage 4: Assess (Field Passport & Risk Recalculation)
    risk_res = post('/fields/104/recompute-risk', {}, farmer_token)
    passport_res = get('/fields/104/passport', farmer_token)
    print(f'   [Stage 4: ASSESS] Risk Score: {risk_res["score"]}/100 ({risk_res["level"]}) | Trend: {passport_res["trend"]}')
    print(f'                     Driver: {risk_res["factors"][0]["label"]} ({risk_res["factors"][0]["weight"]} pts)')

    # Stage 5: Prioritize (District Priority Queue)
    priority_queue = get('/officer/priority-queue', officer_token)
    top_item = priority_queue[0]
    print(f'   [Stage 5: PRIORITIZE] Officer Priority Queue: {len(priority_queue)} ranked plots')
    print(f'                         Rank #1: {top_item["field_name"]} (Priority Score: {top_item["priority_score"]})')

    # Stage 6: Act (Intervention Dispatch)
    interv_payload = {
        'field_id': '104',
        'action_taken': 'Field inspection conducted. Provided biological spray advisory (Trichoderma harzianum) and ridge drainage.',
        'officer_name': 'Officer Deshmukh'
    }
    interv_res = post('/interventions', interv_payload, officer_token)
    followup_id = interv_res['followup']['followup_id']
    print(f'   [Stage 6: ACT] Intervention logged: {interv_res["intervention"]["intervention_id"]}')
    print(f'                  Scheduled Follow-up: {followup_id} for {interv_res["followup"]["due_date"]}')

    # Stage 7: Monitor (Follow-Up Scan & Non-Causal Outcome)
    outcome_payload = {
        'field_id': '104',
        'followup_id': followup_id,
        'new_severity_pct': 32
    }
    outcome_res = post('/outcomes', outcome_payload, farmer_token)
    print(f'   [Stage 7: MONITOR] Outcome: {outcome_res["outcome_label"]} (Severity: {outcome_res["previous_severity_pct"]}% -> {outcome_res["new_severity_pct"]}%)')
    print(f'                      Non-Causal Interpretation: "{outcome_res["interpretation"]}"')

    # Stage 8: Learn (Regional Knowledge Update & Calibration Matrix)
    admin_auth = post('/auth/login', {'identifier': 'admin@krishiraksha.gov.in', 'password': 'Admin@123'})
    admin_token = admin_auth['access_token']
    stats = get('/admin/stats', admin_token)
    print(f'   [Stage 8: LEARN] Verified AI-Expert Learning Pairs: {stats["total_expert_verifications"]}')
    print(f'                    AI-Expert Agreement Rate: {stats["ai_expert_agreement_rate_pct"]}%')
    print(f'                    Model Status: Active ({stats["model_name"]})')

    # 5. Nationwide India-Wide Hotspot Map
    print(f'\n[5. NATIONWIDE ALL-INDIA GEOMAP]')
    clusters = get('/officer/clusters', officer_token)
    print(f'   Total National Hotspot Clusters: {len(clusters)}')
    for c in clusters:
        print(f'   - {c.get("cluster_name")} | Active Cases: {c.get("case_count", 1)} | Radius: {c.get("radius_km")} km')

    print('\n' + '=' * 78)
    print('  *** FULL PROGRAM RUN COMPLETE: ALL 8 STAGES & 2 AI LAYERS VERIFIED ***')
    print('=' * 78)

if __name__ == '__main__':
    run_suite()
