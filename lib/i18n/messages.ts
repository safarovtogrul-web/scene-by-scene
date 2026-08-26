import type { LanguageId } from "@/lib/languages";
import { TRANSLATIONS } from "./translations";
import { PAGE_TRANSLATIONS } from "./pageTranslations";

/**
 * UI message catalogue.
 *
 * English defines the key set; every other language supplies the same keys.
 * Lookup falls back per key rather than per language, so a partially
 * translated language still shows its own copy everywhere it has it instead of
 * dropping the whole locale back to English.
 *
 * These are product-UI strings only. Story text and scene translations are a
 * separate system and are never sourced from here.
 */
const EN_MESSAGES = {
  interfaceLanguage: "Interface language",
  learningLanguage: "Learning language",
  /** Short forms for tabs and other tight controls. */
  interfaceShort: "Interface",
  learningShort: "Learning",
  languageSettings: "Language settings",
  chooseLanguage: "Choose a language",
  searchLanguages: "Search languages",
  noLanguageFound: "No language found",
  subtitles: "Subtitles",
  subtitlesShown: "Shown in your language",
  subtitlesHidden: "Hidden",
  easy: "Easy",
  hard: "Hard",
  storyLevel: "Story level",
  languageNotAvailable: "This story is not currently available in {language}.",
  contentComingSoon: "Story content is coming soon.",
  saving: "Saving…",
  close: "Close",
  back: "Back",
  uiTranslationPending: "Reviewed interface copy is coming soon; English is shown for now.",

  /* --- Navigation and account --- */
  navStories: "Stories",
  navCategories: "Categories",
  navHowItWorks: "How it works",
  navPricing: "Pricing",
  signIn: "Sign in",
  getStarted: "Get Started",
  signOut: "Sign out",
  signingOut: "Signing out…",
  accountMenu: "Account menu",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  menu: "Menu",

  /* --- Hero --- */
  /**
   * The descriptive line under the brand name. The name itself is a proper
   * noun and lives in `lib/brand.ts`, untranslated.
   */
  tagline: "Learn languages, scene by scene.",
  heroSubtitle:
    "Real actions. Real scenes. A natural way to understand and remember new languages.",
  startJourney: "Start your journey",
  seeHowItWorks: "See how it works",

  /* --- Explore --- */
  exploreStories: "Explore stories",
  exploreIntro:
    "{count} illustrated stories across genres and levels. Pick a world worth spending time in.",
  browseAllStories: "Browse all stories",

  /* --- Method --- */
  howEyebrow: "How Scene by Scene works",
  howTitleOne: "You don't study the sentence.",
  howTitleTwo: "You watch it happen.",
  stepSeeTitle: "See the action",
  stepSeeBody: "Every scene makes the meaning visible.",
  stepReadTitle: "Understand the sentence",
  stepReadBody: "Read one short sentence, with a subtitle when you need it.",
  stepRememberTitle: "Remember through the story",
  stepRememberBody: "The next moment gives the language something to attach to.",

  /* --- Shelves --- */
  continueLearning: "Continue Learning",

  /* --- Footer --- */
  footerTagline: "Language learning, told through stories.",
  footerExplore: "Explore",
  allStories: "All stories",
  newStories: "New stories",
  shortStories: "Short stories",

  /* --- Genres --- */
  genreMystery: "Mystery",
  genreAdventure: "Adventure",
  genreDailyLife: "Daily Life",
  genreRomance: "Romance",
  genreFantasy: "Fantasy",
  genreComedy: "Comedy",
  genreCrime: "Crime",
  taglineMystery: "Something does not add up.",
  taglineAdventure: "Far from anywhere safe.",
  taglineDailyLife: "The language you actually use.",
  taglineRomance: "Small moments, said out loud.",
  taglineFantasy: "Worlds that never existed.",
  taglineComedy: "It gets worse, politely.",
  taglineCrime: "Someone is lying.",

  /* --- Catalogue and filters --- */
  all: "All",
  searchStories: "Search stories, genres or level",
  filterGenre: "Genre",
  filterLength: "Length",
  filterSort: "Sort",
  allGenres: "All genres",
  anyLength: "Any length",
  lengthShort: "Under 5 min",
  lengthMedium: "5 – 10 min",
  lengthLong: "Over 10 min",
  sortRecommended: "Recommended",
  sortNewest: "Newest",
  sortShortest: "Shortest first",
  clearFilters: "Clear filters",
  storyCount: "{count} stories",
  storyCountOne: "{count} story",
  noStoriesFound: "No stories match those filters.",

  /* --- Story detail --- */
  backToStories: "All stories",
  scenesCount: "{count} scenes",
  minutesCount: "~{count} min",
  premium: "Premium",
  sceneProgress: "Scene {done} of {total}",
  youWillLearn: "You'll learn",
  vocabularyNote:
    "Each expression appears inside a scene that shows what it means — no lists to memorise.",
  storyStructure: "Story structure",
  storyStructureNote: "One clear action and one short sentence in each scene",
  sceneProgressLabel: "Scene progress",
  moreLikeThis: "More like this",
  storyOptions: "Story options",
  storyScenes: "Story scenes",

  /* --- Shelves and menus --- */
  seeAll: "See all",
  scrollLeft: "Scroll left",
  scrollRight: "Scroll right",
  byLevel: "By level",
  byGenre: "By genre",
  easyHint: "A gentler story version",
  hardHint: "A fuller story version",
  browseWholeLibrary: "Browse the whole library",
  noStoriesTitle: "No stories match that yet.",
  noStoriesBody:
    "The library is still growing. Try another level, or clear the filters to see everything.",
  sceneOf: "Scene {done} of {total}",

  /* --- Catalogue page --- */
  storiesLeadOne: "Discover a world.",
  storiesLeadTwo: "Learn a language.",
  storiesMeta: "{count} stories · Easy and Hard · new scenes every week",

  /* --- Pricing page --- */
  pricingTitle: "Still being",
  pricingEmphasis: "written.",
  pricingBody:
    "We're finishing the first set of stories before we decide what Scene by Scene costs. Until then, everything in the library is open.",
  browseLibrary: "Browse the library",

  /* --- Web and mobile section --- */
  showcaseEyebrow: "Web and mobile",
  showcaseTitle: "Stories that follow you",
  showcaseBody:
    "Read in the browser or add Scene by Scene to your home screen. The same stories are ready wherever you continue.",
  showcaseInstall: "Installable from your browser",
  showcaseProgress: "Your place stays with you",

  /* --- Onboarding --- */
  onbLearnQuestion: "Which language\ndo you want to",
  onbLearnEmphasis: "learn?",
  onbLearnHint: "You can change this later.",
  onbUseQuestion: "Which language should\nScene by Scene",
  onbUseEmphasis: "use?",
  onbUseHint: "This is the language of the interface and the subtitles.",
  continueLabel: "Continue",
  startApp: "Start Scene by Scene",
  allSet: "You're all set.",
  setupSummary: "Learning {learning}, with Scene by Scene and subtitles in {interface}.",
  libraryNext: "Your story library is coming next.",
  backToApp: "Back to Scene by Scene",
  changeLanguages: "Change my languages",
  goBack: "Go back",
  stepOf: "Step {step} of {total}",

  /* --- Page metadata (browser tab titles) --- */
  metaLanguageSetup: "Language setup",

  /* --- Sign in --- */
  welcomeTitle: "Welcome to Scene by Scene",
  welcomeBody: "Continue your stories and learning progress across devices.",
  continueWithProvider: "Continue with {provider}",
  orLabel: "or",
  browseFirst: "Browse the library first",
  noPasswordNeeded: "No password needed — Scene by Scene uses an account you already have.",
  signInUnavailable: "Sign-in isn't connected yet.",
  signInUnavailableHint:
    "Add your Supabase project keys to .env.local and enable the providers to switch this on.",
  errSignInCancelled: "That sign-in was cancelled before it finished.",
  errSignInIncomplete: "The sign-in link was incomplete. Please try again.",
  errSignInFailed: "We couldn't finish that sign-in. Please try again.",
} as const;

export type MessageKey = keyof typeof EN_MESSAGES;
export type Messages = Record<MessageKey, string>;

/**
 * The catalogue is split across two files purely for review — the shell copy
 * and the page copy get merged per language here, so a language present in one
 * file and not the other still ends up with everything it has.
 */
function mergeCatalogues(
  ...catalogues: Array<Partial<Record<LanguageId, Partial<Messages>>>>
): Partial<Record<LanguageId, Partial<Messages>>> {
  const merged: Partial<Record<LanguageId, Partial<Messages>>> = {};
  for (const catalogue of catalogues) {
    for (const [language, entries] of Object.entries(catalogue)) {
      merged[language as LanguageId] = {
        ...merged[language as LanguageId],
        ...entries,
      };
    }
  }
  return merged;
}

export const UI_MESSAGES: Partial<Record<LanguageId, Partial<Messages>>> = {
  ...mergeCatalogues(TRANSLATIONS, PAGE_TRANSLATIONS),
  en: EN_MESSAGES,
};

export function messageFor(language: LanguageId, key: MessageKey): string {
  return UI_MESSAGES[language]?.[key] ?? EN_MESSAGES[key];
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
