import assert from "node:assert/strict";
import { test } from "node:test";
import { BUBBLE_PRESETS, READER_MOBILE_MEDIA, packageToStory, readerHref, sceneCopy, sceneImageSources, storyDisplay, type PackageScene, type SceneLanguageText, type StoryPackage } from "../lib/story-packages/schema";
import { auditStoryParity } from "../scripts/audit-story-parity";
import { THE_LOST_MAP_OVERLAY } from "../lib/story-packages/manifests/the-lost-map-overlay";
import { worstCaseHeight } from "../lib/story-packages/manifests/the-lost-map-copy";
import { MIN_TEXT_SCALE, bubbleRect, resolveBubblePlacement } from "../lib/reader/bubbleLayout";
import { assertStoryPackages, validateStoryPackages } from "../lib/story-packages/validation";
import { storyAssetExists } from "../lib/story-packages/validate-files";
import { THE_LOST_MAP_ASSET_MANIFEST, THE_LOST_MAP_ASSET_SCENES } from "../lib/story-packages/manifests/the-lost-map-assets";
import { THE_LOST_MAP_COPY_MANIFEST, THE_LOST_MAP_REGISTRATION_BLOCKERS, THE_LOST_MAP_SCENES } from "../lib/story-packages/manifests/the-lost-map-copy";
import { THE_LOST_MAP } from "../lib/story-packages/manifests/the-lost-map";
import { STORY_PACKAGES, getStoryPackage } from "../lib/story-packages/registry";
import {
  LANGUAGE_IDS, RETIRED_LANGUAGE_IDS, enabledLanguages, getLanguage, isLanguageId,
  normalizeLanguageId, shortCodeFor, speechLocaleFor,
} from "../lib/languages";
import { MESSAGE_KEYS, formatMessage, messageFor, missingMessageKeys, validateMessageCatalogue, UI_MESSAGES, type MessageKey } from "../lib/i18n/messages";
import { EMPTY_PREFERENCES, getPreferencesSnapshot, parsePreferences, patchPreferences } from "../lib/preferences";
import { bubbleCopySize, readerPagePose } from "../lib/reader/presentation";

/** Synthetic validation input stays test-local; no fixture route or public fixture assets ship. */
const TEST_EASY_TEXT: SceneLanguageText = {
  en: "This is a test image.", es: "Esta es una imagen de prueba.",
  tr: "Bu bir test görselidir.", ar: "هذه صورة اختبار.", fa: "این یک تصویر آزمایشی است.",
};
const TEST_HARD_TEXT: SceneLanguageText = {
  en: "This image is used to check that a longer sentence remains readable at every screen size.",
  es: "Esta imagen sirve para comprobar que una frase más larga sigue siendo legible en todas las pantallas.",
  tr: "Bu görsel, daha uzun bir cümlenin her ekran boyutunda okunabilir kaldığını kontrol etmek için kullanılır.",
  ar: "تُستخدم هذه الصورة للتحقق من أن الجملة الطويلة تظل واضحة ومقروءة على جميع أحجام الشاشات.",
  fa: "این تصویر برای بررسی این است که یک جمله‌ی بلندتر در هر اندازه‌ی صفحه خوانا بماند.",
};
const TEST_READER_PACKAGE = {
  schemaVersion: 1, status: "development",
  id: "reader-fixture", slug: "reader-fixture", title: "A study in light",
  subtitle: "Test-local validation package",
  genre: "daily-life", description: "Synthetic test copy and asset paths used only by the Node validation suite.",
  cover: "/reader-fixtures/frame-01.svg", heroScene: "/reader-fixtures/frame-02.svg",
  background: { image: "/reader-fixtures/frame-02.svg", color: "#141c25", accent: "#a69a83" },
  defaultDifficulty: "easy", estimatedReadingMinutes: 1,
  availableLanguages: ["en", "es", "tr", "ar", "fa"], addedAt: "2026-09-03",
  scenes: [
    { id: "light", order: 1, image: { desktop: "/reader-fixtures/frame-01-desktop.svg", mobile: "/reader-fixtures/frame-01-mobile.svg" }, text: { easy: TEST_EASY_TEXT, hard: TEST_HARD_TEXT }, bubble: { type: "narration", preset: "bottom-left", maxWidth: 0.65, alignment: "start" }, mobileBubble: { preset: "bottom-left", maxWidth: 0.95, alignment: "start" } },
    { id: "shade", order: 2, image: { desktop: "/reader-fixtures/frame-02-desktop.svg", mobile: "/reader-fixtures/frame-02-mobile.svg" }, text: { easy: TEST_EASY_TEXT, hard: TEST_HARD_TEXT }, bubble: { type: "speech", preset: "top-right", maxWidth: 0.55, alignment: "start" }, mobileBubble: { preset: "top-right", maxWidth: 0.95, alignment: "start" } },
    { id: "detail", order: 3, image: { desktop: "/reader-fixtures/frame-03-desktop.svg", mobile: "/reader-fixtures/frame-03-mobile.svg" }, text: { easy: TEST_EASY_TEXT, hard: TEST_HARD_TEXT }, bubble: { type: "speech", preset: "center-left", maxWidth: 0.5, alignment: "start" }, mobileBubble: { x: 0, y: 0.45, maxWidth: 0.95, alignment: "start" } },
  ],
} satisfies StoryPackage;

