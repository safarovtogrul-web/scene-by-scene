import Link from "next/link";

import { TextoryLogo } from "@/components/brand/TextoryLogo";

const EXPLORE_LINKS = [
  { label: "All stories", href: "/stories" },
  { label: "New stories", href: "/stories?sort=newest" },
  { label: "Short stories", href: "/stories?length=short" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] bg-ink-950 px-6 py-12 md:px-10 md:py-14 lg:px-16">
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-80 bg-[radial-gradient(closest-side,rgba(124,58,237,0.2),transparent)]" />

      <div className="relative mx-auto max-w-[1200px]">
        <div className="grid gap-10 pb-10 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="max-w-[30ch]">
            <TextoryLogo size="md" />
            <p className="mt-4 text-[15px] leading-relaxed text-mist-400">
              Language learning, told through stories.
            </p>
          </div>

          <FooterColumn title="Explore">
            {EXPLORE_LINKS.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>
        </div>

        <p className="border-t border-white/[0.06] pt-8 text-xs text-mist-500">
          © {new Date().getFullYear()} Textory
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.16em] text-mist-500 uppercase">
        {title}
      </p>
      <div className="mt-4 flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-[14.5px] text-mist-400 transition-colors duration-200 hover:text-mist-100"
    >
      {children}
    </Link>
  );
}
