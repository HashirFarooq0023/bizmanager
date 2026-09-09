import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('bizmanager_language') || 'ur';
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
  }, [language, isRtl]);

  const changeLanguage = (newLang) => {
    setLanguageState(newLang);
    localStorage.setItem('bizmanager_language', newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, isRtl, isUrdu: isRtl, changeLanguage }}>
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