const fixture = (): StoryPackage => structuredClone(TEST_READER_PACKAGE);
const options = { allowDevelopment: true, assetExists: (path: string) => !path.includes("missing") };
const issues = (story: StoryPackage) => validateStoryPackages([story], options).join("\n");

test("test-local development samples validate, but cannot ship as production", () => {
  assert.deepEqual(validateStoryPackages([fixture()], options), []);
  assert.match(validateStoryPackages([fixture()]).join("\n"), /development fixtures cannot ship/);
});
test("catalogue counts and languages are derived from the authored package", () => {
  const story = fixture();
  story.scenes.pop();
  assert.equal(packageToStory(story).scenes, 2);
  assert.deepEqual(packageToStory(story).availableLanguages, story.availableLanguages);
});
test("duplicate slugs and scene identities fail with an actionable path", () => {
  const story = fixture();
  assert.match(validateStoryPackages([story, story], options).join("\n"), /reader-fixture.slug: duplicate slug/);
  story.scenes[1].id = story.scenes[0].id;
  assert.match(issues(story), /scenes\[1\].id: duplicate scene id/);
});
test("missing required and nonexistent assets fail; references and traversal are rejected", () => {
  for (const key of ["cover", "heroScene"] as const) {
    const story = fixture(); story[key] = "";
    assert.match(issues(story), /missing image/);
  }
  const background = fixture(); background.background.image = "";
  assert.match(issues(background), /background.image: missing image/);
  for (const path of ["", "/reader-fixtures/missing.webp", "/design-reference/reader/reader-mobile.png", "/reader-fixtures/../secret.png"]) {
    const story = fixture(); story.scenes[0].image = path;
    assert.match(issues(story), /scenes\[0\].image:/);
  }
  assert.equal(storyAssetExists("/../package.json"), false);
});
test("orders must be one-based, unique, contiguous and already sorted", () => {
  for (const order of [0, 2, 1.5, Number.NaN]) {
    const story = fixture(); story.scenes[0].order = order;
    assert.match(issues(story), /scenes\[0\].order: expected 1/);
  }
  const story = fixture(); story.scenes.reverse();
  assert.match(issues(story), /order/);
});
test("every declared language needs both difficulties on every scene", () => {
  const story = fixture(); delete story.scenes[1].text.hard.es;
  assert.match(issues(story), /text.hard.es: declared language has no content/);
  const badCode = fixture(); Object.assign(badCode.scenes[0].text.easy, { xx: "test" });
  assert.match(issues(badCode), /invalid language code: xx/);
  const duplicate = fixture(); duplicate.availableLanguages.push("en");
  assert.match(issues(duplicate), /duplicate language/);
});
test("all presets and normalized boundary positions are accepted", () => {
  for (const preset of BUBBLE_PRESETS) {
    const story = fixture(); story.scenes[0].bubble = { preset };
    assert.equal(issues(story), "");
  }
  const story = fixture(); story.scenes[0].bubble = { x: 0, y: 1, maxWidth: 1 };
  assert.equal(issues(story), "");
});
test("invalid and non-finite bubble/focal coordinates cannot reach the reader", () => {
  for (const x of [-0.1, 1.1, Number.NaN, Infinity]) {
    const story = fixture(); story.scenes[0].bubble = { x, y: 0.5 };
    assert.match(issues(story), /finite fractions/);
  }
  const story = fixture(); story.scenes[0].mobileBubble = { x: 0.5, y: 0.5, maxWidth: 0 };
  assert.match(issues(story), /maxWidth/);
  story.scenes[0].visual = { mobileFocalPoint: { x: 2, y: 0 } };
  assert.match(issues(story), /mobileFocalPoint/);
});
test("Spanish learning / Turkish interface resolves exactly at each difficulty with shared artwork", () => {
  const scene = fixture().scenes[0];
  for (const difficulty of ["easy", "hard"] as const) {
    const copy = sceneCopy(scene, difficulty, "es", "tr");
    assert.equal(copy.primary, scene.text[difficulty].es);
    assert.equal(copy.translation, scene.text[difficulty].tr);
  }
  assert.equal(sceneCopy(scene, "easy", "fr", "en").primary, undefined);
  assert.equal(sceneCopy(scene, "easy", "es", "fr").translation, undefined);
  assert.equal(sceneCopy(scene, "easy", "es", "es").translation, undefined);
});
test("editorial translation overrides and hidden captions do not alter primary text", () => {
  const scene = fixture().scenes[0];
  scene.translation = { text: { easy: { tr: "Supporting test caption" } } };
  assert.equal(sceneCopy(scene, "easy", "es", "tr").translation, "Supporting test caption");
  scene.translation.hide = true;
  assert.equal(sceneCopy(scene, "easy", "es", "tr").translation, undefined);
  assert.equal(sceneCopy(scene, "easy", "es", "tr").primary, scene.text.easy.es);
});
test("malformed input fails clearly without a validator crash", () => {
  const errors = validateStoryPackages([null, { scenes: [null] }, { schemaVersion: 5 }]);
  assert.ok(errors.length > 5);
  assert.throws(() => assertStoryPackages([{}]), /Story package validation failed/);
});

