/**
 * The single registry for every language Scene by Scene can present, learn, or use
 * for scene translations. Components should always resolve language metadata
 * from here instead of carrying their own display-name lists.
 *
 * One catalogue serves all three independent language concepts — interface,
 * learning and translation — plus writing direction and speech-synthesis
 * locales, so the three can never drift apart.
 */
export type TextDirection = "ltr" | "rtl";

/**
 * The shipped catalogue. Every language picker — interface, learning and
 * translation — offers exactly these, in this order.
 */
export const LANGUAGE_IDS = [
  "en", "es", "fr", "de", "pt-BR", "it", "tr", "ru", "uk", "ar",
  "fa", "zh-CN", "ja", "ko", "id", "vi", "th", "hi", "sw",
] as const;

export type LanguageId = (typeof LANGUAGE_IDS)[number];

/**
 * Ids that shipped before the catalogue was finalised.
 *
 * They are no longer selectable anywhere, but their metadata and their
 * translated interface copy are deliberately kept: authored content and saved
 * reader preferences that reference them still resolve to a real language
 * instead of throwing, and nothing already written is thrown away. A saved
 * preference pointing at one is migrated on read — see `normalizeLanguageId`.
 */
export const RETIRED_LANGUAGE_IDS = ["bn", "ur", "pcm", "mr", "te", "ta", "yue"] as const;

export type RetiredLanguageId = (typeof RETIRED_LANGUAGE_IDS)[number];

/** Anything that may still appear in stored preferences or authored content. */
export type CatalogueLanguageId = LanguageId | RetiredLanguageId;

type LanguageEntry<Id extends CatalogueLanguageId> = {
  /** Stable product identifier, also used in story language maps. */
  id: Id;
  /** BCP 47 locale used for document and content language attributes. */
  locale: string;
  /**
   * BCP 47 locale preferred when choosing a speech-synthesis voice. It is kept
   * apart from `locale` because the best available voice is often a regional
   * one (`en-GB`) for a language whose content tag is plain (`en`).
   */
  speechLocale: string;
  /** Compact uppercase badge for tight triggers; never more than three characters. */
  shortCode: string;
  nativeName: string;
  englishName: string;
  dir: TextDirection;
  /** `retired` languages keep their data but are never offered in a picker. */
  status: "supported" | "retired";
  /** A compact visual marker; it is decorative, never the language identity. */
  flag: string;
  /** Proper UI copy currently exists only where explicitly supplied. */
  hasInterfaceMessages: boolean;
};

/**
 * A selectable language. Its `id` is narrowed to the shipped catalogue, so a
 * retired id can never reach a picker, a story text map or a preference by
 * simply travelling through `Language`.
 */
export type Language = LanguageEntry<LanguageId> & { status: "supported" };
export type RetiredLanguage = LanguageEntry<RetiredLanguageId> & { status: "retired" };
export type CatalogueLanguage = Language | RetiredLanguage;

const supported = (
  id: LanguageId, locale: string, speechLocale: string, shortCode: string,
  nativeName: string, englishName: string, flag: string,
  dir: TextDirection = "ltr", hasInterfaceMessages = true,
): Language => ({ id, locale, speechLocale, shortCode, nativeName, englishName, dir, status: "supported", flag, hasInterfaceMessages });

const retired = (
  id: RetiredLanguageId, locale: string, speechLocale: string, shortCode: string,
  nativeName: string, englishName: string, flag: string, dir: TextDirection = "ltr",
): RetiredLanguage => ({ id, locale, speechLocale, shortCode, nativeName, englishName, dir, status: "retired", flag, hasInterfaceMessages: true });

