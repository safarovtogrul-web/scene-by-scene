/**
 * Navigation is defined per audience so the marketing site and the eventual
 * signed-in product can diverge without rewriting the header.
 *
 * There is no authentication yet — `SiteHeader` takes an `audience` prop that
 * currently always resolves to "public". When accounts arrive, the only change
 * needed is deciding that value from session state.
 */

export type NavAudience = "public" | "member";

export type NavItem = {
  label: string;
  href: string;
  /** Renders the categories mega-menu instead of a plain link. */
  menu?: "categories";
};

export const PUBLIC_NAV: NavItem[] = [
  { label: "Stories", href: "/stories" },
  { label: "Categories", href: "/stories", menu: "categories" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
];

/** Not routed yet — kept here so the shape is settled before auth exists. */
export const MEMBER_NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Stories", href: "/stories" },
  { label: "Saved", href: "/saved" },
  { label: "My Learning", href: "/my-learning" },
];

export function navFor(audience: NavAudience): NavItem[] {
  return audience === "member" ? MEMBER_NAV : PUBLIC_NAV;
}
