# KrishiRaksha — Demo Script

One field, one farmer, followed through the entire closed loop:
**Observe → Investigate → Verify → Assess → Prioritize → Act → Monitor → Learn**

---

### Step 1 — Farmer uploads leaf image
**Role: Farmer**
Farmer photographs a tomato leaf (Field 104, Pusa Ruby, Flowering stage) showing early spotting and uploads it from the field app.

### Step 2 — AI gives a moderate-confidence result
**Role: System**
The vision model returns a differential diagnosis instead of one confident label:
- Early Blight — 52%
- Septoria Leaf Spot — 31%
- Nutrient deficiency (Potassium) — 17%

Confidence: Moderate. Severity: Medium (estimated). The system does not overclaim from one image.

### Step 3 — Investigation engine asks for more evidence
**Role: System**
Early Blight and Septoria Leaf Spot are too close to call. Rather than guessing, the system identifies the exact evidence that would separate them and requests it: *"Please upload a close-up of the leaf underside."*

### Step 4 — Farmer uploads leaf underside
**Role: Farmer**
Farmer follows the prompt and uploads the requested close-up — no technical knowledge required, just a clear instruction to follow.

### Step 5 — Differential diagnosis narrows
**Role: System**
With the new evidence, confidence shifts sharply:
- Early Blight — 84%
- Septoria Leaf Spot — 9%
- Nutrient deficiency — 7%

Confidence: High. Severity: Medium–High. Case is escalated to expert review anyway, because flowering-stage infection carries yield risk.

### Step 6 — Expert confirms diagnosis and severity
**Role: Expert**
An agronomist reviews both images, the differential diagnosis, and field history, then confirms: **Early Blight, severity raised to High** given the flowering stage and visible leaf-area coverage. This correction is recorded permanently.

### Step 7 — Field Health Passport updates
**Role: System**
The confirmed case is appended to Field 104's persistent history:
- Aug 16 — Routine scan, no issues
- Aug 28 — Minor spotting, low severity
- Sep 06 — Early Blight, confirmed, high severity

Trend: **Worsening**.

### Step 8 — Risk engine calculates field risk
**Role: System**
Confirmed severity, growth stage, trend, nearby cases, weather, soil condition, variety susceptibility, and pest-trap sensor readings combine into a transparent score:

**Risk: 74/100 — HIGH**
- Confirmed severity: High — +25
- Vulnerable growth stage (Flowering): +15
- Elevated humidity forecast, 78% (seasonal estimate — live forecast unavailable in this environment): +10
- Variety 'Pusa Ruby' increases susceptibility to Early Blight: +6
- High soil moisture (74%) — favorable for fungal disease: +8
- Pest trap count high (12 per trap): +10

This is real, computed logic — not a hardcoded number. The weather factor calls a live forecast API (Open-Meteo) and only falls back to a labeled seasonal estimate if that call can't be reached; it never silently fakes a live number.

### Step 9 — Regional alert fires to nearby farmers
**Role: System**
The moment the case is confirmed, nearby fields automatically receive an alert with plain-language treatment guidance pulled from the knowledge base — no farmer had to ask for it:
- Field 218 (Sunita Devi, 0.5 km away): *"A confirmed case of Early Blight was found 0.5 km from your field."* + safe next steps (remove infected leaves, improve airflow, consult officer before any fungicide)
- Field 301 (Lakshmi Bai, 0.1 km away): same alert, same guidance

If either farmer is offline, this alert queues locally and relays phone-to-phone over Bluetooth mesh (BitChat-inspired store-and-forward) until it reaches them or a connected node.

Guidance is also available in Hindi (`?lang=hi`) — hand-translated, not machine-placeholder text — so a low-literacy or non-English-speaking farmer gets the same safe next steps in their own language.

### Step 9.5 — Officer sees a geospatial hotspot map
**Role: Officer**
Alongside the ranked list, the officer can see every field plotted by location and colored by risk level — Field 104 (HIGH, red), Field 218/077/301 (not yet assessed, grey) — so clustering is visible at a glance, not just implied by a distance number in a list.

### Step 9.6 — Expert refers the case to a lab
**Role: Expert**
For cases needing lab-level confirmation (e.g. checking for fungicide resistance), the expert creates a tracked referral — not just advisory text telling the farmer to "consult someone." It stays `pending` until the lab or extension office marks it `completed`.

### Step 10 — Officer dashboard ranks the field
**Role: Officer**
Instead of a map, the officer sees a ranked inspection queue for today:

**Priority 1 — Field 104 — Risk 91** — worsening trend, flowering stage, cluster proximity, no recent follow-up
Priority 2 — Field 218 — Risk 84 — high severity, repeated symptoms
Priority 3 — Field 077 — Risk 58 — moderate severity, isolated case

### Step 11 — Intervention recorded, follow-up scheduled
**Role: Officer / System**
The officer's visit and guidance are logged against the field. A follow-up is automatically scheduled 3 days out — nothing depends on memory.

### Step 12 — Farmer submits a follow-up scan
**Role: Farmer / System**
Three days later, a new scan comes in. The system compares severity before and after:

- Before: 62%
- After (Day 3): 38%

**"Observed improvement following the recorded intervention."**
(Deliberately *not* stated as "the intervention caused the improvement" — the evidence doesn't yet support that causal claim.)

### Step 13 — Verified case joins the learning loop
**Role: System**
The complete case — AI's initial confidence, the expert's correction, and the eventual outcome — is archived as structured data:
- AI confidence: 52% → 84%
- Expert agreement: Confirmed, severity adjusted
- Outcome: Improved

This feeds the **AI–Expert Agreement Rate**, the project's core learning-loop metric.

---

## What this demo proves in ~2 minutes

A conventional app stops after Step 2 (photo → disease name). KrishiRaksha continues: it questions its own uncertainty, gathers the right evidence, gets a human to verify it, remembers the field over time, scores risk transparently, tells other farmers what's nearby, tells an officer where to go first, and checks whether what it did actually worked — without ever claiming more certainty than the evidence supports.
