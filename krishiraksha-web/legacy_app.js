// ====== CONFIG ======
// Change this if your backend runs somewhere other than localhost:8000
const API_BASE = window.KRISHIRAKSHA_API_BASE || "http://localhost:8000";

let state = {
  role: "Farmer",
  fields: [],
  selectedFieldId: null,
  lastObservationId: null,
  lastFollowupId: null,
  apiOk: null,
  leafletMap: null,
};

// ====== API HELPERS ======
async function api(path, opts = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

async function checkApi() {
  try {
    await api("/");
    state.apiOk = true;
  } catch (e) {
    state.apiOk = false;
  }
  renderApiStatus();
}

function renderApiStatus() {
  const el = document.getElementById("api-status");
  if (state.apiOk === null) {
    el.textContent = "Checking backend connection…";
    el.className = "api-status";
  } else if (state.apiOk) {
    el.textContent = `Connected to backend at ${API_BASE}`;
    el.className = "api-status ok";
  } else {
    el.textContent = `Cannot reach backend at ${API_BASE} — start it with "uvicorn app.main:app --reload" from the backend folder, then refresh.`;
    el.className = "api-status err";
  }
}

// ====== INIT ======
async function init() {
  document.querySelectorAll(".role-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.role = btn.dataset.role;
      document.querySelectorAll(".role-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      moveRoleIndicator(btn);
      render();
    });
  });
  await checkApi();
  if (state.apiOk) {
    await loadFields();
  }
  render();
  requestAnimationFrame(() => moveRoleIndicator(document.querySelector(".role-btn.active")));
  window.addEventListener("resize", () => moveRoleIndicator(document.querySelector(".role-btn.active")));
}

function moveRoleIndicator(btn) {
  const indicator = document.getElementById("role-indicator");
  if (!btn || !indicator) return;
  indicator.style.width = btn.offsetWidth + "px";
  indicator.style.transform = `translateX(${btn.offsetLeft - 4}px)`;
}

