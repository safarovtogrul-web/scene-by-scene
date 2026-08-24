import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { PreferencesProvider } from "@/components/preferences/PreferencesProvider";
import { ServiceWorkerRegistrar } from "@/components/pwa/ServiceWorkerRegistrar";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://textory.app"),
  title: {
    default: "Textory — Learn languages through stories",
    template: "%s · Textory",
  },
  description:
    "Real actions. Real scenes. A natural way to understand and remember new languages, through thousands of illustrated stories.",
  applicationName: "Textory",
  appleWebApp: {
    capable: true,
    title: "Textory",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/icon.svg" }],
  },
  openGraph: {
    title: "Textory — Learn languages through stories",
    description:
      "Thousands of illustrated stories across genres and worlds. Learn naturally, through real scenes.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#04030c",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${outfit.variable} ${jakarta.variable}`}>
      <body className="min-h-dvh antialiased">
        <AuthProvider>
          <PreferencesProvider>{children}</PreferencesProvider>
        </AuthProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
