import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import urCommon from './locales/ur/common.json';
import enNav from './locales/en/nav.json';
import urNav from './locales/ur/nav.json';
import enLanding from './locales/en/landing.json';
import urLanding from './locales/ur/landing.json';
import enAuth from './locales/en/auth.json';
import urAuth from './locales/ur/auth.json';
import enPos from './locales/en/pos.json';
import urPos from './locales/ur/pos.json';
import enInventory from './locales/en/inventory.json';
import urInventory from './locales/ur/inventory.json';
import enUdhaar from './locales/en/udhaar.json';
import urUdhaar from './locales/ur/udhaar.json';
import enSales from './locales/en/sales.json';
import urSales from './locales/ur/sales.json';
import enPurchase from './locales/en/purchase.json';
import urPurchase from './locales/ur/purchase.json';
import enCashbank from './locales/en/cashbank.json';
import urCashbank from './locales/ur/cashbank.json';
import enReports from './locales/en/reports.json';
import urReports from './locales/ur/reports.json';

const resources = {
  en: {
    common: enCommon,
    nav: enNav,
    landing: enLanding,
    auth: enAuth,
    pos: enPos,
    inventory: enInventory,
    udhaar: enUdhaar,
    sales: enSales,
    purchase: enPurchase,
    cashbank: enCashbank,
    reports: enReports,
  },
  ur: {
    common: urCommon,
    nav: urNav,
    landing: urLanding,
    auth: urAuth,
    pos: urPos,
    inventory: urInventory,
    udhaar: urUdhaar,
    sales: urSales,
    purchase: urPurchase,
    cashbank: urCashbank,
    reports: urReports,
  },
};

const savedLanguage = localStorage.getItem('bizmanager_language') || 'ur';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'nav', 'landing', 'auth', 'pos', 'inventory', 'udhaar', 'sales', 'purchase', 'cashbank', 'reports'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'bizmanager_language',
      caches: ['localStorage'],
    },
  });

export default i18n;
