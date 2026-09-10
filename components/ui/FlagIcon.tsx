import { getLanguage, type LanguageId } from "@/lib/languages";
import { cn } from "@/lib/cn";

export type FlagCode = string;

/**
 * Simplified vector flags — the single source of flag artwork for Scene by Scene.
 *
 * Drawn inline rather than using emoji or a webfont: Windows has no colour
 * flag glyphs, so emoji flags degrade to bare letter pairs on a large share of
 * desktops, and a sprite library would ship several hundred unused files for
 * the thirteen countries the language registry actually references.
 *
 * Every `flag` value in `LANGUAGE_REGISTRY` must have an entry here; the
 * `flagArtworkExists` helper below lets that be asserted rather than assumed.
 */

/** Regular five-pointed star, point up, as a polygon. */
function Star({
  cx,
  cy,
  r,
  fill,
  rotate = 0,
}: {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  rotate?: number;
}) {
  const points = Array.from({ length: 10 }, (_, index) => {
    const radius = index % 2 === 0 ? r : r * 0.382;
    const angle = (Math.PI / 5) * index - Math.PI / 2 + (rotate * Math.PI) / 180;
    return `${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`;
  }).join(" ");

  return <polygon points={points} fill={fill} />;
}

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
  BR: (
    <>
      <rect width="30" height="22" fill="#009B3A" />
      <path d="M15 2.6 27.4 11 15 19.4 2.6 11Z" fill="#FEDF00" />
      <circle cx="15" cy="11" r="4.6" fill="#002776" />
      <path d="M10.7 9.6a12 12 0 0 1 8.7 2.3" stroke="#fff" strokeWidth="1.3" fill="none" />
    </>
  ),
  UA: (
    <>
      <rect width="30" height="22" fill="#FFD700" />
      <rect width="30" height="11" fill="#0057B7" />
    </>
  ),
  IR: (
    <>
      <rect width="30" height="22" fill="#fff" />
      <rect width="30" height="7.33" fill="#239F40" />
      <rect y="14.67" width="30" height="7.33" fill="#DA0000" />
      <path d="M15 9.3c-.9.5-1.3 1.5-1 2.4.3.8 1 1.3 1.9 1.3-.6-.4-.9-1-.8-1.6.1-.7.6-1.2 1.3-1.4-.5-.5-1-.7-1.4-.7Z" fill="#DA0000" />
    </>
  ),
  KR: (
    <>
      <rect width="30" height="22" fill="#fff" />
      <path d="M11 11a4 4 0 0 1 8 0 4 4 0 0 0-8 0Z" fill="#CD2E3A" />
      <path d="M11 11a4 4 0 0 0 8 0 4 4 0 0 1-8 0Z" fill="#0047A0" />
      <g stroke="#000" strokeWidth="0.85" strokeLinecap="round">
        <path d="M4.6 5.4 6.9 8.6M6 4.5 8.3 7.7M7.4 3.6 9.7 6.8" />
        <path d="M20.3 15.2 22.6 18.4M21.7 14.3 24 17.5M23.1 13.4 25.4 16.6" />
      </g>
    </>
  ),
  TH: (
    <>
      <rect width="30" height="22" fill="#A51931" />
      <rect y="3.7" width="30" height="14.6" fill="#F4F5F8" />
      <rect y="7.3" width="30" height="7.4" fill="#2D2A4A" />
    </>
  ),
  KE: (
    <>
      <rect width="30" height="22" fill="#fff" />
      <rect width="30" height="6.2" fill="#000" />
      <rect y="7.4" width="30" height="7.2" fill="#BB0000" />
      <rect y="15.8" width="30" height="6.2" fill="#006600" />
      <ellipse cx="15" cy="11" rx="2.6" ry="5.2" fill="#BB0000" stroke="#fff" strokeWidth="0.8" />
      <path d="M15 6.6v8.8" stroke="#fff" strokeWidth="0.8" />
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
      <Star cx={19.9} cy={11} r={2.6} fill="#fff" />
    </>
  ),
  AZ: (
    <>
      <rect width="30" height="22" fill="#00B5E2" />
      <rect y="7.34" width="30" height="7.33" fill="#EF3340" />
      <rect y="14.67" width="30" height="7.33" fill="#509E2F" />
      <circle cx="14" cy="11" r="4.1" fill="#fff" />
      <circle cx="15.5" cy="11" r="3.3" fill="#EF3340" />
      <Star cx={20.5} cy={11} r={2.2} fill="#fff" />
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
  CN: (
    <>
      <rect width="30" height="22" fill="#EE1C25" />
      <Star cx={6.2} cy={6.2} r={3.5} fill="#FFDE00" />
      <Star cx={11.6} cy={2.6} r={1.25} fill="#FFDE00" rotate={22} />
      <Star cx={13.6} cy={5.2} r={1.25} fill="#FFDE00" rotate={45} />
      <Star cx={13.5} cy={8.4} r={1.25} fill="#FFDE00" rotate={70} />
      <Star cx={11.3} cy={10.7} r={1.25} fill="#FFDE00" rotate={20} />
    </>
  ),
  IN: (
    <>
      <rect width="30" height="22" fill="#fff" />
      <rect width="30" height="7.34" fill="#FF9933" />
      <rect y="14.66" width="30" height="7.34" fill="#138808" />
      <circle cx="15" cy="11" r="3.1" fill="none" stroke="#000080" strokeWidth="0.75" />
      <circle cx="15" cy="11" r="0.65" fill="#000080" />
      <g stroke="#000080" strokeWidth="0.3">
        {Array.from({ length: 12 }, (_, index) => {
          const angle = (Math.PI / 6) * index;
          return (
            <line
              key={index}
              x1={15 + 0.8 * Math.cos(angle)}
              y1={11 + 0.8 * Math.sin(angle)}
              x2={15 + 3 * Math.cos(angle)}
              y2={11 + 3 * Math.sin(angle)}
            />
          );
        })}
      </g>
    </>
  ),
  BD: (
    <>
      <rect width="30" height="22" fill="#006A4E" />
      <circle cx="13.5" cy="11" r="6" fill="#F42A41" />
    </>
  ),
  PT: (
    <>
      <rect width="30" height="22" fill="#DA291C" />
      <rect width="12" height="22" fill="#046A38" />
      <circle cx="12" cy="11" r="4.2" fill="#FFE900" />
      <circle cx="12" cy="11" r="4.2" fill="none" stroke="#DA291C" strokeWidth="0.5" />
      <circle cx="12" cy="11" r="2.5" fill="#fff" />
      <path
        d="M12 8.5v5M9.5 11h5"
        stroke="#DA291C"
        strokeWidth="0.7"
        strokeLinecap="round"
      />
    </>
  ),
  PK: (
    <>
      <rect width="30" height="22" fill="#01411C" />
      <rect width="7.5" height="22" fill="#fff" />
      <path
        d="M20.6 5.6a5.6 5.6 0 1 0 0 10.8 6.4 6.4 0 1 1 0-10.8Z"
        fill="#fff"
      />
      <Star cx={22.6} cy={7.6} r={2.1} fill="#fff" rotate={20} />
    </>
  ),
  ID: (
    <>
      <rect width="30" height="22" fill="#fff" />
      <rect width="30" height="11" fill="#CE1126" />
    </>
  ),
  NG: (
    <>
      <rect width="30" height="22" fill="#fff" />
      <rect width="10" height="22" fill="#008751" />
      <rect x="20" width="10" height="22" fill="#008751" />
    </>
  ),
  VN: (
    <>
      <rect width="30" height="22" fill="#DA251D" />
      <Star cx={15} cy={11} r={6} fill="#FFFF00" />
    </>
  ),
  HK: (
    <>
      <rect width="30" height="22" fill="#DE2910" />
      <g fill="#fff">
        {Array.from({ length: 5 }, (_, index) => {
          const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
          const px = 15 + 3.1 * Math.cos(angle);
          const py = 11 + 3.1 * Math.sin(angle);
          return (
            <ellipse
              key={index}
              cx={px}
              cy={py}
              rx="1.35"
              ry="2.5"
              transform={`rotate(${(angle * 180) / Math.PI + 90} ${px} ${py})`}
            />
          );
        })}
      </g>
      <circle cx="15" cy="11" r="1.1" fill="#DE2910" />
    </>
  ),
};

