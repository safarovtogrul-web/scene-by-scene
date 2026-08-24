"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { ProviderIcon } from "./ProviderIcons";
import { useAuth } from "./AuthProvider";
import { TextoryLogo } from "@/components/brand/TextoryLogo";
import { AUTH_PROVIDERS, type AuthProviderId } from "@/lib/auth/providers";
import { buildOAuthRedirectUrl, sanitizeNextPath } from "@/lib/auth/redirects";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

const ERROR_MESSAGES: Record<string, string> = {
  provider: "That sign-in was cancelled before it finished.",
  missing_code: "The sign-in link was incomplete. Please try again.",
  exchange: "We couldn't finish that sign-in. Please try again.",
  not_configured: "Sign-in isn't connected yet.",
};

export function LoginPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useAuth();

  const next = sanitizeNextPath(searchParams.get("next"));
  const errorCode = searchParams.get("error");

  const [pending, setPending] = useState<AuthProviderId | null>(null);
  const [failure, setFailure] = useState<string | null>(
    errorCode ? (ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.exchange) : null,
  );

  // Already signed in? There is nothing to do here.
  useEffect(() => {
    if (status === "authenticated") router.replace(next);
  }, [status, next, router]);

  const unavailable = status === "unconfigured";

  const startOAuth = async (provider: AuthProviderId) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setFailure(null);
    setPending(provider);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: buildOAuthRedirectUrl(window.location.origin, next),
      },
    });

    // On success the browser has already left for the provider.
    if (error) {
      setPending(null);
      setFailure(error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 w-full max-w-[440px]"
    >
      <div className="rounded-[32px] border border-white/[0.08] bg-ink-900/60 p-6 shadow-[0_60px_120px_-50px_rgba(0,0,0,0.95)] backdrop-blur-2xl sm:p-10">
        <div className="flex justify-center">
          <TextoryLogo size="md" />
        </div>

        <h1 className="mt-8 text-center font-display text-[clamp(1.7rem,4.4vw,2.1rem)] leading-tight font-bold tracking-[-0.025em] text-mist-100">
          Welcome to Textory
        </h1>
        <p className="mx-auto mt-3 max-w-[34ch] text-center text-[15px] leading-relaxed text-mist-400">
          Continue your stories and learning progress across devices.
        </p>

        {unavailable && (
          <div className="mt-7 rounded-2xl border border-iris-400/25 bg-iris-500/[0.09] px-5 py-4 text-[13.5px] leading-relaxed text-iris-100/85">
            Sign-in isn&apos;t connected yet. Add your Supabase project keys to
            <code className="mx-1 rounded bg-black/30 px-1.5 py-0.5 text-[12.5px]">
              .env.local
            </code>
            and enable the providers to switch this on.
          </div>
        )}

        {failure && !unavailable && (
          <p
            role="alert"
            className="mt-7 rounded-2xl border border-red-400/25 bg-red-500/[0.08] px-5 py-3.5 text-[13.5px] leading-relaxed text-red-200/90"
          >
            {failure}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3">
          {AUTH_PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              type="button"
              disabled={unavailable || pending !== null}
              onClick={() => startOAuth(provider.id)}
              className={cn(
                "group relative flex h-14 w-full items-center gap-3.5 rounded-2xl border border-white/[0.1] bg-white/[0.05] px-4 text-[15px] font-medium text-mist-100 transition-all duration-300 sm:gap-4 sm:px-5 sm:text-[15.5px]",
                "hover:border-iris-400/40 hover:bg-white/[0.09]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-400",
                "disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-white/[0.1] disabled:hover:bg-white/[0.05]",
              )}
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center">
                {pending === provider.id ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white/80" />
                ) : (
                  <ProviderIcon provider={provider.id} />
                )}
              </span>
              <span className="flex-1 text-left whitespace-nowrap">
                {provider.label}
              </span>
              <svg
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden
                className="h-4 w-4 shrink-0 text-mist-500 transition-transform duration-300 group-hover:translate-x-1"
              >
                <path
                  d="M4 10h11M11 5.5 15.5 10 11 14.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-4">
          <span className="h-px flex-1 bg-white/[0.08]" />
          <span className="text-[12px] tracking-[0.14em] text-mist-500 uppercase">
            or
          </span>
          <span className="h-px flex-1 bg-white/[0.08]" />
        </div>

        <Link
          href="/stories"
          className="mt-6 block text-center text-[14.5px] text-mist-300 transition-colors hover:text-mist-100"
        >
          Browse the library first
        </Link>

        <p className="mt-7 text-center text-[12.5px] leading-relaxed text-mist-500">
          No password needed — Textory uses an account you already have.
        </p>
      </div>

      <Link
        href="/"
        className="group mt-6 flex items-center justify-center gap-2 text-[14px] text-mist-400 transition-colors hover:text-mist-100"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden
          className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
        >
          <path
            d="M16 10H5m0 0 4.5-4.5M5 10l4.5 4.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to Textory
      </Link>
    </motion.div>
  );
}
