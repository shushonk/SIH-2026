// ====== KrishiRaksha Mobile — offline-first shell ======
//
// HONESTY NOTE (read this before treating any part of this file as done):
// - The local-first queue below uses localStorage as a stand-in for a real
//   on-device database. In a production build, replace this with
//   @capacitor-community/sqlite (already listed in package.json) so data
//   survives app reinstalls and scales past what localStorage comfortably holds.
// - The BLE mesh relay function (relayViaBleMesh) is a STUB. It simulates
//   the delivery path for demo purposes but does not open a real Bluetooth
//   connection. A real implementation needs a Capacitor BLE plugin
//   (e.g. @capacitor-community/bluetooth-le) and a peer discovery +
//   store-and-forward protocol inspired by BitChat's public architecture —
//   that protocol work is a separate, substantial build task, not included here.
// - The on-device "rough triage" model is a keyword lookup, standing in for
//   a real quantized model (llama.cpp / MLC-LLM) as described in the project plan.

const API_BASE = window.KRISHIRAKSHA_API_BASE || "http://localhost:8000";
const QUEUE_KEY = "krishiraksha_pending_queue";
const CACHE_KEY = "krishiraksha_cached_data";

let isOnline = navigator.onLine;

// ====== LOCAL QUEUE (localStorage stand-in for SQLite) ======
function getQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY)) || []; }
  catch { return []; }
}
function saveQueue(q) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}
function enqueue(record) {
  const q = getQueue();
  record.sync_status = "pending";
  record.local_id = "local_" + Date.now();
  q.push(record);
  saveQueue(q);
  return record;
}
function getCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || {}; }
  catch { return {}; }
}
function setCache(key, value) {
  const c = getCache();
  c[key] = value;
  localStorage.setItem(CACHE_KEY, JSON.stringify(c));
}

// ====== ROUGH ON-DEVICE TRIAGE (fallback when fully offline) ======
// Standing in for a small quantized model (see honesty note above).
const ON_DEVICE_TRIAGE = {
  "leaf_spots_concentric": "Possibly Early Blight or Septoria Leaf Spot — will confirm fully when back online.",
  "leaf_spots_grey_center": "Possibly Septoria Leaf Spot — will confirm fully when back online.",
  "margin_yellowing": "Possibly a nutrient deficiency — will confirm fully when back online.",
};
function roughTriage(symptoms) {
  for (const s of symptoms) {
    if (ON_DEVICE_TRIAGE[s]) return ON_DEVICE_TRIAGE[s];
  }
  return "Unable to give even a rough estimate offline — will analyze fully once synced.";
}

// ====== BLE MESH RELAY (STUB — see honesty note) ======
async function relayViaBleMesh(alert) {
  // Real implementation: broadcast to nearby BLE peers, each peer stores and
  // forwards until reaching a device with connectivity, which syncs to the server.
  console.log("[BLE mesh stub] Would relay alert:", alert);
  return { relayed: true, hops_simulated: 2, note: "STUB — no real Bluetooth connection made." };
}

// ====== NETWORK STATUS ======
function updateNetStatus() {
  isOnline = navigator.onLine;
  const el = document.getElementById("net-status");
  if (isOnline) {
    el.textContent = `Online — connected to ${API_BASE}`;
    el.className = "api-status ok";
  } else {
    el.textContent = "Offline — observations will queue locally and sync automatically";
    el.className = "api-status err";
  }
}
window.addEventListener("online", () => { updateNetStatus(); syncQueue(); });
window.addEventListener("offline", updateNetStatus);

// ====== SYNC WORKER ======
async function syncQueue() {
  if (!isOnline) return;
  const q = getQueue();
  const remaining = [];
  for (const record of q) {
    try {
      const res = await fetch(`${API_BASE}${record.endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record.body),
      });
      if (!res.ok) throw new Error("sync failed");
      record.sync_status = "synced";
      // successfully synced — drop from the pending queue
    } catch (e) {
      remaining.push(record); // keep trying later
    }
  }
  saveQueue(remaining);
  renderQueueStatus();
}

// ====== UI ======
async function init() {
  updateNetStatus();
  render();
  if (isOnline) await syncQueue();
  setInterval(() => { if (isOnline) syncQueue(); }, 15000); // background retry
}

function render() {
  const root = document.getElementById("view-root");
  root.innerHTML = `
    <div class="panel">
      <h2>Capture Observation</h2>
      <label>Field ID</label>
      <input type="text" id="field-id" value="104">
      <label>Symptoms observed</label>
      <div class="checkbox-row">
        <label><input type="checkbox" value="leaf_spots_concentric"> Dark spots, concentric rings</label>
        <label><input type="checkbox" value="leaf_spots_grey_center"> Small spots, grey center</label>
        <label><input type="checkbox" value="margin_yellowing"> Yellowing at leaf margins</label>
      </div>
      <button class="primary" id="capture-btn">Capture & Submit</button>
      <div id="capture-result"></div>
    </div>
    <div class="panel">
      <h2>Pending Sync Queue</h2>
      <div id="queue-status"></div>
    </div>
    <div class="panel">
      <h2>Regional Alerts (cached)</h2>
      <div id="cached-alerts" class="empty">No cached alerts yet — connect once to fetch some.</div>
    </div>
  `;
  document.getElementById("capture-btn").addEventListener("click", captureObservation);
  renderQueueStatus();
}

async function captureObservation() {
  const fieldId = document.getElementById("field-id").value;
  const symptoms = Array.from(document.querySelectorAll('.checkbox-row input:checked')).map(e => e.value);
  const resultEl = document.getElementById("capture-result");

  const body = { field_id: fieldId, image_ref: `leaf_scan_${Date.now()}.jpg`, symptom_keywords: symptoms };

  if (isOnline) {
    try {
      const res = await fetch(`${API_BASE}/observations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      resultEl.innerHTML = `<div class="callout green">Synced immediately. Top candidate: ${data.ai_analysis.differential[0].disease} (${Math.round(data.ai_analysis.differential[0].confidence * 100)}%)</div>`;
      return;
    } catch (e) {
      // fall through to offline path if the request itself fails
    }
  }

  // Offline path: queue locally + rough on-device triage
  enqueue({ endpoint: "/observations", body });
  const triage = roughTriage(symptoms);
  resultEl.innerHTML = `
    <div class="callout">
      <b>Saved on device — pending sync.</b><br>${triage}
    </div>`;
  renderQueueStatus();
}

function renderQueueStatus() {
  const el = document.getElementById("queue-status");
  if (!el) return;
  const q = getQueue();
  if (!q.length) {
    el.innerHTML = `<p class="empty">Nothing pending — everything is synced.</p>`;
    return;
  }
  el.innerHTML = q.map(r => `
    <div class="chat-msg">
      <div class="chat-head">
        <span class="chat-farmer">${r.body.field_id ? "Field " + r.body.field_id : "Record"}</span>
        <span class="delivery-badge pending">◌ pending sync</span>
      </div>
      <div class="chat-bubble">Queued at ${new Date(parseInt(r.local_id.split('_')[1])).toLocaleTimeString()}. Will sync automatically when online.</div>
    </div>
  `).join("");
}

init();
