import { isLanguageId } from "../languages";
import { BUBBLE_PRESETS, BUBBLE_TYPES, type StoryPackage } from "./schema";

type RecordValue = Record<string, unknown>;
const record = (value: unknown): value is RecordValue => !!value && typeof value === "object" && !Array.isArray(value);
const nonempty = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const fraction = (value: unknown) => typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
const color = (value: unknown) => typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
const genres = ["mystery", "adventure", "daily-life", "romance", "comedy", "fantasy", "crime"];

/** Pure validation works in build tools and tests; asset existence is injected server-side. */
export function validateStoryPackages(
  packages: readonly unknown[],
  options: { assetExists?: (path: string) => boolean; reserved?: readonly { id: string; slug: string }[]; allowDevelopment?: boolean } = {},
): string[] {
  const errors: string[] = [];
  const ids = new Set(options.reserved?.map((story) => story.id));
  const slugs = new Set(options.reserved?.map((story) => story.slug));

  packages.forEach((entry, index) => {
    const label = record(entry) && nonempty(entry.slug) ? entry.slug : `package[${index}]`;
    const fail = (field: string, message: string) => errors.push(`${label}.${field}: ${message}`);
    if (!record(entry)) { fail("manifest", "expected an object"); return; }
    if (entry.schemaVersion !== 1) fail("schemaVersion", "expected 1");
    if (entry.status !== "published" && !(options.allowDevelopment && entry.status === "development")) fail("status", "expected a published story (development fixtures cannot ship)");
    for (const field of ["id", "slug", "title", "description", "addedAt"]) {
      if (!nonempty(entry[field])) fail(field, "required non-empty string");
    }
    if (typeof entry.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug)) fail("slug", "use lowercase URL words separated by hyphens");
    for (const [field, seen] of [["id", ids], ["slug", slugs]] as const) {
      if (typeof entry[field] === "string") {
        if (seen.has(entry[field])) fail(field, `duplicate ${field}`);
        seen.add(entry[field]);
      }
    }
    if (!genres.includes(String(entry.genre))) fail("genre", "unknown genre");
    if (entry.defaultDifficulty !== "easy" && entry.defaultDifficulty !== "hard") fail("defaultDifficulty", "only easy or hard is supported");
    if (typeof entry.estimatedReadingMinutes !== "number" || !Number.isFinite(entry.estimatedReadingMinutes) || entry.estimatedReadingMinutes <= 0) fail("estimatedReadingMinutes", "expected a positive number");

    const asset = (value: unknown, field: string) => {
      if (!nonempty(value)) { fail(field, "missing image"); return; }
      const root = entry.status === "development" ? "/reader-fixtures/" : `/stories/${entry.slug}/`;
      if (!value.startsWith(root) || /(?:\.\.|[\\%?#])/.test(value) || !/\.(?:webp|avif|png|jpe?g|svg)$/i.test(value)) {
        fail(field, `expected an original image under ${root}; design references are not runtime assets`);
      } else if (options.assetExists && !options.assetExists(value)) fail(field, `file does not exist: public${value}`);
    };
    asset(entry.cover, "cover");
    asset(entry.heroScene, "heroScene");
    if (!record(entry.background)) fail("background", "required background image");
    else {
      asset(entry.background.image, "background.image");
      for (const key of ["color", "accent"]) if (entry.background[key] !== undefined && !color(entry.background[key])) fail(`background.${key}`, "expected a six-digit hex color");
    }

    const languages = Array.isArray(entry.availableLanguages) ? entry.availableLanguages : [];
    if (!languages.length) fail("availableLanguages", "declare at least one language");
    if (new Set(languages).size !== languages.length) fail("availableLanguages", "duplicate language");
    languages.forEach((language) => { if (!isLanguageId(language)) fail("availableLanguages", `invalid language code: ${String(language)}`); });
    const textMap = (value: unknown, field: string, required: boolean) => {
      if (!record(value)) { fail(field, "expected a language-to-text map"); return; }
      for (const [language, text] of Object.entries(value)) {
        if (!isLanguageId(language)) fail(field, `invalid language code: ${language}`);
        if (!nonempty(text)) fail(`${field}.${language}`, "missing text");
        if (required && !languages.includes(language)) fail(field, `content language ${language} is not declared`);
      }
      if (required) for (const language of languages) if (!nonempty(value[String(language)])) fail(`${field}.${String(language)}`, "declared language has no content");
    };
    const point = (value: unknown, field: string) => {
      if (!record(value) || !fraction(value.x) || !fraction(value.y)) fail(field, "x and y must be finite fractions in [0, 1]");
    };
    const bubble = (value: unknown, field: string) => {
      if (!record(value)) { fail(field, "expected a bubble placement"); return; }
      if (value.type !== undefined && !(BUBBLE_TYPES as readonly unknown[]).includes(value.type)) fail(`${field}.type`, "expected speech or narration");
      if (value.speaker !== undefined && !nonempty(value.speaker)) fail(`${field}.speaker`, "expected a non-empty speaker name");
      if (value.preset !== undefined) {
        if (!(BUBBLE_PRESETS as readonly unknown[]).includes(value.preset)) fail(field, "unknown bubble preset");
        if (value.x !== undefined || value.y !== undefined) fail(field, "use either a preset or normalized coordinates");
      } else point(value, field);
      if (value.maxWidth !== undefined && (!fraction(value.maxWidth) || value.maxWidth === 0)) fail(`${field}.maxWidth`, "expected a fraction in (0, 1]");
      if (value.alignment !== undefined && !["start", "center", "end"].includes(String(value.alignment))) fail(field, "invalid alignment");
      if (value.tone !== undefined && !["glass", "ink"].includes(String(value.tone))) fail(field, "invalid tone");
    };

    if (!Array.isArray(entry.scenes) || !entry.scenes.length) { fail("scenes", "at least one scene is required"); return; }
    const sceneIds = new Set<string>();
    entry.scenes.forEach((scene: unknown, sceneIndex: number) => {
      const path = `scenes[${sceneIndex}]`;
      if (!record(scene)) { fail(path, "expected a scene object"); return; }
      if (!nonempty(scene.id)) fail(`${path}.id`, "missing scene id");
      else if (sceneIds.has(scene.id)) fail(`${path}.id`, "duplicate scene id");
      else sceneIds.add(scene.id);
      if (scene.order !== sceneIndex + 1) fail(`${path}.order`, `expected ${sceneIndex + 1}; scene order must be contiguous and start at 1`);
      if (record(scene.image)) {
        asset(scene.image.desktop, `${path}.image.desktop`);
        if (scene.image.mobile !== undefined) asset(scene.image.mobile, `${path}.image.mobile`);
      } else asset(scene.image, `${path}.image`);
      if (!record(scene.text)) fail(`${path}.text`, "Easy and Hard text maps are required");
      else {
        for (const key of Object.keys(scene.text)) if (key !== "easy" && key !== "hard") fail(`${path}.text`, "only easy and hard are supported");
        for (const difficulty of ["easy", "hard"]) textMap(scene.text[difficulty], `${path}.text.${difficulty}`, true);
      }
      if (scene.alt !== undefined) textMap(scene.alt, `${path}.alt`, false);
      for (const key of ["bubble", "mobileBubble"]) if (scene[key] !== undefined) bubble(scene[key], `${path}.${key}`);
      if (scene.visual !== undefined) {
        if (!record(scene.visual)) fail(`${path}.visual`, "expected visual alignment metadata");
        else for (const key of ["focalPoint", "mobileFocalPoint"]) if (scene.visual[key] !== undefined) point(scene.visual[key], `${path}.visual.${key}`);
      }
      if (scene.translation !== undefined) {
        if (!record(scene.translation)) fail(`${path}.translation`, "expected translation metadata");
        else {
          if (scene.translation.hide !== undefined && typeof scene.translation.hide !== "boolean") fail(`${path}.translation.hide`, "expected a boolean");
          if (scene.translation.text !== undefined) {
            if (!record(scene.translation.text)) fail(`${path}.translation.text`, "expected difficulty maps");
            else for (const [difficulty, texts] of Object.entries(scene.translation.text)) {
              if (difficulty !== "easy" && difficulty !== "hard") fail(`${path}.translation.text`, "only easy and hard are supported");
              textMap(texts, `${path}.translation.text.${difficulty}`, false);
            }
          }
        }
      }
    });
  });
  return errors;
}

export function assertStoryPackages(packages: readonly unknown[], options: Parameters<typeof validateStoryPackages>[1] = {}): asserts packages is readonly StoryPackage[] {
  const errors = validateStoryPackages(packages, options);
  if (errors.length) throw new Error(`Story package validation failed:\n${errors.map((error) => `  • ${error}`).join("\n")}`);
}