export const LANGUAGE_REGISTRY: readonly CatalogueLanguage[] = [
  supported("en", "en", "en-GB", "EN", "English", "English", "GB"),
  supported("es", "es", "es-ES", "ES", "Español", "Spanish", "ES"),
  supported("fr", "fr", "fr-FR", "FR", "Français", "French", "FR"),
  supported("de", "de", "de-DE", "DE", "Deutsch", "German", "DE"),
  supported("pt-BR", "pt-BR", "pt-BR", "PT", "Português (Brasil)", "Portuguese (Brazil)", "BR"),
  supported("it", "it", "it-IT", "IT", "Italiano", "Italian", "IT"),
  supported("tr", "tr", "tr-TR", "TR", "Türkçe", "Turkish", "TR"),
  supported("ru", "ru", "ru-RU", "RU", "Русский", "Russian", "RU"),
  supported("uk", "uk", "uk-UA", "UK", "Українська", "Ukrainian", "UA"),
  supported("ar", "ar", "ar", "AR", "العربية", "Arabic", "SA", "rtl"),
  supported("fa", "fa", "fa-IR", "FA", "فارسی", "Persian", "IR", "rtl"),
  supported("zh-CN", "zh-CN", "zh-CN", "ZH", "简体中文", "Chinese (Simplified)", "CN"),
  supported("ja", "ja", "ja-JP", "JA", "日本語", "Japanese", "JP"),
  supported("ko", "ko", "ko-KR", "KO", "한국어", "Korean", "KR"),
  supported("id", "id", "id-ID", "ID", "Bahasa Indonesia", "Indonesian", "ID"),
  supported("vi", "vi", "vi-VN", "VI", "Tiếng Việt", "Vietnamese", "VN"),
  supported("th", "th", "th-TH", "TH", "ไทย", "Thai", "TH"),
  supported("hi", "hi", "hi-IN", "HI", "हिन्दी", "Hindi", "IN"),
  supported("sw", "sw", "sw", "SW", "Kiswahili", "Swahili", "KE"),

  // Retired — kept for saved preferences and previously authored content only.
  retired("bn", "bn", "bn-IN", "BN", "বাংলা", "Bengali", "BD"),
  retired("ur", "ur", "ur-PK", "UR", "اردو", "Urdu", "PK", "rtl"),
  retired("pcm", "pcm", "en-NG", "PCM", "Naijá", "Nigerian Pidgin", "NG"),
  retired("mr", "mr", "mr-IN", "MR", "मराठी", "Marathi", "IN"),
  retired("te", "te", "te-IN", "TE", "తెలుగు", "Telugu", "IN"),
  retired("ta", "ta", "ta-IN", "TA", "தமிழ்", "Tamil", "IN"),
  retired("yue", "yue-Hant", "zh-HK", "YUE", "粵語", "Yue Chinese / Cantonese", "HK"),
];

function isSupported(language: CatalogueLanguage): language is Language {
  return language.status === "supported";
}

const LANGUAGE_BY_ID = new Map(LANGUAGE_REGISTRY.map((language) => [language.id, language]));
const SUPPORTED_IDS = new Set<string>(LANGUAGE_IDS);
const RETIRED_IDS = new Set<string>(RETIRED_LANGUAGE_IDS);

/**
 * Earlier spellings of ids that are still supported under a more precise tag.
 * They are renamed rather than retired, so a reader who chose Portuguese or
 * Chinese keeps the language they picked.
 */
const LANGUAGE_ALIASES: Readonly<Record<string, LanguageId>> = {
  pt: "pt-BR", "pt-pt": "pt-BR", "pt-br": "pt-BR",
  zh: "zh-CN", "zh-hans": "zh-CN", "zh-cn": "zh-CN",
};

export const DEFAULT_INTERFACE_LANGUAGE: LanguageId = "en";
export const DEFAULT_LEARNING_LANGUAGE: LanguageId = "en";
/**
 * The translation bubble is its own choice, independent of the interface and of
 * the story. Readers who saved preferences before it existed inherit the
 * language their captions were already rendered in — see `parsePreferences`.
 */
export const DEFAULT_TRANSLATION_LANGUAGE: LanguageId = "en";

/** Kept as aliases while existing onboarding presentation components migrate. */
export const LEARNING_LANGUAGES: readonly Language[] = LANGUAGE_REGISTRY.filter(isSupported);
export const SPOKEN_LANGUAGES = LEARNING_LANGUAGES;

