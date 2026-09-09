# KrishiRaksha Mobile (React Native + Expo)
**Smart India Hackathon 2024 · Problem Statement ID: SIH26131**

> **Mobile Experience**: Built with React Native & Expo to feel as fluid and immediate as Instagram. Open the app, scan a leaf like a QR code, scroll a community crop-health feed, get real-time IoT sensor telemetries, and message ICAR plant pathologists without hunting for chat.

---

## 🚀 Instant Quick Start (Expo Go)

### 1. Start Expo Development Server
```bash
cd krishiraksha-mobile
npm start
```
* Press `w` to open in your web browser immediately.
* Or open **Expo Go** on your Android or iPhone and scan the generated QR code.

### 2. Backend Connection
The app connects to the FastAPI backend running at `http://127.0.0.1:8000` (or your machine's LAN IP when testing on physical devices over Wi-Fi, configurable directly inside the **Profile & Settings** screen).

---

## 🧠 Two-Layer AI Architecture

```
[ Plant Leaf Image / Camera ]
             │
             ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 1. COMPUTER VISION LAYER (Isolated: app/ml & vision_pipeline)│
  │    - Non-Plant & Blurry Photo Rejection                    │
  │    - Trained Random Forest (59 Visual Descriptors)          │
  │    - Probabilistic Differential Margins (Sub-3s Response)    │
  └──────────────────────────────┬──────────────────────────────┘
                                 │ Structured Numbers
                                 │ {disease, confidence, severity}
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 2. REASONING LAYER (Ollama gpt-oss:120b-cloud Server-Side)  │
  │    - 2–4 Sentence Plain Language Farmer Advisories          │
  │    - Multi-Step Investigation Question Generator            │
  │    - Grounded Citations & Agricultural Decision Support     │
  └─────────────────────────────────────────────────────────────┘
```

> **CRITICAL ARCHITECTURAL GUARANTEE**: `gpt-oss:120b-cloud` is strictly a text and reasoning model — it **never** touches raw image pixels, preventing diagnostic hallucinations. `OLLAMA_API_KEY` is kept server-side only.

---

## 📱 Feature Highlights

1. **"Scan" Everywhere**:
   - Replaces "Upload" across all screens. Point and scan like a QR code.
2. **Online / Offline Parity**:
   - Offline queue persists scans locally via `AsyncStorage`.
   - UI shows a persistent non-blocking banner (`Offline — X scans waiting to sync`).
   - Automatically flushes and syncs upon reconnection with confirmation toast.
3. **Live Real-time Sensors & Traps**:
   - Streams live sensor readings (`canopy_humidity`, `soil_moisture`, `leaf_wetness`) and pheromone trap counts over WebSockets (`/ws/sensors/104`).
   - Displays animated pulsing green dot (`● LIVE`) on live data.
   - Manual form entry fallback always available.
4. **Instant Language Switching (i18n)**:
   - Full support for **English (`en`)**, **Hindi (`hi`)**, and **Marathi (`mr`)**.
   - In-memory `LanguageContext` immediately re-renders the whole navigation tree without reload.
5. **Dynamic Light & Dark Theme**:
   - Unified design tokens (`tokens.js`) toggleable instantly from settings and persisted locally.
6. **Strict Role-Based Navigation**:
   - Dedicated navigation stacks for **Farmer**, **Expert**, **Officer**, and **Admin**.
   - Farmers cannot navigate to or deep-link Expert/Officer screens.
7. **Transparent Case Lifecycle**:
   - Step progress indicator (`Step 1 of 4: Primary Scan` → `Step 2 of 4: Check Underside`).
   - Visible case chips: `Analyzing` → `Awaiting more info` → `Under expert review` → `Reviewed` → `Follow-up scheduled` → `Resolved`.
8. **Instagram-Style DMs**:
   - Case-linked chat between Farmer and assigned Expert over WebSockets with delivery status.
9. **All-India Epidemiological Map**:
   - Multi-state surveillance hotspots across India's bounding box (`~6°N–37°N, 68°E–97°E`).
10. **Curated Demo Sample Catalog**:
    - Multi-crop reference samples (Tomato, Potato, Chili) + negative non-plant controls for instant testing.