test("every selectable interface locale resolves all UI messages and interpolation safely", () => {
  for (const language of LANGUAGE_IDS) {
    for (const key of Object.keys(UI_MESSAGES.en!) as MessageKey[]) {
      assert.ok(messageFor(language, key).trim(), `${language}.${key}`);
      assert.equal(typeof formatMessage(language, key, { language: "日本語", done: 1, total: 3 }), "string");
    }
  }
  // Every shipped language now has its own copy, so nothing falls through to
  // English. A retired language still falls back per key rather than breaking.
  assert.notEqual(messageFor("ja", "translationSameLanguage"), messageFor("en", "translationSameLanguage"));
  assert.equal(messageFor("pcm", "translationSameLanguage"), messageFor("en", "translationSameLanguage"));
});

test("fixture switching supports all demo variants and never substitutes unsupported primary text", () => {
  for (const scene of fixture().scenes) {
    for (const difficulty of ["easy", "hard"] as const) {
      for (const learning of LANGUAGE_IDS) {
        for (const translation of ["tr", "en", "ar", "fa"] as const) {
          const copy = sceneCopy(scene, difficulty, learning, translation);
          assert.equal(copy.primary, scene.text[difficulty][learning]);
          if (learning === "ja") assert.equal(copy.primary, undefined);
        }
      }
    }
  }
});

test("responsive art resolves both variants and preserves single-source fallback", () => {
  const scene = fixture().scenes[0];
  assert.deepEqual(sceneImageSources(scene.image), {
    desktop: "/reader-fixtures/frame-01-desktop.svg", mobile: "/reader-fixtures/frame-01-mobile.svg",
  });
  for (const image of ["/reader-fixtures/frame-01.svg", { desktop: "/reader-fixtures/frame-01.svg" }]) {
    assert.deepEqual(sceneImageSources(image), { desktop: "/reader-fixtures/frame-01.svg", mobile: "/reader-fixtures/frame-01.svg" });
  }
  assert.deepEqual(sceneImageSources(undefined), { desktop: "", mobile: "" });
});

test("The Lost Map canonical manifest maps all 24 wide and portrait assets without duplicates", () => {
  assert.equal(THE_LOST_MAP_ASSET_MANIFEST.sceneCount, 24);
  assert.equal(THE_LOST_MAP_ASSET_MANIFEST.imageCount, 48);
  assert.equal(THE_LOST_MAP_ASSET_SCENES.length, 24);
  assert.deepEqual(
    THE_LOST_MAP_ASSET_SCENES.map((scene) => scene.id),
    Array.from({ length: 24 }, (_, index) => `S${String(index + 1).padStart(2, "0")}`),
  );

  const wide = THE_LOST_MAP_ASSET_SCENES.map((scene) => sceneImageSources(scene.image).desktop);
  const portrait = THE_LOST_MAP_ASSET_SCENES.map((scene) => sceneImageSources(scene.image).mobile);
  assert.equal(new Set(wide).size, 24);
  assert.equal(new Set(portrait).size, 24);
  assert.equal(new Set([...wide, ...portrait]).size, 48);
  for (const index of THE_LOST_MAP_ASSET_SCENES.keys()) {
    const id = `S${String(index + 1).padStart(2, "0")}`;
    assert.equal(wide[index], `/stories/the-lost-map/wide/${id}.png`);
    assert.equal(portrait[index], `/stories/the-lost-map/portrait/${id}.png`);
    assert.equal(storyAssetExists(wide[index]), true, wide[index]);
    assert.equal(storyAssetExists(portrait[index]), true, portrait[index]);
  }
  assert.equal(READER_MOBILE_MEDIA, "(max-width: 767px) and (orientation: portrait)");
});

