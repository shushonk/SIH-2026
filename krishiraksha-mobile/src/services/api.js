// HTTP REST Client for KrishiRaksha Backend

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_STORAGE_KEY = '@krishiraksha_api_base';

// Default API Base (FastAPI backend port 8000)
let currentApiBase = 'http://127.0.0.1:8000';
let currentAuthToken = null;

export const setAuthToken = (token) => {
  currentAuthToken = token;
};

export const setCustomApiBase = async (newBase) => {
  currentApiBase = newBase.replace(/\/+$/, '');
  try {
    await AsyncStorage.setItem(API_BASE_STORAGE_KEY, currentApiBase);
  } catch (e) {
    console.warn('Failed to save API base:', e);
  }
};

export const getApiBase = () => currentApiBase;

// Initialize saved API base
(async () => {
  try {
    const saved = await AsyncStorage.getItem(API_BASE_STORAGE_KEY);
    if (saved) currentApiBase = saved;
  } catch (e) {}
})();

const request = async (endpoint, method = 'GET', body = null) => {
  const url = `${currentApiBase}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (currentAuthToken) {
    headers['Authorization'] = `Bearer ${currentAuthToken}`;
  }

  const options = {
    method,
    headers,
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error = new Error(data?.detail || data?.message || `HTTP ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return { data, status: response.status };
  } catch (error) {
    // Network failure or server unreachable
    if (!error.status) {
      error.isNetworkError = true;
    }
    throw error;
  }
};

export const api = {
  get: (endpoint) => request(endpoint, 'GET'),
  post: (endpoint, body) => request(endpoint, 'POST', body),
  put: (endpoint, body) => request(endpoint, 'PUT', body),
  delete: (endpoint) => request(endpoint, 'DELETE'),
};
