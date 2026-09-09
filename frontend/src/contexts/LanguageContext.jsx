import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';

const LanguageContext = createContext();
const LANGUAGE_STORAGE_KEY = 'bizmanager_language';

export const LanguageProvider = ({ children }) => {
  // Always default to English unless the user explicitly chose another language
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en';
    } catch {
      return 'en';
    }
  });

  const isRtl = language === 'ur';

  useEffect(() => {
    // Apply RTL and language attributes to documentElement
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
    
    if (isRtl) {
      document.documentElement.classList.add('urdu-active');
      document.body.classList.add('font-urdu');
    } else {
      document.documentElement.classList.remove('urdu-active');
      document.body.classList.remove('font-urdu');
    }

    // Keep i18n synchronized with current language
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, isRtl]);

  // When user changes language, always remember their choice
  const changeLanguage = (newLang) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    } catch (e) {
      console.error('Failed to save language preference:', e);
    }
    i18n.changeLanguage(newLang);
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        isRtl, 
        isUrdu: isRtl, 
        changeLanguage
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
