# CultivAI — AI-Powered Closed-Loop Agricultural Decision-Support Platform
**Smart India Hackathon 2024 · Problem Statement ID: SIH26131**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fshushonk%2FSIH-2026&project-name=cultivai&root-directory=krishiraksha-web)

> **Core Product Differentiator**: CultivAI is **not** a simple "upload photo, get disease name" single-shot classifier. It is a **closed-loop clinical decision-support architecture** engineered around uncertain AI observations:
> 
> $$\textbf{Observe} \longrightarrow \textbf{Investigate} \longrightarrow \textbf{Verify} \longrightarrow \textbf{Assess} \longrightarrow \textbf{Prioritize} \longrightarrow \textbf{Act} \longrightarrow \textbf{Monitor} \longrightarrow \textbf{Learn}$$

---

## ⚡ Instant Cloud Deployment (Vercel)

Click the **Deploy with Vercel** button above or follow these 2 steps:

1. Import your GitHub repository `https://github.com/shushonk/SIH-2026` in the [Vercel Dashboard](https://vercel.com/new).
2. Set **Root Directory** to `krishiraksha-web` (or leave it at `./` with the automated root `vercel.json` and `package.json` included in this repo).
3. Click **Deploy** — your live web application will be live at `https://<your-project>.vercel.app` in under 60 seconds!

---

## 🚀 Quick Start (Running Locally)

### Prerequisites
- Python 3.9+ 
- Node.js 18+ & npm

### 1. Start Backend Server (FastAPI + SQLite)
```bash
cd krishiraksha-backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* Backend API: **http://127.0.0.1:8000**
* Interactive Swagger Docs: **http://127.0.0.1:8000/docs**

### 2. Start Web Frontend (React + Vite + Tailwind CSS)
```bash
cd krishiraksha-web
npm install
npm run dev
```
* Web Application: **http://localhost:5173**

### 3. Run Automated End-to-End Verification Suite
```bash
cd krishiraksha-backend
python test_e2e_loop.py
```
*Verifies all 8 stages of the decision loop, JWT authentication, RBAC 403 guardrails, IoT sensors, pheromone traps, and multilingual weather forecasts.*

---

## 🔑 Demo Personas & Credentials

The application comes pre-seeded with 4 distinct operational roles with real JWT-authenticated sessions:

| Role | Name | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Farmer** | Ramesh Patil | `farmer@krishiraksha.org` | `Farmer@123` | Field Health Passport, Ambiguity Lab, Trap Logging, 7-day Weather Forecast |
| **Expert** | Dr. Meera Nair | `expert@krishiraksha.org` | `Expert@123` | Uncertainty Triage Queue, Differential Verification, Clinical Ground Truth |
| **Officer** | Officer Deshmukh | `officer@krishiraksha.org` | `Officer@123` | Ranked Priority Queue, GIS Hotspot Map, Temporal Spread Replay, IPM Logging |
| **Admin** | Rajesh Verma | `admin@krishiraksha.gov.in` | `Admin@123` | AI-Expert Calibration Matrix, Model Drift Metrics, Immutable Audit Trails |

*(You can also use the 1-click **Quick Demo Login** buttons directly on the sign-in screen at [http://localhost:5173](http://localhost:5173)).*

---

## 🔄 The 8-Stage Decision Loop in Action

1. **Observe (Diagnostic Ambiguity)**: Farmer scans a tomato leaf displaying concentric ring spots. Rather than presenting a single false-certain answer, the uncertainty engine detects morphological overlap and outputs a ranked differential: **Early Blight (54%)** vs **Septoria Leaf Spot (38%)**.
2. **Investigate (Evidence Narrowing)**: The system prompts for secondary diagnostic evidence: *"Inspect and upload a close-up photo of the leaf underside to check for diagnostic sporulation."* Upon upload, the differential narrows to **88% Early Blight** and escalates the case.
3. **Verify (Clinical Ground Truth)**: Dr. Meera Nair (Pathologist) reviews the case in the Uncertainty Queue, examines the underside macro-photo, confirms **Early Blight (High Severity)**, and attaches advisory guidelines.
4. **Assess (Explainable Risk Recalculation)**: The Explainable Risk Engine calculates a transparent **0–100 risk score (94/100 HIGH)** combining:
   - Expert Verified Severity: **+25 pts**
   - Phenological Stage Sensitivity (Flowering): **+15 pts**
   - Cultivar Genetic Susceptibility (*Pusa Ruby*): **+6 pts**
   - Root-Zone Soil Moisture (74% Clay loam): **+8 pts**
   - Live Weather Humidity (Open-Meteo 78.6% RH): **+10 pts**
   - Pheromone Trap Economic Threshold Breached (*Helicoverpa armigera* 19/night > 15): **+18 pts**
   - IoT Canopy Humidity Sensor: **+12 pts**
5. **Prioritize (Extension Inspection Queue)**: District Extension Officer Deshmukh receives an objective queue of plots ranked by risk score with transparent driving reasons, optimizing daily travel.
6. **Act (Non-Prescriptive IPM Advisory)**: Officer conducts an inspection and prescribes safe integrated pest management (biological *Trichoderma* spray, 25cm lower canopy pruning, morning drip adjustment). The system automatically schedules a mandatory **3-day follow-up check**.
7. **Monitor (Non-Causal Follow-up)**: Farmer scans the foliage after 3 days. Lesion severity decreases from 80% to 32%. The system uses **humble non-causal language**: *"Improvement observed following recorded intervention"* (never claiming the intervention definitely cured the plot).
8. **Learn (AI-Expert Calibration & Model Feedback)**: The AI-Expert agreement pair is stored into the model calibration benchmark dataset, updating accuracy statistics and monitoring model drift.

---

## 🛡️ Scientific Framing & Honesty Disclosures

- **No Diagnostic Overclaiming**: The AI vision engine acknowledges morphological overlap between diseases in early stages. It presents differential probabilities with margins of uncertainty rather than asserted facts.
- **Strict Non-Prescriptive IPM**: The system never outputs arbitrary chemical pesticide dosages or unguided cocktail recipes. Advisories follow approved ICAR biological and cultural integrated pest management practices.
- **Humble Outcome Verbiage**: Post-intervention assessments always state *"Improvement observed following intervention"*, avoiding unscientific assertions of direct causation.
- **Honest Model Documentation**: The vision module is based on a real scikit-learn classifier (color histograms, GLCM texture, edge density) trained on PlantVillage lab images (98.3% test accuracy), coupled with a deterministic Bayesian narrowing simulation for demonstration purposes.

---

## 📁 Repository Structure

```
krishiraksha-project/
├── krishiraksha-backend/          # FastAPI + SQLite Backend
│   ├── app/
│   │   ├── auth/                  # JWT generation, Argon2 hashing, RBAC dependencies
│   │   ├── routers/               # 13 REST routers (auth, fields, observations, experts, etc.)
│   │   ├── services/              # Audit logging, mock vision engine, field memory
│   │   ├── ml/                    # scikit-learn classifier & feature extractor
│   │   ├── database.py            # SQLite schema (24 relational tables)
│   │   ├── engine.py              # Explainable 0-100 Risk Engine & spatial utilities
│   │   ├── weather.py             # Open-Meteo live microclimate integration
│   │   └── seed_data.py           # Realistic agricultural demonstration seed data
│   ├── test_e2e_loop.py           # Automated test suite verifying stages 1-8 + RBAC
│   └── requirements.txt           # Python dependencies
│
└── krishiraksha-web/              # React 18 + Vite + Tailwind CSS Frontend
    ├── src/
    │   ├── components/            # AppShell, StorylineGuide, CopilotDrawer, CaseChatModal
    │   ├── context/               # AuthContext (role switching + JWT), OfflineContext
    │   ├── views/                 # FarmerView, ExpertView, OfficerView, AdminView, AuthView
    │   └── services/api.js        # API client for all backend endpoints
    └── public/samples/            # Generated high-resolution realistic leaf specimens
```