// ====== ANIMATION HELPERS ======
function animateCount(el, from, to, duration = 700) {
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function skeleton(lines = 3) {
  return `<div>${Array.from({ length: lines }).map((_, i) =>
    `<div class="skeleton" style="width:${90 - i * 12}%;"></div>`).join("")}</div>`;
}

async function withSpinner(button, fn) {
  const original = button.innerHTML;
  button.disabled = true;
  button.innerHTML = `<span class="spinner"></span>Working…`;
  try {
    await fn();
  } finally {
    button.disabled = false;
    button.innerHTML = original;
  }
}

async function loadFields() {
  try {
    state.fields = await api("/fields");
    if (!state.selectedFieldId && state.fields.length) {
      state.selectedFieldId = state.fields[0].field_id;
    }
  } catch (e) {
    console.error(e);
  }
}

// ====== RENDER ROOT ======
function render() {
  const root = document.getElementById("view-root");
  if (!state.apiOk) {
    root.innerHTML = `<div class="panel"><p class="empty">Waiting for backend connection…</p></div>`;
    return;
  }
  if (state.role === "Farmer") renderFarmer(root);
  else if (state.role === "Expert") renderExpert(root);
  else if (state.role === "Officer") renderOfficer(root);
}

function fieldSelector() {
  const opts = state.fields.map(f =>
    `<option value="${f.field_id}" ${f.field_id === state.selectedFieldId ? "selected" : ""}>
      Field ${f.field_id} — ${f.owner_name} (${f.crop}, ${f.variety})
    </option>`).join("");
  return `<label>Field</label><select id="field-select">${opts}</select>`;
}

function bindFieldSelector() {
  const sel = document.getElementById("field-select");
  if (sel) sel.addEventListener("change", (e) => {
    state.selectedFieldId = e.target.value;
    render();
  });
}

// ====== FARMER VIEW ======
async function renderFarmer(root) {
  root.innerHTML = `
    <div class="panel">
      <h2>My Field</h2>
      ${fieldSelector()}
    </div>
    <div class="grid-2">
      <div class="panel" id="farmer-scan-panel">
        <h2>Submit a Scan</h2>
        <label>What do you see? (select symptoms)</label>
        <div class="checkbox-row" id="symptom-checks">
          <label><input type="checkbox" value="leaf_spots_concentric"> Dark spots, concentric rings</label>
          <label><input type="checkbox" value="leaf_spots_grey_center"> Small spots, grey center</label>
          <label><input type="checkbox" value="leaf_underside_confirmed"> Close-up of leaf underside</label>
          <label><input type="checkbox" value="margin_yellowing"> Yellowing at leaf margins</label>
        </div>
        <label>Image reference (filename label)</label>
        <input type="text" id="image-ref" value="leaf_scan_${Date.now()}.jpg">
        <label>Upload a real leaf photo (uses the actual trained classifier)</label>
        <input type="file" id="image-file" accept="image/*">
        <div id="image-preview" style="margin-top:8px;"></div>
        <button class="primary" id="submit-scan-btn">Submit Scan</button>
        <div class="footnote">If you upload a photo, this calls the real trained model (see Model Info panel below). Without a photo, it falls back to a symptom-keyword lookup.</div>
        <div id="ai-result"></div>
      </div>
      <div class="panel" id="model-info-panel">
        <h2>Model Info</h2>
        <div id="model-info-content">${skeleton(3)}</div>
      </div>
      <div class="panel" id="farmer-alerts-panel">
        <h2>Alerts Near You</h2>
        <div id="alerts-list">${skeleton(2)}</div>
      </div>
    </div>
    <div class="panel" id="farmer-passport-panel">
      <h2>Field Health Passport</h2>
      <div id="passport-content">${skeleton(2)}</div>
    </div>
    <div class="panel" id="farmer-followup-panel">
      <h2>Follow-up Scan (after an intervention)</h2>
      <label>New severity estimate (%)</label>
      <input type="number" id="followup-severity" value="38" min="0" max="100">
      <div style="font-size:0.78rem;color:var(--ink-soft);margin-top:4px;">Requires an intervention + follow-up to already exist for this field (see Officer view).</div>
      <button class="primary" id="submit-followup-btn">Submit Follow-up</button>
      <div id="followup-result"></div>
    </div>
    <div class="panel" id="farmer-knowledge-panel">
      <h2>Disease Knowledge Base</h2>
      <div class="pill-row" id="lang-pills">
        <span class="pill active" data-lang="en">English</span>
        <span class="pill" data-lang="hi">हिन्दी</span>
      </div>
      <div id="knowledge-content" class="empty">Select a disease below.</div>
      <div class="pill-row" style="margin-top:10px;">
        <span class="pill" data-disease="Early Blight">Early Blight</span>
        <span class="pill" data-disease="Septoria Leaf Spot">Septoria Leaf Spot</span>
        <span class="pill" data-disease="Nutrient Deficiency (Potassium)">Potassium Deficiency</span>
      </div>
    </div>
  `;
  bindFieldSelector();

  document.getElementById("submit-scan-btn").addEventListener("click", submitScan);
  document.getElementById("submit-followup-btn").addEventListener("click", submitFollowup);
  document.getElementById("image-file").addEventListener("change", handleImagePreview);
  loadModelInfo();

  let currentLang = "en";
  let currentDisease = null;
  document.querySelectorAll("#lang-pills .pill").forEach(p => {
    p.addEventListener("click", () => {
      document.querySelectorAll("#lang-pills .pill").forEach(x => x.classList.remove("active"));
      p.classList.add("active");
      currentLang = p.dataset.lang;
      if (currentDisease) loadKnowledge(currentDisease, currentLang);
    });
  });
  document.querySelectorAll("[data-disease]").forEach(p => {
    p.addEventListener("click", () => {
      document.querySelectorAll("[data-disease]").forEach(x => x.classList.remove("active"));
      p.classList.add("active");
      currentDisease = p.dataset.disease;
      loadKnowledge(currentDisease, currentLang);
    });
  });

  await loadAlertsForField();
  await loadPassport();
}

let pendingImageBase64 = null;

function handleImagePreview(e) {
  const file = e.target.files[0];
  const previewEl = document.getElementById("image-preview");
  if (!file) { pendingImageBase64 = null; previewEl.innerHTML = ""; return; }
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    pendingImageBase64 = dataUrl.split(",")[1]; // strip "data:image/...;base64,"
    previewEl.innerHTML = `<img src="${dataUrl}" style="max-width:180px;border-radius:6px;border:1px solid var(--line);">`;
  };
  reader.readAsDataURL(file);
}