test("The Lost Map uses the approved wide and portrait bubble-safe presets", () => {
  for (const scene of THE_LOST_MAP_ASSET_SCENES) {
    const source = THE_LOST_MAP_ASSET_MANIFEST.scenes[scene.order - 1];
    assert.equal(scene.bubble?.preset, source.bubbleSafeWide);
    assert.equal(scene.mobileBubble?.preset, scene.id === "S24" ? "top-right" : source.bubbleSafePortrait);
  }
  assert.equal(THE_LOST_MAP_ASSET_SCENES[15].mobileBubble?.preset, "top-left");
  assert.equal(THE_LOST_MAP_ASSET_SCENES[19].mobileBubble?.preset, "top-left");
  assert.equal(THE_LOST_MAP_ASSET_SCENES[19].mobileBubble?.maxWidth, 0.42);
  assert.equal(THE_LOST_MAP_ASSET_SCENES[23].mobileBubble?.preset, "top-right");
  assert.equal(THE_LOST_MAP_ASSET_SCENES[23].mobileBubble?.maxWidth, 0.82);
});

test("The Lost Map approved Spanish copy maps exactly onto all 24 asset scenes", () => {
  assert.equal(THE_LOST_MAP_COPY_MANIFEST.primaryLanguage, "es");
  assert.equal(THE_LOST_MAP_SCENES.length, 24);
  assert.deepEqual(
    THE_LOST_MAP_SCENES.map((scene) => scene.id),
    THE_LOST_MAP_ASSET_SCENES.map((scene) => scene.id),
  );
  for (const [index, scene] of THE_LOST_MAP_SCENES.entries()) {
    const source = THE_LOST_MAP_COPY_MANIFEST.scenes[index];
    assert.equal(scene.text.easy.es, source.easy);
    assert.equal(scene.text.hard.es, source.hard);
    assert.equal(scene.bubble?.type, source.mode);
    assert.deepEqual(sceneImageSources(scene.image), sceneImageSources(THE_LOST_MAP_ASSET_SCENES[index].image));
  }
});

test("The Lost Map registers, validates, and resolves in every shipped language", () => {
  assert.deepEqual(validateStoryPackages([THE_LOST_MAP], { assetExists: storyAssetExists }), []);
  assert.equal(STORY_PACKAGES.length, 1);
  assert.equal(getStoryPackage("the-lost-map"), THE_LOST_MAP);
  assert.deepEqual([...THE_LOST_MAP.availableLanguages].sort(), [...LANGUAGE_IDS].sort());
  for (const scene of THE_LOST_MAP_SCENES) {
    for (const difficulty of ["easy", "hard"] as const) {
      for (const learning of LANGUAGE_IDS) {
        // The story sentence must exist in every language the story advertises.
        assert.ok(sceneCopy(scene, difficulty, learning, learning).primary?.trim(), `${scene.id}.${difficulty}.${learning}`);
        // A caption is suppressed only when it would repeat the sentence.
        assert.equal(sceneCopy(scene, difficulty, learning, learning).translation, undefined);
      }
      assert.ok(sceneCopy(scene, difficulty, "es", "en").translation?.trim());
      assert.ok(sceneCopy(scene, difficulty, "es", "tr").translation?.trim());
    }
  }
});

test("The Lost Map applies the approved S10 Hard wardrobe correction", () => {
  assert.equal(THE_LOST_MAP_COPY_MANIFEST.status, "production-approved");
  assert.deepEqual(THE_LOST_MAP_REGISTRATION_BLOCKERS, []);
  assert.equal(
    THE_LOST_MAP_SCENES[9].text.hard.es,
    "Con el chaleco puesto y la mochila a la espalda, Lucía sale de la casa.",
  );
});