/** Lets callers (and tests) confirm the registry has no blank flag slots. */
export function flagArtworkExists(code: FlagCode): boolean {
  return code in FLAGS;
}

/**
 * Fixed sizes rather than free-form class overrides: `cn` only joins strings,
 * so a caller-supplied `h-[15px]` would compete with the base `h-[22px]` and
 * lose or win purely on stylesheet order.
 */
const FLAG_SIZES = {
  xs: "h-[14px] w-[20px] rounded-[3px]",
  sm: "h-[16px] w-[22px] rounded-[4px]",
  md: "h-[19px] w-[26px] rounded-[4px]",
  lg: "h-[22px] w-[30px] rounded-[5px]",
} as const;

export type FlagSize = keyof typeof FLAG_SIZES;

export function FlagIcon({
  code,
  size = "lg",
  className,
}: {
  code: FlagCode;
  size?: FlagSize;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block shrink-0 overflow-hidden ring-1 ring-inset ring-white/15",
        FLAG_SIZES[size],
        className,
      )}
    >
      <svg viewBox="0 0 30 22" className="h-full w-full">
        {FLAGS[code] ?? (
          <>
            <rect width="30" height="22" fill="#1e1b4b" />
            <text
              x="15"
              y="14.5"
              textAnchor="middle"
              fill="#c4b2ff"
              fontSize="8"
              fontWeight="700"
              fontFamily="system-ui, sans-serif"
            >
              {code.slice(0, 2).toUpperCase()}
            </text>
          </>
        )}
      </svg>
    </span>
  );
}

/**
 * The preferred entry point: components pass a language id and never reach
 * into the registry for a flag code themselves.
 */
export function LanguageFlag({
  language,
  size,
  className,
}: {
  language: LanguageId | string;
  size?: FlagSize;
  className?: string;
}) {
  return <FlagIcon code={getLanguage(language).flag} size={size} className={className} />;
}
