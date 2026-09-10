import assert from "node:assert/strict";
import { test } from "node:test";
import { BUBBLE_PRESETS, READER_MOBILE_MEDIA, packageToStory, readerHref, sceneCopy, sceneImageSources, type PackageScene, type SceneLanguageText, type StoryPackage } from "../lib/story-packages/schema";
import { assertStoryPackages, validateStoryPackages } from "../lib/story-packages/validation";
import { storyAssetExists } from "../lib/story-packages/validate-files";
import { THE_LOST_MAP_ASSET_MANIFEST, THE_LOST_MAP_ASSET_SCENES } from "../lib/story-packages/manifests/the-lost-map-assets";
import { THE_LOST_MAP_COPY_MANIFEST, THE_LOST_MAP_REGISTRATION_BLOCKERS, THE_LOST_MAP_SCENES } from "../lib/story-packages/manifests/the-lost-map-copy";
import { THE_LOST_MAP } from "../lib/story-packages/manifests/the-lost-map";
import { STORY_PACKAGES, getStoryPackage } from "../lib/story-packages/registry";
import { LANGUAGE_IDS } from "../lib/languages";
import { formatMessage, messageFor, UI_MESSAGES, type MessageKey } from "../lib/i18n/messages";
import { EMPTY_PREFERENCES, getPreferencesSnapshot, parsePreferences, patchPreferences } from "../lib/preferences";
import { bubbleCopySize, readerPagePose } from "../lib/reader/presentation";

/** Synthetic validation input stays test-local; no fixture route or public fixture assets ship. */
const TEST_EASY_TEXT: SceneLanguageText = {
  en: "This is a test image.", es: "Esta es una imagen de prueba.",
  tr: "Bu bir test görselidir.", ar: "هذه صورة اختبار.", ur: "یہ ایک آزمائشی تصویر ہے۔",
};
const TEST_HARD_TEXT: SceneLanguageText = {
  en: "This image is used to check that a longer sentence remains readable at every screen size.",
  es: "Esta imagen sirve para comprobar que una frase más larga sigue siendo legible en todas las pantallas.",
  tr: "Bu görsel, daha uzun bir cümlenin her ekran boyutunda okunabilir kaldığını kontrol etmek için kullanılır.",
  ar: "تُستخدم هذه الصورة للتحقق من أن الجملة الطويلة تظل واضحة ومقروءة على جميع أحجام الشاشات.",
  ur: "اس تصویر کا مقصد یہ جانچنا ہے کہ ایک طویل جملہ ہر سائز کی اسکرین پر واضح اور پڑھنے کے قابل رہے۔",
};
const TEST_READER_PACKAGE = {
  schemaVersion: 1, status: "development",
  id: "reader-fixture", slug: "reader-fixture", title: "A study in light",
  subtitle: "Test-local validation package",
  genre: "daily-life", description: "Synthetic test copy and asset paths used only by the Node validation suite.",
  cover: "/reader-fixtures/frame-01.svg", heroScene: "/reader-fixtures/frame-02.svg",
  background: { image: "/reader-fixtures/frame-02.svg", color: "#141c25", accent: "#a69a83" },
  defaultDifficulty: "easy", estimatedReadingMinutes: 1,
  availableLanguages: ["en", "es", "tr", "ar", "ur"], addedAt: "2026-09-03",
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
  // The fixture intentionally has no Japanese story variant or Japanese reader copy.
  assert.equal(messageFor("ja", "translationSameLanguage"), messageFor("en", "translationSameLanguage"));
});

test("fixture switching supports all demo variants and never substitutes unsupported primary text", () => {
  for (const scene of fixture().scenes) {
    for (const difficulty of ["easy", "hard"] as const) {
      for (const learning of LANGUAGE_IDS) {
        for (const ui of ["tr", "en", "ar", "ur"] as const) {
          const copy = sceneCopy(scene, difficulty, learning, ui);
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

test("The Lost Map production package registers and validates without inventing translations", () => {
  assert.deepEqual(validateStoryPackages([THE_LOST_MAP], { assetExists: storyAssetExists }), []);
  assert.equal(STORY_PACKAGES.length, 1);
  assert.equal(getStoryPackage("the-lost-map"), THE_LOST_MAP);
  for (const scene of THE_LOST_MAP_SCENES) {
    assert.equal(sceneCopy(scene, "easy", "es", "en").translation, undefined);
    assert.equal(sceneCopy(scene, "hard", "es", "tr").translation, undefined);
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