test("validation checks desktop and mobile artwork paths independently", () => {
  for (const variant of ["desktop", "mobile"] as const) {
    const story = fixture();
    story.scenes[0].image = { desktop: "/reader-fixtures/frame-01.svg", mobile: "/reader-fixtures/frame-01-mobile.svg", [variant]: "/reader-fixtures/missing.svg" };
    assert.match(issues(story), new RegExp(`image.${variant}: file does not exist`));
  }
  const story = fixture();
  Object.assign(story.scenes[0], { image: { mobile: "/reader-fixtures/frame-01-mobile.svg" } });
  assert.match(issues(story), /image.desktop: missing image/);
});

test("speech and narration metadata validate, while unsupported types and invalid speakers fail", () => {
  for (const type of ["speech", "narration"] as const) {
    const story = fixture(); story.scenes[0].bubble = { type, preset: "top-right", speaker: "Demo voice" };
    assert.equal(issues(story), "");
  }
  const invalid = fixture();
  Object.assign(invalid.scenes[0].bubble!, { type: "thought", speaker: "" });
  assert.match(issues(invalid), /expected speech or narration/);
  assert.match(issues(invalid), /non-empty speaker/);
});

test("transitional or incomplete scene text stays unavailable without throwing", () => {
  for (const scene of [undefined, null, {} as PackageScene, { text: {} } as PackageScene]) {
    assert.deepEqual(sceneCopy(scene, "hard", "ja", "tr"), { primary: undefined, translation: undefined });
  }
  const scene = fixture().scenes[0];
  Object.assign(scene.text.easy, { es: undefined, tr: 123 });
  assert.deepEqual(sceneCopy(scene, "easy", "es", "tr"), { primary: undefined, translation: undefined });
});

test("portal reader links use the slug, preserve difficulty, and support the guarded dev portal", () => {
  assert.equal(readerHref("first-story", "hard"), "/stories/first-story/read?difficulty=hard");
  assert.equal(readerHref("reader-fixture", "easy", "/dev/reader"), "/dev/reader?difficulty=easy");
});

test("rapid preference patches compose from the current store even when browser storage is blocked", () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: { get localStorage() { throw new Error("Storage blocked"); } } });
  try {
    patchPreferences({ interfaceLanguage: "en", learningLanguage: "en", translationLanguage: "en", showTranslations: true });
    patchPreferences({ learningLanguage: "es" }, EMPTY_PREFERENCES);
    patchPreferences({ interfaceLanguage: "tr" }, EMPTY_PREFERENCES);
    patchPreferences({ translationLanguage: "ar" }, EMPTY_PREFERENCES);
    const final = patchPreferences({ showTranslations: false }, EMPTY_PREFERENCES);
    assert.deepEqual(final, { learningLanguage: "es", interfaceLanguage: "tr", translationLanguage: "ar", showTranslations: false });
    assert.deepEqual(parsePreferences(getPreferencesSnapshot()), final);
    assert.deepEqual(patchPreferences({ learningLanguage: undefined }, EMPTY_PREFERENCES), final);
    assert.equal(parsePreferences({ interfaceLanguage: "tr", learningLanguage: "es" }).translationLanguage, "tr");
  } finally {
    if (previous) Object.defineProperty(globalThis, "window", previous);
    else Reflect.deleteProperty(globalThis, "window");
  }
});

test("short multilingual dialogue stays compact while long primary or translated text can expand", () => {
  for (const [primary, translation] of [["¿Dónde está el mapa?", "Harita nerede?"], ["یہ ایک آزمائشی تصویر ہے۔", "هذه صورة اختبار."]]) {
    assert.equal(bubbleCopySize(primary, translation), "brief");
  }
  assert.equal(bubbleCopySize(TEST_HARD_TEXT.es, ""), "extended");
  assert.equal(bubbleCopySize("Short.", TEST_HARD_TEXT.tr), "extended");
});

test("page depth reverses with visual direction and remains small for distant pages", () => {
  const left = readerPagePose(-1), right = readerPagePose(1);
  assert.equal(left.yaw, -right.yaw);
  assert.equal(left.scale, right.scale);
  assert.ok(Math.abs(left.yaw) <= 20);
  assert.ok(left.scale >= 0.96);
  assert.equal(left.origin, "right center");
  assert.equal(right.origin, "left center");
  assert.ok(left.fold > 0 && right.fold > 0);
  assert.deepEqual(readerPagePose(-18), left);
  assert.deepEqual(readerPagePose(18), right);
});

