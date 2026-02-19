export type Language = "en" | "hi" | "mr";

export const LANGUAGES: { code: Language; name: string }[] = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "mr", name: "Marathi" },
];

const LANGUAGE_STORAGE_KEY = "selected_language";
const DEFAULT_LANGUAGE: Language = "en";

export const getStoredLanguage = (): Language => {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored && ["en", "hi", "mr"].includes(stored)) {
    return stored as Language;
  }
  return DEFAULT_LANGUAGE;
};

export const setStoredLanguage = (language: Language): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
};
