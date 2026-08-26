import type { Metadata } from "next";

import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { PricingBody } from "./PricingBody";
import { getServerT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return { title: t("navPricing"), description: t("pricingBody") };
}

/**
 * Placeholder so the "Pricing" navigation item is not a dead link.
 *
 * Intentionally minimal: plans, billing and payments are explicitly out of
 * scope for this phase, so nothing here implies a purchasable product.
 */
export default function PricingPage() {
  return (
    <>
      <SiteHeader />

      <PricingBody />

      <SiteFooter />
    </>
  );
}
