/**
 * Semantic-parity audit for a multilingual story package.
 *
 * Counting strings only proves a language is present, not that it still tells
 * the same story. This checks the properties that a wrong translation actually
 * breaks: the character's name survives, a question stays a question, the
 * scene's own props are still named, and Easy never says more than Hard.
 *
 * It is deliberately mechanical. It cannot judge prose — it narrows a human
 * read-through to the scenes and languages worth looking at.
 */
import { LANGUAGE_IDS, getLanguage, type LanguageId } from "../lib/languages";
import { THE_LOST_MAP } from "../lib/story-packages/manifests/the-lost-map";
import { THE_LOST_MAP_SCENES } from "../lib/story-packages/manifests/the-lost-map-copy";
import type { Difficulty } from "../lib/catalog/types";

type Finding = { scene: string; language: LanguageId; difficulty: Difficulty | "both"; problem: string };

/** Scripts that do not use Latin letters spell the name in their own script. */
const NAME_FORMS: Partial<Record<LanguageId, RegExp>> = {
  ru: /Лусия/u, uk: /Лусія/u, ar: /لوسيا/u, fa: /لوسیا/u,
  "zh-CN": /露西亚/u, ja: /ルシア/u, ko: /루시아/u, th: /ลูซีอา/u, hi: /लुसीआ/u,
};
const LATIN_NAME = /Luc[ií]a/u;

/** Sentence-final question marks, including the scripts that use their own. */
const QUESTION_MARK = /[?？؟]\s*$/u;

/**
 * Props the artwork shows in a given scene. Each entry lists, per language, a
 * pattern that must appear — the words a reader would lose if a translation
 * quietly dropped the object the scene is actually about.
 *
 * `only` restricts a rule to one difficulty. S24 uses it because the stone
 * bridge is a Hard-only detail: the approved Spanish Easy line is just
 * "Lucía encuentra una foto de su abuela.", and Easy must stay that short.
 */
type PropRule = { only?: Difficulty; patterns: Partial<Record<LanguageId, RegExp>> };

const REQUIRED_PROPS: Record<string, PropRule> = {
  S08: { patterns: {
    en: /key/iu, es: /llave/iu, fr: /cl[ée]/iu, de: /schl[üu]ssel/iu, "pt-BR": /chave/iu,
    it: /chiave/iu, tr: /anahtar/iu, ru: /ключ/iu, uk: /ключ/iu, ar: /مفتاح/u, fa: /کلید/u,
    "zh-CN": /钥匙/u, ja: /鍵/u, ko: /열쇠/u, id: /kunci/iu, vi: /chìa khóa/iu, th: /กุญแจ/u,
    hi: /चाबी/u, sw: /ufunguo/iu,
  } },
  S16: { patterns: {
    en: /marker/iu, es: /hito/iu, fr: /borne/iu, de: /marker/iu, "pt-BR": /marco/iu,
    it: /cippo/iu, tr: /işaret/iu, ru: /знак/iu, uk: /знак/iu, ar: /العلامة/u, fa: /نشانه/u,
    "zh-CN": /路标/u, ja: /道しるべ/u, ko: /표지/u, id: /penanda/iu, vi: /cột mốc/iu, th: /หลักหิน/u,
    hi: /निशान/u, sw: /alama/iu,
  } },
  S21: { patterns: {
    en: /lantern/iu, es: /linterna/iu, fr: /lanterne/iu, de: /laterne/iu, "pt-BR": /lanterna/iu,
    it: /lanterna/iu, tr: /fener/iu, ru: /фонар/iu, uk: /ліхтар/iu, ar: /الفانوس|فانوس/u, fa: /فانوس/u,
    "zh-CN": /灯/u, ja: /ランタン/u, ko: /손전등/u, id: /lentera/iu, vi: /đèn lồng/iu, th: /ตะเกียง/u,
    hi: /लालटेन/u, sw: /taa/iu,
  } },
  S23: { patterns: {
    en: /box/iu, es: /caja/iu, fr: /bo[îi]te/iu, de: /kiste/iu, "pt-BR": /caixa/iu,
    it: /cassa/iu, tr: /sandı[kğ]/iu, ru: /ящик/iu, uk: /скрин/iu, ar: /الصندوق|صندوق/u, fa: /صندوق/u,
    "zh-CN": /箱/u, ja: /箱/u, ko: /상자/u, id: /kotak/iu, vi: /hộp/iu, th: /หีบ/u,
    hi: /संदूक/u, sw: /sanduku/iu,
  } },
  S24: { only: "hard", patterns: {
    en: /bridge/iu, es: /puente/iu, fr: /pont/iu, de: /br[üu]cke/iu, "pt-BR": /ponte/iu,
    it: /ponte/iu, tr: /köprü/iu, ru: /мост/iu, uk: /мост/iu, ar: /الجسر|جسر/u, fa: /پل/u,
    "zh-CN": /桥/u, ja: /橋/u, ko: /다리/u, id: /jembatan/iu, vi: /cầu/iu, th: /สะพาน/u,
    hi: /पुल/u, sw: /daraja/iu,
  } },
};

