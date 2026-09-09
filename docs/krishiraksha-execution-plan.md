# KrishiRaksha — Solo Execution Plan (SIH26131)

## 1. Scope for this build cycle

**Building fully:**
Observe → Investigate → Verify → Assess → Prioritize → Monitor

**Architecture only / thin mock (not fully built):**
Voice & multilingual, offline sync, what-if simulator, full RBAC, regional intelligence at scale

---

## 2. Build order

| # | Module | What "done" looks like |
|---|--------|------------------------|
| 1 | Data model | Field, Observation, AIAnalysis, ExpertReview, RiskAssessment, FollowUp, Outcome exist as real schema; relationships support full history reconstruction |
| 2 | AI vision + differential diagnosis | Returns diagnosis, confidence, severity, alternatives, explanation — even if model is a mock/rule-based stand-in |
| 3 | Investigation engine | When confidence is low, system asks for specific additional evidence (leaf underside, close-up, crop age, etc.) |
| 4 | Expert verification dashboard | List of cases → confirm/reject/modify severity → saves to ExpertReview |
| 5 | Field Health Passport + Field Memory | Aggregates history; compares current vs previous scan; trend (improving/stable/worsening) |
| 6 | Risk engine | Combines severity + confidence + history + environment → score + factor breakdown |
| 7 | Officer dashboard: inspection priority queue | Ranked list of fields with risk score + reasons |
| 8 | Follow-up / outcome tracking | Closes the loop; feeds AI–Expert Agreement Rate metric |

Build in this order — each stage depends on the data model and outputs of the previous one.

---

## 3. What to mock (and label as mock) for the demo

- Real-time weather/environmental data → static/canned values
- Regional clustering across many farmers → seeded demo dataset, not live crowd data
- Voice/multilingual → one working demo phrase; rest described as roadmap
- Pesticide recommendation database → small curated set, not live agri-database

---

## 4. Demo script (adapted from Section 27)

1. Farmer uploads image → AI gives moderate-confidence result, refuses to overclaim
2. Investigation engine asks for leaf underside image
3. Farmer uploads second image → differential diagnosis narrows
4. Case escalated for expert verification
5. Expert confirms diagnosis + severity
6. Field Health Passport updates
7. Risk engine calculates field risk with visible reasoning
8. Officer dashboard ranks the field highly, with stated reasons
9. Intervention recorded, follow-up scheduled
10. Farmer submits new scan → system compares to history
11. Outcome recorded → feeds learning loop

---

## 5. Platform & Tech Stack

**Two clients, one backend:**
- **Website** — online-only, full-featured, all four dashboards (farmer/expert/officer/admin)
- **Mobile app** — offline-first, built with Capacitor (single React codebase wrapped for Android/iOS)

