import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const routeMeta = {
  '/': {
    titleEn: 'BizManager — Retail POS, Udhaar & Inventory ERP by MegaTrix',
    titleUr: 'بز مینیجر — ریٹیل بلنگ، ادھار کھاتہ اور انوینٹری سافٹ ویئر از میگا ٹرکس',
    descEn: 'BizManager by MegaTrix Technologies is the fast dual-language (Urdu & English) POS, billing, and udhaar ledger system for retailers in Pakistan.',
    descUr: 'بز مینیجر از میگا ٹرکس ٹیکنالوجیز: دکانوں، سپر اسٹورز اور ہول سیلرز کے لیے اردو اور انگلش بلنگ، اسٹاک اور ادھار کھاتہ کا مکمل نظام۔'
  },
  '/login': {
    titleEn: 'Sign In — BizManager by MegaTrix',
    titleUr: 'لاگ ان — بز مینیجر از میگا ٹرکس',
    descEn: 'Sign in to your BizManager retail dashboard to manage billing, inventory, and ledger.',
    descUr: 'اپنے بز مینیجر پورٹل میں لاگ ان کریں اور بلنگ اور کھاتہ سنبھالیں۔'
  },
  '/register': {
    titleEn: 'Create Free Account — BizManager by MegaTrix',
    titleUr: 'نیا اکاؤنٹ بنائیں — بز مینیجر از میگا ٹرکس',
    descEn: 'Start your free trial with BizManager by MegaTrix Technologies today.',
    descUr: 'میگا ٹرکس ٹیکنالوجیز کے بز مینیجر پر اپنا مفت ٹرائل اکاؤنٹ بنائیں۔'
  },
  '/privacy-policy': {
    titleEn: 'Privacy Policy — BizManager by MegaTrix Technologies',
    titleUr: 'پرائیویسی پالیسی — بز مینیجر از میگا ٹرکس ٹیکنالوجیز',
    descEn: 'Privacy and data protection commitment for BizManager by MegaTrix Technologies.',
    descUr: 'بز مینیجر اور میگا ٹرکس ٹیکنالوجیز کی ڈیٹا سیکیورٹی اور پرائیویسی پالیسی۔'
  },
  '/terms': {
    titleEn: 'Terms of Service — BizManager by MegaTrix Technologies',
    titleUr: 'شرائط و ضوابط — بز مینیجر از میگا ٹرکس ٹیکنالوجیز',
    descEn: 'Commercial software license terms and conditions for BizManager by MegaTrix.',
    descUr: 'بز مینیجر از میگا ٹرکس ٹیکنالوجیز کے استعمال کی قانونی شرائط اور ضوابط۔'
  },
  '/dashboard': {
    titleEn: 'Dashboard — BizManager',
    titleUr: 'ڈیش بورڈ — بز مینیجر'
  },
  '/pos': {
    titleEn: 'Point of Sale (POS) — BizManager',
    titleUr: 'بلنگ کاؤنٹر (POS) — بز مینیجر'
  },
  '/inventory': {
    titleEn: 'Inventory Control — BizManager',
    titleUr: 'اسٹاک اور انوینٹری — بز مینیجر'
  },
  '/udhaar': {
    titleEn: 'Udhaar Khata & Credit Ledger — BizManager',
    titleUr: 'ادھار کھاتہ اور وصولیاں — بز مینیجر'
  }
};

export const useDocumentMeta = () => {
  const location = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    const meta = routeMeta[location.pathname] || {
      titleEn: 'BizManager — A Product of MegaTrix Technologies',
      titleUr: 'بز مینیجر — میگا ٹرکس ٹیکنالوجیز کی پراڈکٹ'
    };

    const isUrdu = language === 'ur';
    const newTitle = isUrdu ? (meta.titleUr || meta.titleEn) : meta.titleEn;
    document.title = newTitle;

    // Update meta description tag dynamically
    const descContent = isUrdu ? (meta.descUr || meta.descEn) : meta.descEn;
    if (descContent) {
      let descMeta = document.querySelector('meta[name="description"]');
      if (!descMeta) {
        descMeta = document.createElement('meta');
        descMeta.setAttribute('name', 'description');
        document.head.appendChild(descMeta);
      }
      descMeta.setAttribute('content', descContent);
    }

    // Update canonical link dynamically
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    const baseUrl = 'https://bizmanager.megatrixai.com';
    canonicalLink.setAttribute('href', `${baseUrl}${location.pathname}`);

  }, [location.pathname, language]);
};
