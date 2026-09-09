import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const SEEDED_FALLBACK_FIELDS = [
  {
    field_id: '104',
    field_name: 'Canal-fed Plot A',
    owner_name: 'Ramesh Patil',
    crop: 'Tomato',
    variety: 'Pusa Ruby',
    growth_stage: 'Flowering',
    soil_type: 'Clay loam',
    soil_moisture_pct: 74,
    current_risk_score: 64,
    current_risk_level: 'MEDIUM'
  },
  {
    field_id: '218',
    field_name: 'North Terrace Bed',
    owner_name: 'Sunita Devi',
    crop: 'Tomato',
    variety: 'Arka Rakshak',
    growth_stage: 'Vegetative',
    soil_type: 'Sandy loam',
    soil_moisture_pct: 62,
    current_risk_score: 42,
    current_risk_level: 'LOW'
  },
  {
    field_id: '301',
    field_name: 'South Irrigation Plot',
    owner_name: 'Lakshmi Bai',
    crop: 'Tomato',
    variety: 'Pusa Ruby',
    growth_stage: 'Fruiting',
    soil_type: 'Clay loam',
    soil_moisture_pct: 78,
    current_risk_score: 72,
    current_risk_level: 'HIGH'
  }
];

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('krishiraksha_jwt'));
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('krishiraksha_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [role, setRole] = useState(() => user?.role || 'Farmer');
  const [selectedFieldId, setSelectedFieldId] = useState('104');
  const [fields, setFields] = useState(SEEDED_FALLBACK_FIELDS);
  const [loading, setLoading] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Validate session on mount
    if (token) {
      validateSession();
    } else {
      setAuthInitialized(true);
    }

    const handleExpired = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('krishiraksha_auth_expired', handleExpired);
    return () => window.removeEventListener('krishiraksha_auth_expired', handleExpired);
  }, []);

  const validateSession = async () => {
    try {
      const profile = await api.getCurrentUser();
      setUser(profile);
      setRole(profile.role);
      localStorage.setItem('krishiraksha_user', JSON.stringify(profile));
      loadFields();
    } catch (e) {
      console.warn('Session verification failed, logging out:', e);
      logout();
    } finally {
      setAuthInitialized(true);
    }
  };

  const loadFields = async () => {
    try {
      const data = await api.getFields();
      if (Array.isArray(data) && data.length > 0) {
        setFields(data);
      }
    } catch (e) {
      console.warn('Using seeded fields fallback:', e);
    }
  };

  const setAuthSession = (accessToken, userProfile) => {
    localStorage.setItem('krishiraksha_jwt', accessToken);
    localStorage.setItem('krishiraksha_user', JSON.stringify(userProfile));
    setToken(accessToken);
    setUser(userProfile);
    setRole(userProfile.role);
    loadFields();
  };

  const login = async (identifier, password) => {
    setLoading(true);
    try {
      const res = await api.login(identifier, password);
      setAuthSession(res.access_token, res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data) => {
    setLoading(true);
    try {
      const res = await api.signup(data);
      setAuthSession(res.access_token, res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (roleName) => {
    setLoading(true);
    try {
      const res = await api.demoLogin(roleName);
      setAuthSession(res.access_token, res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (identifier) => {
    return api.forgotPassword(identifier);
  };

  const logout = () => {
    localStorage.removeItem('krishiraksha_jwt');
    localStorage.removeItem('krishiraksha_user');
    setToken(null);
    setUser(null);
  };

  const switchRole = async (newRole) => {
    setRole(newRole);
    try {
      const res = await api.demoLogin(newRole);
      setAuthSession(res.access_token, res.user);
    } catch (e) {
      console.warn('Auto-token switch note:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role,
        isAuthenticated: !!token && !!user,
        authInitialized,
        login,
        signup,
        demoLogin,
        forgotPassword,
        logout,
        switchRole,
        selectedFieldId,
        setSelectedFieldId,
        fields,
        refreshFields: loadFields,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