test("the active page follows drag progressively and returns to its single neutral arrival", () => {
  assert.deepEqual(readerPagePose(0), { yaw: 0, scale: 1, depth: -0, origin: "right center", fold: 0, shadowX: -0 });
  const near = readerPagePose(0, 30), far = readerPagePose(0, 100);
  assert.ok(near.yaw > 0 && near.yaw < far.yaw);
  assert.ok(near.scale > far.scale && far.scale >= 0.994);
  assert.equal(readerPagePose(0, -100).yaw, -far.yaw);
  assert.deepEqual(readerPagePose(0, 10000), readerPagePose(0, 200));
});

/** The catalogue the product promises: exactly nineteen, in a fixed order. */
const REQUIRED_LANGUAGES = [
  "en", "es", "fr", "de", "pt-BR", "it", "tr", "ru", "uk", "ar",
  "fa", "zh-CN", "ja", "ko", "id", "vi", "th", "hi", "sw",
] as const;

test("the shipped catalogue is exactly the nineteen required languages, in order", () => {
  assert.deepEqual([...LANGUAGE_IDS], [...REQUIRED_LANGUAGES]);
  assert.deepEqual(enabledLanguages().map((language) => language.id), [...REQUIRED_LANGUAGES]);
  // Persian is the required second right-to-left language; Urdu is not a stand-in.
  assert.ok(LANGUAGE_IDS.includes("fa"));
  assert.equal(LANGUAGE_IDS.includes("ur" as never), false);
  assert.deepEqual(
    enabledLanguages().filter((language) => language.dir === "rtl").map((language) => language.id),
    ["ar", "fa"],
  );
});

test("retired languages keep their data but can never be selected", () => {
  for (const id of RETIRED_LANGUAGE_IDS) {
    assert.equal(isLanguageId(id), false, `${id} must not be selectable`);
    assert.equal(enabledLanguages().some((language) => (language.id as string) === id), false);
    // Metadata still resolves, so previously authored content keeps rendering.
    assert.equal(getLanguage(id).id, id);
    assert.equal(getLanguage(id).status, "retired");
  }
});

test("stored preferences migrate: renamed ids keep their language, retired ids fall back", () => {
  assert.equal(normalizeLanguageId("pt"), "pt-BR");
  assert.equal(normalizeLanguageId("pt-PT"), "pt-BR");
  assert.equal(normalizeLanguageId("zh"), "zh-CN");
  assert.equal(normalizeLanguageId("zh-Hans"), "zh-CN");
  // A retired id must never be silently re-pointed at a different living language.
  for (const id of RETIRED_LANGUAGE_IDS) assert.equal(normalizeLanguageId(id), "en");
  assert.equal(normalizeLanguageId("ur"), "en", "Urdu must not become Persian");
  assert.equal(normalizeLanguageId("not-a-language"), null);
  assert.equal(normalizeLanguageId(42), null);

  assert.equal(parsePreferences({ interfaceLanguage: "pt", learningLanguage: "zh", translationLanguage: "ur" }).interfaceLanguage, "pt-BR");
  assert.equal(parsePreferences({ interfaceLanguage: "pt", learningLanguage: "zh", translationLanguage: "ur" }).learningLanguage, "zh-CN");
  assert.equal(parsePreferences({ interfaceLanguage: "pt", learningLanguage: "zh", translationLanguage: "ur" }).translationLanguage, "en");
});

test("every selectable language carries complete, renderable metadata", () => {
  for (const id of LANGUAGE_IDS) {
    const language = getLanguage(id);
    assert.equal(language.status, "supported", id);
    assert.ok(language.nativeName.trim(), `${id} nativeName`);
    assert.ok(language.englishName.trim(), `${id} englishName`);
    assert.ok(language.locale.trim(), `${id} locale`);
    assert.ok(/^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(language.locale), `${id} locale is BCP 47: ${language.locale}`);
    // The badge sits in a fixed-width trigger, so a regional tag must still fit.
    assert.ok(shortCodeFor(id).length <= 3, `${id} short code ${shortCodeFor(id)}`);
    assert.equal(shortCodeFor(id), shortCodeFor(id).toUpperCase(), id);
  }
  // Short codes identify a language on their own, so they cannot collide.
  assert.equal(new Set(LANGUAGE_IDS.map(shortCodeFor)).size, LANGUAGE_IDS.length);
});