/** True only for the shipped, selectable catalogue. */
export function isLanguageId(value: unknown): value is LanguageId {
  return typeof value === "string" && SUPPORTED_IDS.has(value);
}

/** True for a retired id that still resolves to real metadata and copy. */
export function isRetiredLanguageId(value: unknown): value is RetiredLanguageId {
  return typeof value === "string" && RETIRED_IDS.has(value);
}

/**
 * Resolves anything that could have been stored to a currently selectable
 * language, or `null` when it is not a language at all.
 *
 * Renamed ids keep their language; retired ids fall back to the default rather
 * than to a neighbouring language, because guessing a replacement would put
 * words in a reader's mouth that they never chose.
 */
export function normalizeLanguageId(value: unknown): LanguageId | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (SUPPORTED_IDS.has(trimmed)) return trimmed as LanguageId;
  const alias = LANGUAGE_ALIASES[trimmed.toLowerCase()];
  if (alias) return alias;
  if (RETIRED_IDS.has(trimmed)) return DEFAULT_INTERFACE_LANGUAGE;
  return null;
}

export function getLanguage(id: CatalogueLanguageId | string | null | undefined): CatalogueLanguage {
  if (typeof id === "string") {
    const direct = LANGUAGE_BY_ID.get(id as CatalogueLanguageId);
    if (direct) return direct;
    const alias = LANGUAGE_ALIASES[id.trim().toLowerCase()];
    if (alias) return LANGUAGE_BY_ID.get(alias)!;
  }
  return LANGUAGE_BY_ID.get(DEFAULT_INTERFACE_LANGUAGE)!;
}

export function languageLabel(id: CatalogueLanguageId | string | null | undefined): string {
  return getLanguage(id).nativeName;
}

/** Every language currently exposed to readers, in registry order. */
export function enabledLanguages(): Language[] {
  return LANGUAGE_REGISTRY.filter(isSupported);
}

/**
 * The compact badge used in header triggers — always uppercase, never longer
 * than three characters, so a regional tag like `pt-BR` still fits.
 */
export function shortCodeFor(id: CatalogueLanguageId | string | null | undefined): string {
  return getLanguage(id).shortCode;
}

/** The locale a speech-synthesis voice should be chosen for. */
export function speechLocaleFor(id: CatalogueLanguageId | string | null | undefined): string {
  return getLanguage(id).speechLocale;
}

/**
 * Search lives here rather than in the picker so every surface matches on the
 * same three things: English name, native name, and language code.
 */
export function languageMatches(language: CatalogueLanguage, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return (
    language.id.toLowerCase().startsWith(needle) ||
    language.locale.toLowerCase().startsWith(needle) ||
    language.englishName.toLowerCase().includes(needle) ||
    language.nativeName.toLowerCase().includes(needle)
  );
}

/**
 * Lower is better. A typed code beats a name that merely contains the letters,
 * so "es" leads with Español rather than with Chinese, Portuguese and the rest
 * of the languages whose English names happen to contain those two letters.
 */
function matchRank(language: CatalogueLanguage, needle: string): number {
  if (language.id.toLowerCase() === needle || language.locale.toLowerCase() === needle) return 0;
  if (language.id.toLowerCase().startsWith(needle) || language.locale.toLowerCase().startsWith(needle)) return 1;
  if (
    language.nativeName.toLowerCase().startsWith(needle) ||
    language.englishName.toLowerCase().startsWith(needle)
  ) {
    return 2;
  }
  return 3;
}

export function searchLanguages(query: string, languages: readonly Language[] = enabledLanguages()): Language[] {
  const matches = languages.filter((language) => languageMatches(language, query));
  const needle = query.trim().toLowerCase();
  if (!needle) return matches;

  return matches
    .map((language, index) => ({ language, index, rank: matchRank(language, needle) }))
    // Registry order is the tie-breaker, so equally good matches never shuffle.
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map((entry) => entry.language);
}
