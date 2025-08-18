import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { useLanguageStore } from "@/features/language";

// Translation resources
import en from "@/shared/lib/locales/en.json";
import ru from "@/shared/lib/locales/ru.json";
import { useEffect } from "react";

const resources = {
  en: { translation: en },
  ru: { translation: ru },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // default language
  fallbackLng: "en",

  interpolation: {
    escapeValue: false, // react already escapes values
  },

  // Use language store to determine current language
  detection: {
    order: ["localStorage"],
    caches: ["localStorage"],
  },
});

// Subscribe to language store changes
useLanguageStore.subscribe((state) => {
  const languageCode = state.language.code;
  // Fallback to English for unsupported languages
  const supportedLanguage = languageCode === "ru" ? "ru" : "en";
  if (i18n.language !== supportedLanguage) {
    i18n.changeLanguage(supportedLanguage);
  }
});

export function useLanguageSync() {
  const language = useLanguageStore.use.language();

  useEffect(() => {
    const languageCode = language.code;
    // Fallback to English for unsupported languages
    const supportedLanguage = languageCode === "ru" ? "ru" : "en";

    if (i18n.language !== supportedLanguage) {
      i18n.changeLanguage(supportedLanguage);
    }
  }, [language.code]);
}

export default i18n;
