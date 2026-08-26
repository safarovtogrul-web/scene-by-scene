import { SiteHeader } from "@/components/landing/SiteHeader";
import { HeroSwitch } from "@/components/landing/HeroSwitch";
import { CategoryDiscovery } from "@/components/landing/CategoryDiscovery";
import { StoryRows } from "@/components/landing/StoryRows";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { MobileShowcase } from "@/components/landing/MobileShowcase";
import { SiteFooter } from "@/components/landing/SiteFooter";

export default function LandingPage() {
  return (
    <>
      <SiteHeader />

      <main className="relative">
        {/* Two deliberately different hero compositions, one per form
         * factor — only the one in use is mounted. */}
        <HeroSwitch />

        <CategoryDiscovery />
        <StoryRows />
        <HowItWorks />
        <MobileShowcase />
      </main>

      <SiteFooter />
    </>
  );
}
