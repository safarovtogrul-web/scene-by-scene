/**
 * The single registry for every language Textory can present, learn, or use
 * for scene translations. Components should always resolve language metadata
 * from here instead of carrying their own display-name lists.
 */
export type TextDirection = "ltr" | "rtl";

export type Language = {
  /** Stable product identifier, also used in story language maps. */
  id: LanguageId;
  /** BCP 47 locale used for document and content language attributes. */
  locale: string;
  nativeName: string;
  englishName: string;
  dir: TextDirection;
  /** Lets product rollout be managed without changing consumers. */
  enabled: boolean;
  /** A compact visual marker; it is decorative, never the language identity. */
  flag: string;
  /** Proper UI copy currently exists only where explicitly supplied. */
  hasInterfaceMessages: boolean;
};

export const LANGUAGE_IDS = [
  "en", "zh", "hi", "es", "fr", "ar", "bn", "pt", "ru", "ur",
  "id", "de", "ja", "pcm", "mr", "te", "tr", "ta", "vi", "yue",
] as const;

export type LanguageId = (typeof LANGUAGE_IDS)[number];

export const LANGUAGE_REGISTRY: readonly Language[] = [
  { id: "en", locale: "en", nativeName: "English", englishName: "English", dir: "ltr", enabled: true, flag: "GB", hasInterfaceMessages: true },
  { id: "zh", locale: "zh-Hans", nativeName: "中文（普通话）", englishName: "Mandarin Chinese", dir: "ltr", enabled: true, flag: "CN", hasInterfaceMessages: false },
  { id: "hi", locale: "hi", nativeName: "हिन्दी", englishName: "Hindi", dir: "ltr", enabled: true, flag: "IN", hasInterfaceMessages: false },
  { id: "es", locale: "es", nativeName: "Español", englishName: "Spanish", dir: "ltr", enabled: true, flag: "ES", hasInterfaceMessages: false },
  { id: "fr", locale: "fr", nativeName: "Français", englishName: "French", dir: "ltr", enabled: true, flag: "FR", hasInterfaceMessages: false },
  { id: "ar", locale: "ar", nativeName: "العربية", englishName: "Arabic", dir: "rtl", enabled: true, flag: "SA", hasInterfaceMessages: false },
  { id: "bn", locale: "bn", nativeName: "বাংলা", englishName: "Bengali", dir: "ltr", enabled: true, flag: "BD", hasInterfaceMessages: false },
  { id: "pt", locale: "pt", nativeName: "Português", englishName: "Portuguese", dir: "ltr", enabled: true, flag: "BR", hasInterfaceMessages: false },
  { id: "ru", locale: "ru", nativeName: "Русский", englishName: "Russian", dir: "ltr", enabled: true, flag: "RU", hasInterfaceMessages: false },
  { id: "ur", locale: "ur", nativeName: "اردو", englishName: "Urdu", dir: "rtl", enabled: true, flag: "PK", hasInterfaceMessages: false },
  { id: "id", locale: "id", nativeName: "Bahasa Indonesia", englishName: "Indonesian", dir: "ltr", enabled: true, flag: "ID", hasInterfaceMessages: false },
  { id: "de", locale: "de", nativeName: "Deutsch", englishName: "German", dir: "ltr", enabled: true, flag: "DE", hasInterfaceMessages: false },
  { id: "ja", locale: "ja", nativeName: "日本語", englishName: "Japanese", dir: "ltr", enabled: true, flag: "JP", hasInterfaceMessages: false },
  { id: "pcm", locale: "pcm", nativeName: "Naijá", englishName: "Nigerian Pidgin", dir: "ltr", enabled: true, flag: "NG", hasInterfaceMessages: false },
  { id: "mr", locale: "mr", nativeName: "मराठी", englishName: "Marathi", dir: "ltr", enabled: true, flag: "IN", hasInterfaceMessages: false },
  { id: "te", locale: "te", nativeName: "తెలుగు", englishName: "Telugu", dir: "ltr", enabled: true, flag: "IN", hasInterfaceMessages: false },
  { id: "tr", locale: "tr", nativeName: "Türkçe", englishName: "Turkish", dir: "ltr", enabled: true, flag: "TR", hasInterfaceMessages: false },
  { id: "ta", locale: "ta", nativeName: "தமிழ்", englishName: "Tamil", dir: "ltr", enabled: true, flag: "IN", hasInterfaceMessages: false },
  { id: "vi", locale: "vi", nativeName: "Tiếng Việt", englishName: "Vietnamese", dir: "ltr", enabled: true, flag: "VN", hasInterfaceMessages: false },
  { id: "yue", locale: "yue-Hant", nativeName: "粵語", englishName: "Yue Chinese / Cantonese", dir: "ltr", enabled: true, flag: "HK", hasInterfaceMessages: false },
];

const LANGUAGE_BY_ID = new Map(LANGUAGE_REGISTRY.map((language) => [language.id, language]));

export const DEFAULT_INTERFACE_LANGUAGE: LanguageId = "en";
export const DEFAULT_LEARNING_LANGUAGE: LanguageId = "en";

/** Kept as aliases while existing onboarding presentation components migrate. */
export const LEARNING_LANGUAGES = LANGUAGE_REGISTRY;
export const SPOKEN_LANGUAGES = LANGUAGE_REGISTRY;

export function isLanguageId(value: unknown): value is LanguageId {
  return typeof value === "string" && LANGUAGE_BY_ID.has(value as LanguageId);
}

export function getLanguage(id: LanguageId | string | null | undefined): Language {
  return LANGUAGE_BY_ID.get(id as LanguageId) ?? LANGUAGE_BY_ID.get(DEFAULT_INTERFACE_LANGUAGE)!;
}

export function languageLabel(id: LanguageId | string | null | undefined): string {
  return getLanguage(id).nativeName;
}
