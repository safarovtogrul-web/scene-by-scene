import { cn } from "@/lib/cn";

export type FlagCode = string;

/**
 * Simplified vector flags.
 *
 * Drawn inline rather than using emoji: Windows has no colour flag glyphs, so
 * emoji flags would degrade to bare letter pairs on a large share of desktops.
 */
const FLAGS: Record<string, React.ReactNode> = {
  GB: (
    <>
      <rect width="30" height="22" fill="#012169" />
      <path d="M0 0 30 22M30 0 0 22" stroke="#fff" strokeWidth="4.4" />
      <path d="M0 0 30 22M30 0 0 22" stroke="#C8102E" strokeWidth="2.4" />
      <path d="M15 0v22M0 11h30" stroke="#fff" strokeWidth="7" />
      <path d="M15 0v22M0 11h30" stroke="#C8102E" strokeWidth="4" />
    </>
  ),
  ES: (
    <>
      <rect width="30" height="22" fill="#AA151B" />
      <rect y="5.5" width="30" height="11" fill="#F1BF00" />
      <rect x="5" y="8.5" width="4" height="5" rx="0.6" fill="#AA151B" />
    </>
  ),
  DE: (
    <>
      <rect width="30" height="22" fill="#000" />
      <rect y="7.34" width="30" height="7.33" fill="#DD0000" />
      <rect y="14.67" width="30" height="7.33" fill="#FFCE00" />
    </>
  ),
  FR: (
    <>
      <rect width="30" height="22" fill="#fff" />
      <rect width="10" height="22" fill="#002395" />
      <rect x="20" width="10" height="22" fill="#ED2939" />
    </>
  ),
  IT: (
    <>
      <rect width="30" height="22" fill="#fff" />
      <rect width="10" height="22" fill="#008C45" />
      <rect x="20" width="10" height="22" fill="#CD212A" />
    </>
  ),
  JP: (
    <>
      <rect width="30" height="22" fill="#fff" />
      <circle cx="15" cy="11" r="6.2" fill="#BC002D" />
    </>
  ),
  TR: (
    <>
      <rect width="30" height="22" fill="#E30A17" />
      <circle cx="12" cy="11" r="5" fill="#fff" />
      <circle cx="13.7" cy="11" r="4" fill="#E30A17" />
      <path
        d="m19.4 11 1.5-1.1-.55 1.8 1.5 1.15h-1.87L19.4 14.7 18.83 12.85H17l1.5-1.15-.57-1.8z"
        fill="#fff"
      />
    </>
  ),
  AZ: (
    <>
      <rect width="30" height="22" fill="#00B5E2" />
      <rect y="7.34" width="30" height="7.33" fill="#EF3340" />
      <rect y="14.67" width="30" height="7.33" fill="#509E2F" />
      <circle cx="14" cy="11" r="4.1" fill="#fff" />
      <circle cx="15.5" cy="11" r="3.3" fill="#EF3340" />
      <path
        d="m20.3 11 1.25-.9-.46 1.47 1.25.95h-1.55L20.3 14.06 19.83 12.52h-1.55l1.25-.95-.46-1.47z"
        fill="#fff"
      />
    </>
  ),
  RU: (
    <>
      <rect width="30" height="22" fill="#fff" />
      <rect y="7.34" width="30" height="7.33" fill="#0039A6" />
      <rect y="14.67" width="30" height="7.33" fill="#D52B1E" />
    </>
  ),
  SA: (
    <>
      <rect width="30" height="22" fill="#006C35" />
      <path
        d="M7 9.2c1.6.9 3.4 1.3 5.2 1.2 1.5-.1 3-.5 4.4-1.1M7.6 7.4c.6.5 1.4.8 2.2.8M12 7.2v1.1M14.4 7.1v1.2"
        stroke="#fff"
        strokeWidth="0.9"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M6.5 14h15M20.4 12.6 22 14l-1.6 1.4"
        stroke="#fff"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),
};

export function FlagIcon({
  code,
  className,
}: {
  code: FlagCode;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 30 22"
      className={cn(
        "h-[22px] w-[30px] shrink-0 rounded-[5px] ring-1 ring-inset ring-white/20",
        className,
      )}
    >
      <defs>
        <clipPath id={`flag-clip-${code}`}>
          <rect width="30" height="22" rx="5" />
        </clipPath>
      </defs>
      <g clipPath={`url(#flag-clip-${code})`}>
        {FLAGS[code] ?? (
          <>
            <rect width="30" height="22" fill="#312e81" />
            <path d="M0 0h30v22H0z" fill="url(#fallback-flag)" opacity="0.45" />
            <text x="15" y="14" textAnchor="middle" fill="#f5f3ff" fontSize="7.5" fontWeight="700">
              {code.slice(0, 2)}
            </text>
          </>
        )}
      </g>
      {!FLAGS[code] && (
        <defs>
          <linearGradient id="fallback-flag" x1="0" y1="0" x2="30" y2="22">
            <stop stopColor="#7c3aed" />
            <stop offset="1" stopColor="#1e1b4b" />
          </linearGradient>
        </defs>
      )}
    </svg>
  );
}
