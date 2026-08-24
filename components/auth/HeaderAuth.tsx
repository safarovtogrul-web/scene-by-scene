"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AccountMenu } from "./AccountMenu";
import { useAuth } from "./AuthProvider";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { buildLoginHref } from "@/lib/auth/redirects";

/**
 * The right-hand side of the header.
 *
 * Signed out → Sign in + Get Started. Signed in → the account control replaces
 * the sign-in action. While the stored session is still being read it renders
 * a same-sized placeholder, so the header never jumps.
 */
export function HeaderAuth() {
  const { status, user } = useAuth();
  const pathname = usePathname();

  if (status === "loading") {
    return (
      <div
        aria-hidden
        className="hidden h-9 w-[124px] animate-pulse rounded-full bg-white/[0.05] md:block"
      />
    );
  }

  if (status === "authenticated" && user) {
    return <AccountMenu user={user} />;
  }

  return (
    <>
      <Link
        href={buildLoginHref(pathname)}
        className="hidden rounded-full px-4 py-2 text-[15px] text-mist-300 transition-colors duration-200 hover:text-mist-100 lg:block"
      >
        Sign in
      </Link>
      {/* Wrapped rather than given a `hidden` class: PrimaryButton's own
       * `inline-flex` sits in the same CSS layer and would win. */}
      <span className="hidden md:inline-flex">
        <PrimaryButton href="/onboarding" size="sm" className="px-6">
          Get Started
        </PrimaryButton>
      </span>
    </>
  );
}
