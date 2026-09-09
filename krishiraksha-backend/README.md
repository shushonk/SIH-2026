# KrishiRaksha Backend (Demo Build)

Real, working FastAPI backend implementing the core closed-loop: Observe → Investigate → Verify → Assess → Prioritize → Act → Monitor, plus **farmer-to-farmer regional alerts with treatment guidance**.

## What's real vs mocked

| Piece | Status |
|---|---|
| API structure, routing, data flow | Real |
| Risk engine, differential-diagnosis logic, alert broadcast | Real logic, runs end-to-end |
| Database | `mongomock` (in-memory, Mongo-compatible) — swap one line in `app/database.py` for a real `MongoClient` when you have a MongoDB instance |
| AI vision model | **Real, trained classifier** as of the latest update. See "The real classifier" section below for the full honest picture. |

## Run it

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/docs` for interactive Swagger UI — every endpoint below is callable directly from the browser.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/fields` | List all fields |
| POST | `/fields` | Register a new field |
| GET | `/fields/{id}/passport` | Field Health Passport — full history + trend |
| POST | `/observations` | Farmer submits a scan → triggers AI diagnosis |
| GET | `/expert-reviews/pending` | Expert's review queue (uncertain/unreviewed cases) |
| POST | `/expert-reviews` | Expert confirms/corrects a case → **triggers risk calc + regional alert broadcast to nearby farmers** |
| GET | `/alerts/{field_id}` | A farmer's alert feed — nearby confirmed cases + treatment guidance |
| GET | `/knowledge/{disease}` | Cure/prevention info for a disease |
| GET | `/officer/priority-queue` | Ranked inspection queue for officers |
| POST | `/interventions` | Log an officer's action → auto-schedules a follow-up |
| POST | `/outcomes` | Record a follow-up result → compares severity, avoids causal overclaiming |

## The farmer-to-farmer alert feature (what you asked for)

When an expert **confirms** a case (`POST /expert-reviews`), `broadcast_regional_alert()` in `app/engine.py`:
1. Finds every other field within a radius (default 5 km) using haversine distance
2. Pulls a plain-language cure/prevention summary from the knowledge base for that disease
3. Creates an `Alert` for each nearby field, visible via `GET /alerts/{field_id}`

On the **mobile app**, this is where the offline BLE-mesh layer plugs in: an alert generated for a farmer who's currently offline gets `sync_status: "pending"` and is relayed device-to-device (BitChat-style store-and-forward) until it reaches that farmer's phone or a connected node, at which point it flips to `"synced"`. That field is already in the data model — the mobile client is what would actually do the relaying.

## Seeded demo data

4 fields (104, 218, 077, 301) around a shared region, and a 3-entry knowledge base (Early Blight, Septoria Leaf Spot, Potassium deficiency) — enough to walk through the whole loop immediately after starting the server.

## The real classifier — full honest picture

`POST /observations` now runs actual inference through a trained model when you send `image_base64` — this is genuine machine learning, not a lookup table. Here's exactly what that means and doesn't mean.

**What's real:**
- Trained on 1,500 real photos from the [PlantVillage dataset](https://github.com/spMohanty/PlantVillage-Dataset) (300 per class, 5 classes: Early Blight, Septoria Leaf Spot, Healthy, Leaf Mold, Target Spot)
- Classical CV feature pipeline (HSV color histograms, GLCM texture, Canny edge density — see `app/ml/features.py`), feeding a Random Forest classifier
- **Measured test accuracy: 98.3%** on a held-out split of 300 images the model never saw during training (`app/ml/model_metadata.json` has the full breakdown, per-class precision/recall, and confusion matrix)
- Verified end-to-end through the actual HTTP API with genuinely unseen images, not just in a notebook

**What that accuracy number does NOT mean:**
- PlantVillage photos are lab images on plain, near-uniform backgrounds. A real farmer's phone photo — cluttered background, variable lighting, motion blur, multiple leaves in frame — is a meaningfully different distribution.
- This is a well-documented gap in agricultural ML: the original PlantVillage paper (Mohanty et al., 2016) itself reported accuracy dropping from ~99% on its own test images to roughly **31%** on random real-world internet photos of the same diseases.
- Expect this model's real-field accuracy to be well below 98%. Treat that number as "this model learned the visual patterns correctly on controlled images," not "this is production-ready."

**Why classical CV instead of a deep CNN:**
No GPU in the environment this was built in, and no access to hosts that serve pretrained ImageNet weights (only package registries were reachable). A fine-tuned CNN (e.g. MobileNet or EfficientNet transfer learning) would very likely generalize better to real field photos and is the natural next step — retrain using `ml/train.py` as a starting point once you have GPU access and can pull pretrained weights.

**Coverage gap:** "Nutrient Deficiency (Potassium)" in the knowledge base has no trained model support — PlantVillage doesn't include a nutrient-deficiency class. The keyword-based fallback still handles that case.

**Retraining it yourself:**
```bash
cd ml
python3 train.py
```
This re-downloads nothing (dataset must already be present at `../PlantVillage-Dataset`), re-extracts features, retrains, and overwrites `model.joblib` + `model_metadata.json` with fresh, honestly-measured numbers — not cached/hardcoded ones.