export function auditStoryParity(): Finding[] {
  const findings: Finding[] = [];
  const scenes = THE_LOST_MAP_SCENES;

  for (const scene of scenes) {
    const isQuestion = QUESTION_MARK.test(scene.text.easy.es ?? "");

    for (const language of LANGUAGE_IDS) {
      const easy = scene.text.easy[language] ?? "";
      const hard = scene.text.hard[language] ?? "";

      for (const [difficulty, text] of [["easy", easy], ["hard", hard]] as const) {
        if (!text.trim()) {
          findings.push({ scene: scene.id, language, difficulty, problem: "empty" });
          continue;
        }

        // A spoken line is the character's own voice; narration names her.
        // Only narration is required to carry the name.
        if (scene.bubble?.type !== "speech") {
          const form = NAME_FORMS[language] ?? LATIN_NAME;
          if (!form.test(text)) {
            findings.push({ scene: scene.id, language, difficulty, problem: "character name missing" });
          }
        }

        // A question must not become a statement, or the reverse.
        if (QUESTION_MARK.test(text) !== isQuestion) {
          findings.push({
            scene: scene.id, language, difficulty,
            problem: isQuestion ? "question became a statement" : "statement became a question",
          });
        }

        const rule = REQUIRED_PROPS[scene.id];
        const prop = rule && (!rule.only || rule.only === difficulty) ? rule.patterns[language] : undefined;
        if (prop && !prop.test(text)) {
          findings.push({ scene: scene.id, language, difficulty, problem: `scene prop missing (${prop.source})` });
        }
      }

      // Hard is the richer telling of the same event, so it is never shorter.
      if (easy.trim() && hard.trim() && [...hard].length < [...easy].length) {
        findings.push({ scene: scene.id, language, difficulty: "both", problem: "hard is shorter than easy" });
      }
    }
  }

  // Metadata must cover every interface language the product offers.
  for (const language of LANGUAGE_IDS) {
    const copy = THE_LOST_MAP.localized?.[language];
    for (const field of ["title", "subtitle", "description"] as const) {
      if (!copy?.[field]?.trim()) {
        findings.push({ scene: "metadata", language, difficulty: "both", problem: `${field} missing` });
      }
    }
  }

  return findings;
}

if (process.argv[1]?.includes("audit-story-parity")) {
  const findings = auditStoryParity();
  const scenes = THE_LOST_MAP_SCENES.length;
  const variants = scenes * 2 * LANGUAGE_IDS.length;
  console.log(`The Lost Map — ${scenes} scenes × 2 levels × ${LANGUAGE_IDS.length} languages = ${variants} variants`);
  console.log(`right-to-left languages: ${LANGUAGE_IDS.filter((id) => getLanguage(id).dir === "rtl").join(", ")}`);
  if (!findings.length) {
    console.log("semantic parity: no findings");
  } else {
    console.log(`semantic parity: ${findings.length} finding(s)`);
    for (const f of findings) console.log(`  ${f.scene} ${f.language} ${f.difficulty}: ${f.problem}`);
    process.exitCode = 1;
  }
}
