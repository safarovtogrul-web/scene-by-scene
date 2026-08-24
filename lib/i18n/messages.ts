import type { LanguageId } from "@/lib/languages";

/**
 * UI message catalogue. English is the only verified copy set today; every
 * other supported interface language deliberately falls back here until a
 * reviewed translation is added. This keeps product copy trustworthy without
 * coupling language selection to the content-language system.
 */
const EN_MESSAGES = {
  interfaceLanguage: "Interface language",
  learningLanguage: "Learning language",
  translation: "Translation",
  showTranslation: "Show translation",
  hideTranslation: "Hide translation",
  easy: "Easy",
  hard: "Hard",
  languageSettings: "Language settings",
  chooseLanguage: "Choose a language",
  languageNotAvailable: "This story is not currently available in {language}.",
  contentComingSoon: "Story content is coming soon.",
  uiTranslationPending: "Reviewed interface copy is coming soon; English is shown for now.",
  all: "All",
  allStories: "All stories",
  scenes: "scenes",
  story: "story",
  stories: "stories",
  saveForLater: "Save for later",
  storyStructure: "Story structure",
  changeLanguages: "Change languages",
  continue: "Continue",
  startTextory: "Start Textory",
  youAreAllSet: "You're all set.",
} as const;

export type MessageKey = keyof typeof EN_MESSAGES;
export type Messages = Record<MessageKey, string>;

export const UI_MESSAGES: Partial<Record<LanguageId, Messages>> = { en: EN_MESSAGES };

export function messageFor(language: LanguageId, key: MessageKey): string {
  return (UI_MESSAGES[language] ?? EN_MESSAGES)[key];
}

export function formatMessage(
  language: LanguageId,
  key: MessageKey,
  values: Record<string, string | number> = {},
): string {
  return messageFor(language, key).replace(/\{(\w+)\}/g, (_match, name: string) =>
    String(values[name] ?? `{${name}}`),
  );
}
