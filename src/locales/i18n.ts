import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './en.json';
import twTranslations from './tw.json';
import gaTranslations from './ga.json';
import eeTranslations from './ee.json';

const resources = {
  en: {
    translation: enTranslations
  },
  tw: {
    translation: twTranslations
  },
  // Other supported languages
  ga: {
    translation: gaTranslations
  },
  ee: {
    translation: eeTranslations
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    
    interpolation: {
      escapeValue: false // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'birthlink-language'
    },
    
    react: {
      useSuspense: false
    }
  });

export default i18n;