export interface LanguageOption {
  name: string;
  code: string;
}

export const availableLanguages: LanguageOption[] = [
  { name: "English", code: "en" },
  { name: "Japanese", code: "ja" },
  { name: "Chinese", code: "zh" },
  { name: "German", code: "de" },
  { name: "Hindi", code: "hi" },
  { name: "French", code: "fr" },
  { name: "Korean", code: "ko" },
  { name: "Portuguese", code: "pt" },
  { name: "Italian", code: "it" },
  { name: "Spanish", code: "es" },
  { name: "Indonesian", code: "id" },
  { name: "Dutch", code: "nl" },
  { name: "Turkish", code: "tr" },
  { name: "Filipino", code: "fil" },
  { name: "Polish", code: "pl" },
  { name: "Swedish", code: "sv" },
  { name: "Bulgarian", code: "bg" },
  { name: "Romanian", code: "ro" },
  { name: "Arabic", code: "ar" },
  { name: "Czech", code: "cs" },
  { name: "Greek", code: "el" },
  { name: "Finnish", code: "fi" },
  { name: "Croatian", code: "hr" },
  { name: "Malay", code: "ms" },
  { name: "Slovak", code: "sk" },
  { name: "Danish", code: "da" },
  { name: "Tamil", code: "ta" },
  { name: "Ukrainian", code: "uk" },
  { name: "Russian", code: "ru" },
  { name: "Hungarian", code: "hu" },
  { name: "Norwegian", code: "no" },
  { name: "Vietnamese", code: "vi" },
];

export const defaultLanguage = availableLanguages[0].code;