| Layer | Choice | Notes |
|---|---|---|
| Web frontend | React (Next.js) | Online only |
| Mobile app | Capacitor | Offline-first; native plugins for camera, SQLite, BLE |
| Backend API | Python (FastAPI) | Shared by web + mobile |
| Database | MongoDB | Flexible schema fits evolving entities (Observation, AIAnalysis, RiskAssessment, etc.) |
| Server-side AI | Vision model (diagnosis) + Ollama running gpt-oss (copilot/reasoning) | Full pipeline, requires connectivity |
| Edge-node AI | Ollama + gpt-oss on local hardware (officer's laptop / Pi / kiosk device) | Phones connect over local Wi-Fi, no internet needed, richer than on-device model |
| On-device AI (zero network) | Small quantized model via llama.cpp/MLC-LLM (e.g. Phi-3-mini/Gemma 2B class) | Rough triage only, clearly labeled as provisional |
| Offline peer communication | BLE mesh, BitChat-inspired store-and-forward relay | For farmer↔farmer / farmer↔officer messaging with zero connectivity — inspired by, not literally using, Dorsey's BitChat (unaudited third-party app) |
| Local mobile storage | SQLite (capacitor-community/sqlite) | Every record has a `sync_status`: pending / synced / conflict |

**Note on feasibility:** Ollama itself is a server process and cannot run directly inside a phone app, and gpt-oss (~20B+ params) is too large for on-device inference even quantized. The "edge node" pattern (small local server + phones on same Wi-Fi/LAN) is the realistic way to get gpt-oss-quality reasoning without internet — and doubles as a strong pitch point ("AI infrastructure that lives in the village, not just the cloud").

## 6. Offline Architecture (Mobile)

**Fully offline-capable:**
- Capturing observations (image + form data) → saved locally with `sync_status: pending`
- Viewing previously synced data (field history, past diagnoses, health passport)
- On-device lightweight model gives immediate rough triage
- Cached knowledge base content (disease info, preventive practices)
- Local follow-up reminders (no server needed)
- Peer-to-peer relay of pending observations/alerts via BLE mesh when near another device (even if that device is also offline — store-and-forward hops until someone reaches connectivity)

**Requires connectivity (queue until sync, or edge node if in range):**
- Full-confidence server AI inference
- Expert verification
- Risk engine scoring (needs regional/environmental data)
- Regional intelligence / cluster detection

**Sync flow:**
1. Local-first storage mirrors backend schema, tagged `sync_status`
2. Background sync worker uploads pending records when connectivity (or edge node) is reachable
3. Server reconciles and returns authoritative fields (final confidence, expert review ID, etc.)
4. UI always visually distinguishes "saved on device, pending" from "confirmed by server" — never blend the two, so a farmer doesn't mistake a rough local guess for a verified diagnosis
5. Conflict handling: last-write-wins for the hackathon demo (documented as a known limitation, not hidden)

**Demo slice that proves this without building a production sync engine:**
Toggle airplane mode → capture an observation → show "pending sync" badge and on-device rough triage → toggle connectivity back on → show it sync and return the full AI + expert pipeline result.

## 8. Coverage against the official SIH problem statement

| Requirement in the brief | Status |
|---|---|
| Image-based symptom identification | ✅ Built |
| Pest-trap / sensor inputs | ✅ Built — `POST /sensor-readings`, feeds risk engine |
| Weather-based risk forecasting | ✅ Built (real Open-Meteo integration) — honestly labeled fallback when network is restricted, e.g. in a sandboxed dev environment |
| Geospatial hotspot mapping | 🟡 Backend real (`/officer/hotspot-map`, haversine-based), map UI not yet built |
| Expert validation | ✅ Built |
| Multilingual advisories | ✅ Built for Hindi (hand-written, real translations, not placeholders) — pattern ready to extend to more languages |
| Recommend IPM actions / safe input usage | ✅ Built — `safe_next_steps` per knowledge entry, no autonomous dosage prescriptions |
| Referral to extension or laboratories | ✅ Built — tracked `LabReferral` entity with status, not just advisory text |
| Follow-up monitoring | ✅ Built |
| Learn from field confirmations | ✅ Built — AI–Expert agreement tracked |
| Dashboards for agriculture officials | 🟡 Backend real (priority queue + hotspot data), full dashboard UI not yet built |
| Soil condition as risk input | ✅ Built — `soil_moisture_pct` factors into risk |
| Variety-specific risk | ✅ Built (small demo lookup table, extendable) |

**Remaining gap:** actual frontend dashboards (map view, officer/expert/farmer UI) — the backend logic behind all of them now exists and is tested end-to-end.

## 9. Known gaps to preempt judge questions

- Not claiming AI can diagnose every disease — differentiator is the closed-loop architecture around uncertain AI, not the classifier itself
- No autonomous pesticide dosage prescriptions — system escalates to experts/official guidance
- No causal claims about intervention → outcome without evidence ("observed improvement following intervention," not "intervention caused improvement")
- Regional intelligence demo uses seeded data, not live multi-farmer network (not yet at scale)
- BitChat-style BLE mesh is our own implementation inspired by the public architecture, not the third-party BitChat app itself (which is still unaudited/experimental) — don't claim we "integrated BitChat"
- Ollama + gpt-oss cannot run directly on a phone; positioned as an edge-node service (local server the phone talks to over Wi-Fi/LAN), not on-device inference