test("speech synthesis has a sensible locale for every learning language", () => {
  const expected: Record<string, string> = {
    en: "en-GB", es: "es-ES", fr: "fr-FR", de: "de-DE", "pt-BR": "pt-BR", it: "it-IT",
    tr: "tr-TR", ru: "ru-RU", uk: "uk-UA", ar: "ar", fa: "fa-IR", "zh-CN": "zh-CN",
    ja: "ja-JP", ko: "ko-KR", id: "id-ID", vi: "vi-VN", th: "th-TH", hi: "hi-IN", sw: "sw",
  };
  for (const id of LANGUAGE_IDS) assert.equal(speechLocaleFor(id), expected[id], id);
  // The voice locale must stay a superset of the content locale's language.
  for (const id of LANGUAGE_IDS) {
    assert.equal(speechLocaleFor(id).split("-")[0], getLanguage(id).locale.split("-")[0], id);
  }
});

test("the message catalogue reports its own gaps instead of hiding them", () => {
  // English is the key set, so it can never be the thing that is missing.
  assert.deepEqual(missingMessageKeys("en"), []);
  assert.ok(MESSAGE_KEYS.length > 0);
  // Placeholders must agree with English wherever a language has translated a key.
  const placeholderProblems = validateMessageCatalogue().filter((issue) => issue.problem !== "missing translation");
  assert.deepEqual(placeholderProblems, []);
});

test("every shipped language translates every message key, with English's placeholders", () => {
  // The whole point of the catalogue check: a required language with a gap is a
  // release blocker, not something a reader discovers as English mid-sentence.
  assert.deepEqual(validateMessageCatalogue(), []);
  for (const id of LANGUAGE_IDS) {
    assert.deepEqual(missingMessageKeys(id), [], `${id} must translate every key`);
  }
  // Retired languages are data, not shipped copy, so they are exempt by design.
  assert.ok(missingMessageKeys("pcm").length > 0);
});

test("the product name is never translated away", () => {
  const en = UI_MESSAGES.en as Record<MessageKey, string>;
  // Split headlines carry the brand across two keys, so they are checked joined.
  const pairs: Array<[MessageKey, MessageKey]> = [["onbUseQuestion", "onbUseEmphasis"]];
  for (const id of LANGUAGE_IDS) {
    for (const [head, tail] of pairs) {
      assert.ok(
        `${messageFor(id, head)} ${messageFor(id, tail)}`.includes("Scene by Scene"),
        `${id} onboarding headline must keep the product name`,
      );
    }
    for (const key of MESSAGE_KEYS) {
      if (pairs.some(([a, b]) => key === a || key === b)) continue;
      // `ja.noPasswordNeeded` conveys the sentence without naming the product;
      // it is reviewed copy that predates this catalogue and is left as written.
      if (id === "ja" && key === "noPasswordNeeded") continue;
      if (!en[key].includes("Scene by Scene")) continue;
      assert.ok(messageFor(id, key).includes("Scene by Scene"), `${id}.${key}`);
    }
  }
});

test("The Lost Map ships exactly 912 sentence variants with no empty required text", () => {
  const scenes = THE_LOST_MAP_SCENES;
  assert.equal(scenes.length, 24);
  assert.equal(LANGUAGE_IDS.length, 19);

  let variants = 0;
  for (const scene of scenes) {
    assert.ok(scene.semanticCore?.trim(), `${scene.id} needs a semantic core`);
    for (const difficulty of ["easy", "hard"] as const) {
      for (const language of LANGUAGE_IDS) {
        const text = scene.text[difficulty][language];
        assert.equal(typeof text, "string", `${scene.id}.${difficulty}.${language}`);
        assert.ok(text!.trim(), `${scene.id}.${difficulty}.${language} must not be empty`);
        variants += 1;
      }
    }
  }
  assert.equal(variants, 24 * 2 * 19);
  assert.equal(variants, 912);
});

test("The Lost Map keeps the approved Spanish as its source of truth", () => {
  // Every other language is written against these lines, so a drift here means
  // the manifests disagree about what happens in the scene.
  for (const [index, scene] of THE_LOST_MAP_SCENES.entries()) {
    const approved = THE_LOST_MAP_COPY_MANIFEST.scenes[index];
    assert.equal(scene.text.easy.es, approved.easy, `${scene.id} easy Spanish`);
    assert.equal(scene.text.hard.es, approved.hard, `${scene.id} hard Spanish`);
    assert.equal(scene.bubble?.type, approved.mode, `${scene.id} mode`);
  }
});

test("every language tells the same event: names, question form, props and Easy/Hard parity", () => {
  // The audit is the reviewable form of this check; the test makes it blocking.
  assert.deepEqual(auditStoryParity(), []);
});

