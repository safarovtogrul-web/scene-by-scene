import { SplashScreen } from "@/components/app/SplashScreen";

/**
 * Small-screen landing. Not a shrunken desktop layout — it is the app's own
 * opening screen, filling the viewport.
 */
export function MobileHero() {
  return (
    <section className="relative h-[100dvh] min-h-[680px] md:hidden">
      <SplashScreen />
    </section>
  );
}
