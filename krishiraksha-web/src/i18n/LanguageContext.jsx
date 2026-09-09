import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { translations } from './translations';

const LANG_STORAGE_KEY = 'krishiraksha_web_lang';

export const AVAILABLE_LANGUAGES = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी' },
];

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key, params) => key,
  languages: AVAILABLE_LANGUAGES,
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved && translations[saved]) return saved;
    } catch (e) {
      // localStorage may not be accessible in all environments
    }
    return 'en';
  });

  const setLanguage = (code) => {
    if (translations[code]) {
      setLanguageState(code);
      try {
        localStorage.setItem(LANG_STORAGE_KEY, code);
      } catch (e) {
        // ignore
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
