import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

const ModeContext = createContext();

export const ModeProvider = ({ children }) => {
  const { language } = useLanguage();

  const [mode, setModeState] = useState(() => {
    const saved = localStorage.getItem('bizmanager_mode');
    if (saved) return saved;
    // Default: English -> 'pro', Urdu -> 'asan'
    const savedLang = localStorage.getItem('bizmanager_language') || 'en';
    return savedLang === 'en' ? 'pro' : 'asan';
  });

  const [showModeOnboarding, setShowModeOnboarding] = useState(() => {
    // Only show onboarding if user has selected Urdu and has not completed mode onboarding
    const savedLang = localStorage.getItem('bizmanager_language') || 'en';
    const completed = localStorage.getItem('bizmanager_mode_onboarding_completed');
    return savedLang === 'ur' && !completed;
  });

  useEffect(() => {
    localStorage.setItem('bizmanager_mode', mode);
  }, [mode]);

  const setMode = (newMode) => {
    setModeState(newMode);
    localStorage.setItem('bizmanager_mode', newMode);
  };

  const toggleMode = () => {
    const nextMode = mode === 'asan' ? 'pro' : 'asan';
    setMode(nextMode);
  };

  const completeModeOnboarding = () => {
    localStorage.setItem('bizmanager_mode_onboarding_completed', 'true');
    setShowModeOnboarding(false);
  };

  const openModeOnboarding = () => {
    setShowModeOnboarding(true);
  };

  return (
    <ModeContext.Provider
      value={{
        mode,
        isAsan: mode === 'asan',
        isPro: mode === 'pro',
        setMode,
        toggleMode,
        showModeOnboarding,
        openModeOnboarding,
        completeModeOnboarding,
        // Backward compatibility
        showSetupModal: showModeOnboarding,
        openSetupModal: openModeOnboarding,
        completeSetup: completeModeOnboarding,
      }}
    >
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
};
