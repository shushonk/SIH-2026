// Base API wrapper for KrishiRaksha
const API_BASE = window.KRISHIRAKSHA_API_BASE || '';

export async function fetchApi(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  
  const token = localStorage.getItem('krishiraksha_jwt');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorText;
    try {
      const errJson = await response.json();
      errorText = errJson.detail || errJson.message || JSON.stringify(errJson);
    } catch {
      errorText = await response.text();
    }
    
    // Auto-logout if token is expired/invalid on protected route
    if (response.status === 401 && !path.includes('/auth/login') && !path.includes('/auth/signup')) {
      localStorage.removeItem('krishiraksha_jwt');
      localStorage.removeItem('krishiraksha_user');
      window.dispatchEvent(new Event('krishiraksha_auth_expired'));
    }

    throw new Error(errorText || `API error ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth & RBAC
  login: (identifier, password) => fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password })
  }),
  signup: (data) => fetchApi('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  demoLogin: (role) => fetchApi('/auth/demo-login', {
    method: 'POST',
    body: JSON.stringify({ role })
  }),
  forgotPassword: (identifier) => fetchApi('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ identifier })
  }),
  getCurrentUser: () => fetchApi('/auth/me'),
  getRoles: () => fetchApi('/auth/roles'),

  // Fields & Passport
  getFields: () => fetchApi('/fields'),
  getField: (id) => fetchApi(`/fields/${id}`),
  getPassport: (fieldId) => fetchApi(`/fields/${fieldId}/passport`),
  getFieldMemory: (fieldId) => fetchApi(`/fields/${fieldId}/memory`),
  recomputeRisk: (fieldId) => fetchApi(`/fields/${fieldId}/recompute-risk`, { method: 'POST' }),

  // Observations & Investigation
  submitObservation: (data) => fetchApi('/observations', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  submitInvestigation: (obsId, data) => fetchApi(`/observations/${obsId}/investigate`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getObservation: (obsId) => fetchApi(`/observations/${obsId}`),

  // Expert
  getPendingCases: () => fetchApi('/expert-reviews/pending'),
  submitExpertReview: (data) => fetchApi('/expert-reviews', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getExpertHistory: () => fetchApi('/expert-reviews/history'),

  // Officer
  getPriorityQueue: () => fetchApi('/officer/priority-queue'),
  getHotspotMap: () => fetchApi('/officer/hotspot-map'),
  getSpatiotemporalCluster: () => fetchApi('/officer/spatiotemporal-cluster'),
  getClusters: () => fetchApi('/officer/clusters'),
  recordSensor: (data) => fetchApi('/officer/sensor-readings', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Follow-ups & Interventions
  recordIntervention: (data) => fetchApi('/interventions', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  recordOutcome: (data) => fetchApi('/outcomes', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Alerts & Knowledge
  getAlerts: (fieldId) => fetchApi(`/alerts/${fieldId}`),
  getAllAlerts: () => fetchApi('/alerts'),
  getKnowledgeDoc: (disease, lang = 'en') => fetchApi(`/knowledge/${encodeURIComponent(disease)}?lang=${lang}`),
  getAllKnowledge: () => fetchApi('/knowledge'),

  // Copilot & Simulator
  askCopilot: (data) => fetchApi('/copilot/chat', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  runSimulation: (data) => fetchApi('/simulator/what-if', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Admin
  getAdminStats: () => fetchApi('/admin/stats'),
  getAuditLogs: (role) => fetchApi(`/admin/audit-logs${role ? `?role=${role}` : ''}`),
  getUsers: () => fetchApi('/admin/users'),
  getModelInfo: () => fetchApi('/model-info'),

  // Sensors & Pest Traps (Item 10a)
  getTraps: (fieldId) => fetchApi(`/sensors/traps/${fieldId}`),
  logTrap: (data) => fetchApi('/sensors/traps', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getSensorReadings: (fieldId) => fetchApi(`/sensors/readings/${fieldId}`),
  logSensorReading: (data) => fetchApi('/sensors/readings', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Outbreak Forecast (Item 10b & 10c)
  getForecastAlerts: (fieldId, lang = 'en') => fetchApi(`/forecast/alerts/${fieldId}?lang=${lang}`),
  evaluateForecast: (fieldId, daysAhead = 5) => fetchApi(`/forecast/evaluate/${fieldId}?days_ahead=${daysAhead}`, {
    method: 'POST'
  }),

  // Case Messages (Item 10d)
  getCaseMessages: (caseId) => fetchApi(`/messages/case/${caseId}`),
  sendCaseMessage: (data) => fetchApi('/messages', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getUnreadMessageCount: () => fetchApi('/messages/unread-count')
};
