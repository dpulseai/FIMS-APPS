import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import mr from './locales/mr.json';

console.log('[i18n] Module loaded - SDK 52 compatible mode');

const LANGUAGE_KEY = '@fims:language';

// Initialize SYNCHRONOUSLY - critical for SDK 52/RN 0.76
i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      en: { translation: en },
      mr: { translation: mr },
    },
    lng: 'en', // Default language, will be updated later
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Critical: prevent React suspense issues
    },
  });

console.log('[i18n] Synchronous initialization complete');

// Load saved language preference AFTER app starts (called from App.tsx)
export const loadSavedLanguage = async () => {
  try {
    console.log('[i18n] Loading saved language preference...');
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    
    if (savedLanguage && savedLanguage !== i18n.language) {
      await i18n.changeLanguage(savedLanguage);
      console.log('[i18n] Language changed to:', savedLanguage);
    } else {
      console.log('[i18n] Using default language: en');
    }
  } catch (error) {
    console.warn('[i18n] Could not load saved language (non-fatal):', error);
  }
};

// Save language preference
export const saveLanguage = async (lng: string) => {
  try {
    await i18n.changeLanguage(lng);
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem(LANGUAGE_KEY, lng);
    console.log('[i18n] Language saved:', lng);
  } catch (error) {
    console.warn('[i18n] Could not save language:', error);
  }
};

export default i18n;