async function loadModelInfo() {
  const el = document.getElementById("model-info-content");
  try {
    const meta = await api("/model-info");
    let html = `<div style="margin-bottom:8px;"><span class="badge low">Test accuracy: ${(meta.test_accuracy * 100).toFixed(1)}%</span></div>`;
    html += `<p style="font-size:0.82rem;">Classes: ${meta.classes.join(", ")}</p>`;
    html += `<p style="font-size:0.8rem;color:var(--ink-soft);">Trained on ${meta.n_train} real images, tested on ${meta.n_test} held-out real images. Source: <a href="${meta.dataset_source}" target="_blank">PlantVillage dataset</a>.</p>`;
    html += `<div class="callout">⚠ Trained on lab-condition photos with plain backgrounds — real farmer field photos (cluttered background, variable lighting) will likely perform worse than this number suggests. See backend README for details.</div>`;
    el.innerHTML = html;
  } catch (e) {
    el.innerHTML = `<p class="empty">Could not load model info: ${e.message}</p>`;
  }
}

async function submitScan() {
  const btn = document.getElementById("submit-scan-btn");
  const symptomEls = document.querySelectorAll("#symptom-checks input:checked");
  const symptoms = Array.from(symptomEls).map(e => e.value);
  const imageRef = document.getElementById("image-ref").value;
  const resultEl = document.getElementById("ai-result");
  resultEl.innerHTML = skeleton(3);
  await withSpinner(btn, async () => {
    try {
      const body = { field_id: state.selectedFieldId, image_ref: imageRef, symptom_keywords: symptoms };
      if (pendingImageBase64) body.image_base64 = pendingImageBase64;
      const res = await api("/observations", { method: "POST", body: JSON.stringify(body) });
      state.lastObservationId = res.observation.observation_id;
      const a = res.ai_analysis;
      let html = `<h3>AI ANALYSIS <span style="font-weight:400;">(${a.model_used === 'trained_classifier' ? 'real trained model' : 'keyword fallback — no image provided'})</span></h3>`;
      a.differential.forEach(d => {
        html += `<div class="diag-row"><span>${d.disease}</span><div class="confidence-bar"><div class="confidence-bar-fill" data-target="${Math.round(d.confidence * 100)}"></div></div><span class="pct">${Math.round(d.confidence * 100)}%</span></div>`;
      });
      html += `<div style="margin-top:10px;"><span class="badge moderate">Severity: ${a.severity_estimate}</span></div>`;
      if (a.needs_investigation) {
        html += `<div class="callout">${a.investigation_request}</div>`;
      } else {
        html += `<div class="callout green">Confidence is high enough — this case is ready for expert review.</div>`;
      }
      resultEl.innerHTML = html;
      requestAnimationFrame(() => {
        document.querySelectorAll(".confidence-bar-fill").forEach(el => {
          requestAnimationFrame(() => { el.style.width = el.dataset.target + "%"; });
        });
      });
    } catch (e) {
      resultEl.innerHTML = `<p class="empty">Error: ${e.message}</p>`;
    }
  });
}

async function submitFollowup() {
  const btn = document.getElementById("submit-followup-btn");
  const resultEl = document.getElementById("followup-result");
  if (!state.lastFollowupId) {
    resultEl.innerHTML = `<p class="empty">No follow-up is scheduled for this field yet — log an intervention first in the Officer view.</p>`;
    return;
  }
  const severity = parseInt(document.getElementById("followup-severity").value, 10);
  await withSpinner(btn, async () => {
    try {
      const res = await api("/outcomes", {
        method: "POST",
        body: JSON.stringify({ field_id: state.selectedFieldId, followup_id: state.lastFollowupId, new_severity_pct: severity }),
      });
      resultEl.innerHTML = `
        <div class="callout green">
          <b>${res.previous_severity_pct}% → ${res.new_severity_pct}%</b><br>${res.interpretation}
        </div>`;
    } catch (e) {
      resultEl.innerHTML = `<p class="empty">Error: ${e.message}</p>`;
    }
  });
}

async function loadAlertsForField() {
  const el = document.getElementById("alerts-list");
  try {
    const alerts = await api(`/alerts/${state.selectedFieldId}`);
    if (!alerts.length) {
      el.innerHTML = `<p class="empty">No regional alerts for this field yet.</p>`;
      return;
    }
    el.innerHTML = alerts.map(a => `
      <div class="chat-msg">
        <div class="chat-head">
          <span class="chat-farmer">${a.disease} nearby (${a.distance_km} km)</span>
          <span class="delivery-badge ${a.sync_status === 'synced' ? 'synced' : 'pending'}">${a.sync_status === 'synced' ? '● synced' : '◌ pending'}</span>
        </div>
        <div class="chat-bubble">${a.message}</div>
        <div class="chat-bubble cure"><b>What to do:</b> ${a.treatment_summary}</div>
      </div>
    `).join("");
  } catch (e) {
    el.innerHTML = `<p class="empty">Error loading alerts: ${e.message}</p>`;
  }
}

