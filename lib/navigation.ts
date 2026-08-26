/**
 * Navigation is defined per audience so the marketing site and the eventual
 * signed-in product can diverge without rewriting the header.
 *
 * There is no authentication yet — `SiteHeader` takes an `audience` prop that
 * currently always resolves to "public". When accounts arrive, the only change
 * needed is deciding that value from session state.
 */

import type { MessageKey } from "@/lib/i18n/messages";

export type NavAudience = "public" | "member";

export type NavItem = {
  /** Resolved through the interface-language catalogue at render time. */
  labelKey: MessageKey;
  href: string;
  /** Renders the categories mega-menu instead of a plain link. */
  menu?: "categories";
};

export const PUBLIC_NAV: NavItem[] = [
  { labelKey: "navStories", href: "/stories" },
  { labelKey: "navCategories", href: "/stories", menu: "categories" },
  { labelKey: "navHowItWorks", href: "/#how-it-works" },
  { labelKey: "navPricing", href: "/pricing" },
];

/** Not routed yet — kept here so the shape is settled before auth exists. */
export const MEMBER_NAV: NavItem[] = [
  { labelKey: "navStories", href: "/stories" },
];

export function navFor(audience: NavAudience): NavItem[] {
  return audience === "member" ? MEMBER_NAV : PUBLIC_NAV;
}
