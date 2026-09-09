import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setAuthToken } from '../services/api';

const AUTH_STORAGE_KEY = '@krishiraksha_auth_session';

export const DEMO_USERS = {
  Farmer: {
    name: 'Ramesh Patil',
    email: 'farmer@krishiraksha.org',
    role: 'Farmer',
    fieldId: '104',
    fieldName: 'North Canopy Acre (Pusa Ruby Tomato)',
    village: 'Khed, Pune',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  Expert: {
    name: 'Dr. Meera Nair',
    email: 'expert@krishiraksha.org',
    role: 'Expert',
    fieldId: null,
    specialization: 'ICAR Plant Pathologist (Solanaceae Specialist)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  },
  Officer: {
    name: 'Officer Deshmukh',
    email: 'officer@krishiraksha.org',
    role: 'Officer',
    fieldId: null,
    jurisdiction: 'Khed-Manchar Agricultural Sub-Division',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  },
  Admin: {
    name: 'Rajesh Verma',
    email: 'admin@krishiraksha.gov.in',
    role: 'Admin',
    fieldId: null,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  },
};

const AuthContext = createContext({
  user: null,
  token: null,
  role: 'Farmer',
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  quickDemoLogin: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(DEMO_USERS.Farmer);
  const [token, setToken] = useState('demo_token_farmer_104');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedSession();
  }, []);

  const loadSavedSession = async () => {
    try {
      const saved = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const session = JSON.parse(saved);
        if (session && session.user) {
          setUser(session.user);
          setToken(session.token || null);
          setAuthToken(session.token || null);
        }
      } else {
        // Default to Farmer for demo convenience
        quickDemoLogin('Farmer');
      }
    } catch (e) {
      console.warn('Failed to load auth session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (identifier, password) => {
    try {
      const res = await api.post('/auth/login', { identifier, password });
      const { access_token, user: apiUser } = res.data;
      const normalizedUser = {
        ...apiUser,
        role: apiUser.role || 'Farmer',
        fieldId: apiUser.role === 'Farmer' ? '104' : null,
      };
      setUser(normalizedUser);
      setToken(access_token);
      setAuthToken(access_token);

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        token: access_token,
        user: normalizedUser,
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'Login failed' };
    }
  };

  const quickDemoLogin = async (roleName) => {
    const demoUser = DEMO_USERS[roleName] || DEMO_USERS.Farmer;
    setUser(demoUser);
    const mockToken = `token_${roleName.toLowerCase()}_${Date.now()}`;
    setToken(mockToken);
    setAuthToken(mockToken);

    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        token: mockToken,
        user: demoUser,
      }));
    } catch (e) {
      console.warn('Failed to save demo session:', e);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear session:', e);
    }
  };

  const role = user?.role || 'Farmer';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated,
        isLoading,
        login,
        quickDemoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