async function loadPassport() {
  const el = document.getElementById("passport-content");
  try {
    const p = await api(`/fields/${state.selectedFieldId}/passport`);
    let html = `<div style="margin-bottom:10px;"><span class="badge ${p.trend === 'Worsening' ? 'high' : p.trend === 'Improving' ? 'low' : 'moderate'}">Trend: ${p.trend}</span></div>`;
    if (!p.expert_reviews.length) {
      html += `<p class="empty">No confirmed reviews yet for this field.</p>`;
    } else {
      p.expert_reviews.forEach(r => {
        html += `<div class="diag-row"><span>${r.confirmed_disease}</span><span class="pct">${r.severity}</span></div>`;
      });
    }
    el.innerHTML = html;
  } catch (e) {
    el.innerHTML = `<p class="empty">Error: ${e.message}</p>`;
  }
}

async function loadKnowledge(disease, lang) {
  const el = document.getElementById("knowledge-content");
  el.innerHTML = `<p class="empty">Loading…</p>`;
  try {
    const doc = await api(`/knowledge/${encodeURIComponent(disease)}?lang=${lang}`);
    let html = `<p style="font-size:0.9rem;">${doc.description}</p>`;
    html += `<h3>SAFE NEXT STEPS</h3><ul>`;
    doc.safe_next_steps.forEach(s => html += `<li style="font-size:0.87rem;margin-bottom:4px;">${s}</li>`);
    html += `</ul>`;
    if (doc._note) html += `<div class="footnote">${doc._note}</div>`;
    el.innerHTML = html;
  } catch (e) {
    el.innerHTML = `<p class="empty">Error: ${e.message}</p>`;
  }
}

// ====== EXPERT VIEW ======
async function renderExpert(root) {
  root.innerHTML = `
    <div class="panel">
      <h2>Pending Cases</h2>
      <div id="pending-list">${skeleton(2)}</div>
    </div>
    <div class="panel">
      <h2>Submit Expert Review</h2>
      ${fieldSelector()}
      <label>Observation ID</label>
      <input type="text" id="review-obs-id" placeholder="paste an observation_id from a pending case">
      <label>Confirmed disease</label>
      <select id="review-disease">
        <option>Early Blight</option>
        <option>Septoria Leaf Spot</option>
        <option>Nutrient Deficiency (Potassium)</option>
      </select>
      <label>Severity</label>
      <select id="review-severity">
        <option>Low</option><option>Medium</option><option>Medium-High</option><option selected>High</option>
      </select>
      <label>Expert name</label>
      <input type="text" id="review-expert-name" value="Dr. Meera Nair">
      <label>Comments</label>
      <textarea id="review-comments" rows="2">Confirmed, flowering-stage risk.</textarea>
      <button class="primary" id="submit-review-btn">Submit Review</button>
      <div id="review-result"></div>
    </div>
    <div class="panel">
      <h2>Refer to Lab / Extension</h2>
      <label>Reason</label>
      <input type="text" id="referral-reason" value="Confirm fungicide resistance">
      <label>Referred by</label>
      <input type="text" id="referral-by" value="Dr. Meera Nair">
      <button class="primary" id="submit-referral-btn">Create Referral</button>
      <div id="referral-result"></div>
    </div>
  `;
  bindFieldSelector();
  document.getElementById("submit-review-btn").addEventListener("click", submitReview);
  document.getElementById("submit-referral-btn").addEventListener("click", submitReferral);
  await loadPendingCases();
}

async function loadPendingCases() {
  const el = document.getElementById("pending-list");
  try {
    const pending = await api("/expert-reviews/pending");
    if (!pending.length) {
      el.innerHTML = `<p class="empty">No pending cases — submit a farmer scan first.</p>`;
      return;
    }
    el.innerHTML = pending.map(a => `
      <div class="diag-row">
        <span>obs: ${a.observation_id} — top: ${a.differential[0].disease} (${Math.round(a.differential[0].confidence*100)}%)</span>
        <span class="pct">${a.needs_investigation ? "needs investigation" : "ready for review"}</span>
      </div>
    `).join("");
  } catch (e) {
    el.innerHTML = `<p class="empty">Error: ${e.message}</p>`;
  }
}

