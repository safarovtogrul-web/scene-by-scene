import type { AuthProviderId } from "@/lib/auth/providers";

/**
 * Official provider marks, used only to identify each sign-in option — which
 * is exactly what Google, Apple and Meta require of a "Continue with" button.
 * Never restyle or recolour them.
 */

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden focusable="false">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function AppleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false">
      <path
        fill="#ffffff"
        d="M16.37 1.43c0 1.13-.42 2.19-1.25 3.05-.99 1.02-2.13 1.61-3.36 1.52a3.4 3.4 0 0 1 1.29-3.02c.9-.93 2.18-1.55 3.32-1.55zM20.7 17.16c-.6 1.38-.9 2-1.68 3.23-1.08 1.71-2.61 3.84-4.5 3.86-1.68.03-2.12-1.1-4.4-1.09-2.29.01-2.77 1.11-4.45 1.09-1.89-.02-3.34-1.94-4.42-3.65C-1.77 15.85-2.1 9.4.75 6.32a5.9 5.9 0 0 1 4.4-2.02c1.79 0 2.92 1.11 4.4 1.11 1.44 0 2.32-1.11 4.39-1.11 1.63 0 3.36.89 4.6 2.42-4.04 2.21-3.39 7.98.16 8.44z"
      />
    </svg>
  );
}

function FacebookMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false">
      <path
        fill="#1877F2"
        d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"
      />
    </svg>
  );
}

const MARKS = {
  google: GoogleMark,
  apple: AppleMark,
  facebook: FacebookMark,
} as const;

export function ProviderIcon({
  provider,
  className = "h-5 w-5",
}: {
  provider: AuthProviderId;
  className?: string;
}) {
  const Mark = MARKS[provider];
  return <Mark className={className} />;
}
