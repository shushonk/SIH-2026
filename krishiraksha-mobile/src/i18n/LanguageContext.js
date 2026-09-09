import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from './translations';

const LANG_STORAGE_KEY = '@krishiraksha_lang';

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key, params) => key,
  languages: [],
});

export const AVAILABLE_LANGUAGES = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी' },
];

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem(LANG_STORAGE_KEY);
      if (saved && translations[saved]) {
        setLanguageState(saved);
      }
    } catch (e) {
      console.warn('Failed to load saved language:', e);
    }
  };

  const setLanguage = async (code) => {
    if (translations[code]) {
      setLanguageState(code);
      try {
        await AsyncStorage.setItem(LANG_STORAGE_KEY, code);
      } catch (e) {
        console.warn('Failed to persist language:', e);
      }
    }
  };

  const t = useMemo(() => {
    return (key, params = {}) => {
      const dict = translations[language] || translations.en;
      let text = dict[key] || translations.en[key] || key;
      if (params && typeof params === 'object') {
        Object.keys(params).forEach((paramKey) => {
          text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), params[paramKey]);
        });
      }
      return text;
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: AVAILABLE_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