async function submitReview() {
  const btn = document.getElementById("submit-review-btn");
  const resultEl = document.getElementById("review-result");
  const observationId = document.getElementById("review-obs-id").value.trim();
  if (!observationId) {
    resultEl.innerHTML = `<p class="empty">Paste an observation_id from the pending list above first.</p>`;
    return;
  }
  await withSpinner(btn, async () => {
    try {
      const res = await api("/expert-reviews", {
        method: "POST",
        body: JSON.stringify({
          observation_id: observationId,
          confirmed_disease: document.getElementById("review-disease").value,
          severity: document.getElementById("review-severity").value,
          comments: document.getElementById("review-comments").value,
          expert_name: document.getElementById("review-expert-name").value,
        }),
      });
      let html = `<div class="callout green">Review recorded. Risk recalculated and alerts broadcast.</div>`;
      if (res.risk_assessment) {
        const levelClass = res.risk_assessment.level === "HIGH" ? "" : res.risk_assessment.level === "MEDIUM" ? "medium" : "low";
        html += `<div class="risk-score"><span class="num ${levelClass}" id="risk-num">0</span><span>/100 — ${res.risk_assessment.level}</span></div><ul class="factor-list">`;
        res.risk_assessment.factors.forEach(f => html += `<li><span>${f.label}</span><span class="weight">+${f.weight}</span></li>`);
        html += `</ul>`;
      }
      if (res.alerts_broadcast && res.alerts_broadcast.length) {
        html += `<div class="footnote">${res.alerts_broadcast.length} nearby field(s) alerted.</div>`;
      }
      resultEl.innerHTML = html;
      const numEl = document.getElementById("risk-num");
      if (numEl) animateCount(numEl, 0, res.risk_assessment.score);
      await loadPendingCases();
    } catch (e) {
      resultEl.innerHTML = `<p class="empty">Error: ${e.message}</p>`;
    }
  });
}

async function submitReferral() {
  const btn = document.getElementById("submit-referral-btn");
  const resultEl = document.getElementById("referral-result");
  await withSpinner(btn, async () => {
    try {
      const res = await api("/lab-referrals", {
        method: "POST",
        body: JSON.stringify({
          field_id: state.selectedFieldId,
          reason: document.getElementById("referral-reason").value,
          referred_by: document.getElementById("referral-by").value,
        }),
      });
      resultEl.innerHTML = `<div class="callout">Referral created — status: <b>${res.status}</b></div>`;
    } catch (e) {
      resultEl.innerHTML = `<p class="empty">Error: ${e.message}</p>`;
    }
  });
}

// ====== OFFICER VIEW ======
async function renderOfficer(root) {
  root.innerHTML = `
    <div class="panel">
      <h2>Inspection Priority Queue</h2>
      <div id="queue-list">${skeleton(3)}</div>
    </div>
    <div class="panel">
      <h2>Regional Hotspot Map</h2>
      <div id="leaflet-map"></div>
      <div class="map-legend">
        <span><i style="background:#B5432D;"></i>High risk</span>
        <span><i style="background:#C68A2E;"></i>Medium risk</span>
        <span><i style="background:#24463B;"></i>Low risk</span>
        <span><i style="background:#C9C4B2;"></i>Not yet assessed</span>
      </div>
      <div class="footnote">Real OpenStreetMap tiles via Leaflet. Coordinates and risk levels come straight from /officer/hotspot-map.</div>
    </div>
    <div class="grid-2">
      <div class="panel">
        <h2>Submit Sensor Reading</h2>
        ${fieldSelector()}
        <label>Sensor type</label>
        <select id="sensor-type"><option value="pheromone_trap">Pheromone trap</option><option value="soil_moisture">Soil moisture</option></select>
        <label>Value</label>
        <input type="number" id="sensor-value" value="12">
        <label>Unit</label>
        <input type="text" id="sensor-unit" value="pests_per_trap">
        <button class="primary" id="submit-sensor-btn">Submit Reading</button>
        <div id="sensor-result"></div>
      </div>
      <div class="panel">
        <h2>Log Intervention</h2>
        <label>Action taken</label>
        <input type="text" id="intervention-action" value="Extension officer visit + guidance issued">
        <label>Officer name</label>
        <input type="text" id="intervention-officer" value="Officer Deshmukh">
        <button class="primary" id="submit-intervention-btn">Log Intervention</button>
        <div id="intervention-result"></div>
      </div>
    </div>
  `;
  bindFieldSelector();
  document.getElementById("submit-sensor-btn").addEventListener("click", submitSensor);
  document.getElementById("submit-intervention-btn").addEventListener("click", submitIntervention);
  await loadQueue();
  await loadMap();
}

