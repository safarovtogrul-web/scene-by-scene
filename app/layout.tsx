import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { PreferencesProvider } from "@/components/preferences/PreferencesProvider";
import { ServiceWorkerRegistrar } from "@/components/pwa/ServiceWorkerRegistrar";
import { getServerPreferences, getServerT } from "@/lib/i18n/server";
import { BRAND_NAME, BRAND_URL } from "@/lib/brand";
import { getLanguage } from "@/lib/languages";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();

  return {
    metadataBase: new URL(BRAND_URL),
    title: {
      default: BRAND_NAME,
      template: `%s · ${BRAND_NAME}`,
    },
    description: t("tagline"),
    applicationName: BRAND_NAME,
    appleWebApp: {
      capable: true,
      title: BRAND_NAME,
      statusBarStyle: "black-translucent",
    },
    icons: {
      icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/icons/icon.svg" }],
    },
    openGraph: {
      title: BRAND_NAME,
      description: t("tagline"),
      type: "website",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#04030c",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * Reading the preferences cookie here is what makes the first paint correct.
 * It costs static prerendering — every route becomes server-rendered on demand
 * — but a page that is prerendered in the wrong language and then rewritten in
 * the browser is a visible flash, and there is no cached HTML that could be
 * right for twenty different interface languages at once.
 */
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const preferences = await getServerPreferences();
  const language = getLanguage(preferences.interfaceLanguage);

  return (
    <html
      lang={language.locale}
      dir={language.dir}
      className={`${outfit.variable} ${jakarta.variable}`}
    >
      <body className="min-h-dvh antialiased">
        <AuthProvider>
          <PreferencesProvider initialPreferences={preferences}>
            {children}
          </PreferencesProvider>
        </AuthProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