test("story metadata follows the interface language and never the story languages", () => {
  for (const language of LANGUAGE_IDS) {
    const display = storyDisplay(THE_LOST_MAP, language);
    assert.ok(display.title.trim(), `${language} title`);
    assert.ok(display.subtitle?.trim(), `${language} subtitle`);
    assert.ok(display.description.trim(), `${language} description`);
  }
  // Identifiers never move with language.
  assert.equal(THE_LOST_MAP.slug, "the-lost-map");
  assert.equal(THE_LOST_MAP.id, "the-lost-map");
  assert.equal(THE_LOST_MAP.title, "The Lost Map");
  // Localised titles are real translations, not the English string repeated.
  assert.equal(storyDisplay(THE_LOST_MAP, "es").title, "El mapa perdido");
  assert.equal(storyDisplay(THE_LOST_MAP, "tr").title, "Kayıp Harita");
  assert.notEqual(storyDisplay(THE_LOST_MAP, "ja").title, THE_LOST_MAP.title);
  // An unlocalised language falls back to the canonical English rather than blank.
  assert.equal(storyDisplay({ ...THE_LOST_MAP, localized: {} }, "th").title, "The Lost Map");
});

test("no bubble covers a face, an active hand, or a scene's own critical prop", () => {
  // The audit is what found these regions; this is what keeps them protected
  // when copy, a language, or a placement changes later.
  const failures: string[] = [];
  for (const scene of THE_LOST_MAP_SCENES) {
    const overlay = THE_LOST_MAP_OVERLAY[scene.id];
    assert.ok(overlay, `${scene.id} needs an audited overlay`);
    for (const orientation of ["wide", "portrait"] as const) {
      // Assert the placement the reader actually renders, not the authored
      // starting point: the resolver is allowed to move or shrink to get clear.
      const resolved = resolveBubblePlacement(overlay[orientation], undefined, worstCaseHeight(scene.id, orientation));
      for (const region of resolved.blocked ?? []) {
        failures.push(`${scene.id} ${orientation}: bubble covers ${region.role} (${region.note})`);
      }
    }
  }
  assert.deepEqual(failures, []);
});

test("every scene declares what its artwork protects, and stays inside the frame", () => {
  for (const scene of THE_LOST_MAP_SCENES) {
    const overlay = THE_LOST_MAP_OVERLAY[scene.id];
    for (const orientation of ["wide", "portrait"] as const) {
      const layout = overlay[orientation];
      assert.ok(layout.avoid.length > 0, `${scene.id} ${orientation} declares no protected region`);
      assert.ok(layout.preferred.length > 0, `${scene.id} ${orientation} declares no safe region`);
      for (const region of [...layout.avoid, ...layout.preferred]) {
        for (const [name, value] of Object.entries({ x: region.x, y: region.y, width: region.width, height: region.height })) {
          assert.ok(Number.isFinite(value) && value >= 0 && value <= 1, `${scene.id} ${orientation} ${name} must be a normalized fraction`);
        }
        assert.ok(region.x + region.width <= 1.001, `${scene.id} ${orientation} region overflows horizontally`);
        assert.ok(region.y + region.height <= 1.001, `${scene.id} ${orientation} region overflows vertically`);
      }
      // The bubble itself must sit inside the frame at its worst-case height.
      const rect = bubbleRect(layout, worstCaseHeight(scene.id, orientation));
      assert.ok(rect.x >= -0.001 && rect.x + rect.width <= 1.001, `${scene.id} ${orientation} bubble leaves the frame`);
      assert.ok(rect.y >= -0.001 && rect.y + rect.height <= 1.001, `${scene.id} ${orientation} bubble leaves the frame`);
      // Text may shrink to clear a face, but never below the readable floor.
      if (layout.minTextScale !== undefined) assert.ok(layout.minTextScale >= MIN_TEXT_SCALE);
    }
  }
});

test("text may shrink to clear a face, but never below the readable floor", () => {
  let shrunk = 0;
  for (const scene of THE_LOST_MAP_SCENES) {
    for (const orientation of ["wide", "portrait"] as const) {
      const resolved = resolveBubblePlacement(THE_LOST_MAP_OVERLAY[scene.id][orientation], undefined, worstCaseHeight(scene.id, orientation));
      if (resolved.textScale === undefined) continue;
      shrunk += 1;
      assert.ok(resolved.textScale >= MIN_TEXT_SCALE, `${scene.id} ${orientation} text below the readable floor`);
      assert.ok(resolved.textScale <= 1, `${scene.id} ${orientation} must not enlarge text`);
    }
  }
  // Some scene must be exercising the mechanism, or it is dead code.
  assert.ok(shrunk > 0, "no scene uses the text-scale allowance");
});
