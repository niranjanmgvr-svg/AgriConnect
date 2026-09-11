import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';
import { 
  translateCommodity as rawTranslateCommodity,
  translateMandi as rawTranslateMandi,
  translateGrade as rawTranslateGrade,
  formatCurrency as rawFormatCurrency,
  formatQuantity as rawFormatQuantity
} from '../utils/localizationHelpers';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem('agriconnect_lang') || 'kn'; // Default to Kannada 'kn' for Indic priority
    } catch {
      return 'kn';
    }
  });

  const setLang = (newLang) => {
    setLangState(newLang);
    try {
      localStorage.setItem('agriconnect_lang', newLang);
    } catch (e) {
      console.warn('LocalStorage access warning:', e);
    }
  };

  const toggleLanguage = () => {
    const sequence = ['kn', 'en', 'hi', 'mr'];
    const currentIndex = sequence.indexOf(lang);
    const nextLang = sequence[(currentIndex + 1) % sequence.length];
    setLang(nextLang);
  };

  /**
   * Enhanced nested and flat translation key resolver with graceful fallback
   * e.g., t('buyer.portal_title') or t('nav_dashboard')
   */
  const t = (keyPath, defaultText = '') => {
    if (!keyPath) return defaultText;

    const resolvePath = (obj, path) => {
      if (!obj) return null;
      if (obj[path] !== undefined) return obj[path]; // Direct key
      const parts = path.split('.');
      let current = obj;
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return null;
        }
      }
      return typeof current === 'string' ? current : null;
    };

    // 1. Try active language
    const primaryMatch = resolvePath(translations[lang], keyPath);
    if (primaryMatch) return primaryMatch;

    // 2. Try English fallback
    const englishMatch = resolvePath(translations['en'], keyPath);
    if (englishMatch) return englishMatch;

    // 3. Fallback to defaultText or humanized key (e.g. 'portal_title' -> 'Portal Title')
    if (defaultText) return defaultText;
    const lastKeyPart = keyPath.split('.').pop() || keyPath;
    return lastKeyPart.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Helper wrappers bound to current language
  const translateCommodity = (cropName) => rawTranslateCommodity(cropName, lang);
  const translateMandi = (mandiName) => rawTranslateMandi(mandiName, lang);
  const translateGrade = (gradeStr) => rawTranslateGrade(gradeStr, lang);
  const formatCurrency = (val) => rawFormatCurrency(val, lang);
  const formatQuantity = (qty, unit) => rawFormatQuantity(qty, unit, lang);

  return (
    <LanguageContext.Provider value={{ 
      lang, 
      setLang, 
      toggleLanguage, 
      t, 
      translateCommodity, 
      translateMandi, 
      translateGrade,
      formatCurrency,
      formatQuantity
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
