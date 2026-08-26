/**
 * The product's public identity, in one place.
 *
 * The name is a proper noun and stays in English in every interface language —
 * only the tagline around it is translated. Keeping it here rather than typed
 * into each surface means the next rename touches one file.
 *
 * Internal identifiers (storage keys, the Supabase metadata key, the package
 * name) deliberately keep their original spelling: renaming them would sign
 * every existing reader out of their saved preferences for no visible gain.
 */
export const BRAND_NAME = "Scene by Scene";

/** Split for the wordmark, which sets the connector apart typographically. */
export const BRAND_WORDMARK = ["Scene", "by", "Scene"] as const;

/** Single letter used inside the gradient mark. */
export const BRAND_MARK = "S";

export const BRAND_DOMAIN = "scenebyscene.app";
export const BRAND_URL = `https://${BRAND_DOMAIN}`;