async function loadQueue() {
  const el = document.getElementById("queue-list");
  try {
    const queue = await api("/officer/priority-queue");
    if (!queue.length) {
      el.innerHTML = `<p class="empty">No risk assessments yet — confirm a case via Expert Review first.</p>`;
      return;
    }
    el.innerHTML = queue.map((q, i) => `
      <div class="queue-item ${i === 0 ? 'top' : ''}">
        <div>
          <div class="field-name">Priority ${i + 1} — Field ${q.field_id} (${q.owner_name})</div>
          <div class="reasons">${q.factors.map(f => f.label).join(" · ")}</div>
        </div>
        <div class="score">${q.score}</div>
      </div>
    `).join("");
  } catch (e) {
    el.innerHTML = `<p class="empty">Error: ${e.message}</p>`;
  }
}

async function loadMap() {
  try {
    const data = await api("/officer/hotspot-map");
    const points = data.points;
    const mapEl = document.getElementById("leaflet-map");
    if (!points.length) { mapEl.innerHTML = `<p class="empty">No fields yet.</p>`; return; }

    if (state.leafletMap) {
      state.leafletMap.remove();
      state.leafletMap = null;
    }

    const avgLat = points.reduce((s, p) => s + p.latitude, 0) / points.length;
    const avgLng = points.reduce((s, p) => s + p.longitude, 0) / points.length;

    const map = L.map("leaflet-map").setView([avgLat, avgLng], 14);
    state.leafletMap = map;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const colorFor = level => level === "HIGH" ? "#B5432D" : level === "MEDIUM" ? "#C68A2E" : level === "LOW" ? "#24463B" : "#9A9484";

    points.forEach((p, i) => {
      const radius = p.level === "HIGH" ? 220 : p.level === "MEDIUM" ? 150 : 90;
      const circle = L.circle([p.latitude, p.longitude], {
        radius,
        color: colorFor(p.level),
        fillColor: colorFor(p.level),
        fillOpacity: 0.35,
        weight: 2,
      }).addTo(map);
      circle.bindPopup(`
        <b>Field ${p.field_id}</b> — ${p.owner_name}<br>
        Risk: ${p.score !== null ? p.score + '/100' : '—'} (${p.level})
      `);
      // subtle staggered pulse-in via opacity animation on the underlying SVG element
      setTimeout(() => {
        const path = circle.getElement();
        if (path) {
          path.style.transition = "opacity 0.4s ease";
          path.style.opacity = "0";
          requestAnimationFrame(() => { path.style.opacity = "1"; });
        }
      }, i * 90);
    });
  } catch (e) {
    document.getElementById("leaflet-map").innerHTML = `<p class="empty">Error loading map: ${e.message}</p>`;
  }
}

async function submitSensor() {
  const btn = document.getElementById("submit-sensor-btn");
  const resultEl = document.getElementById("sensor-result");
  await withSpinner(btn, async () => {
    try {
      const res = await api("/sensor-readings", {
        method: "POST",
        body: JSON.stringify({
          field_id: state.selectedFieldId,
          sensor_type: document.getElementById("sensor-type").value,
          value: parseFloat(document.getElementById("sensor-value").value),
          unit: document.getElementById("sensor-unit").value,
        }),
      });
      resultEl.innerHTML = `<div class="callout green">Reading recorded (${res.value} ${res.unit}). It'll factor into the next risk calculation for this field.</div>`;
    } catch (e) {
      resultEl.innerHTML = `<p class="empty">Error: ${e.message}</p>`;
    }
  });
}

async function submitIntervention() {
  const btn = document.getElementById("submit-intervention-btn");
  const resultEl = document.getElementById("intervention-result");
  await withSpinner(btn, async () => {
    try {
      const res = await api("/interventions", {
        method: "POST",
        body: JSON.stringify({
          field_id: state.selectedFieldId,
          action_taken: document.getElementById("intervention-action").value,
          officer_name: document.getElementById("intervention-officer").value,
        }),
      });
      state.lastFollowupId = res.followup.followup_id;
      resultEl.innerHTML = `<div class="callout green">Intervention logged. Follow-up scheduled for ${res.followup.due_date} (followup_id: ${res.followup.followup_id}). Go to the Farmer view to submit that follow-up scan.</div>`;
    } catch (e) {
      resultEl.innerHTML = `<p class="empty">Error: ${e.message}</p>`;
    }
  });
}

init();
