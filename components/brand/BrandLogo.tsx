import { BRAND_MARK, BRAND_NAME, BRAND_WORDMARK } from "@/lib/brand";
import { cn } from "@/lib/cn";

/**
 * The wordmark is three words where the old one was one. The connector is set
 * smaller and takes the violet accent; both halves of the name stay white, so
 * "Scene … Scene" reads as the name and the lockup stays narrow enough for the
 * header.
 */
const SIZES = {
  sm: { mark: "h-7 w-7 rounded-[9px] text-[15px]", word: "text-[15px]", join: "text-[11px]" },
  md: { mark: "h-9 w-9 rounded-[11px] text-[19px]", word: "text-[18px]", join: "text-[13px]" },
  lg: { mark: "h-12 w-12 rounded-[15px] text-2xl", word: "text-[26px]", join: "text-[18px]" },
} as const;

export type BrandLogoProps = {
  size?: keyof typeof SIZES;
  /** Hide the wordmark and show the glyph only. */
  markOnly?: boolean;
  className?: string;
};

export function BrandLogo({
  size = "md",
  markOnly = false,
  className,
}: BrandLogoProps) {
  const scale = SIZES[size];
  const [first, join, second] = BRAND_WORDMARK;

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className={cn(
          "grid place-items-center bg-gradient-to-br from-iris-400 to-iris-700 font-display font-bold text-white shadow-[0_6px_20px_-6px_rgba(124,58,237,0.9)]",
          scale.mark,
        )}
      >
        {BRAND_MARK}
      </span>
      {markOnly ? (
        <span className="sr-only">{BRAND_NAME}</span>
      ) : (
        <span
          className={cn(
            "inline-flex items-baseline gap-[0.28em] font-display leading-none whitespace-nowrap",
            scale.word,
          )}
        >
          <span className="font-semibold tracking-tight text-mist-100">{first}</span>
          <span className={cn("text-emphasis font-semibold", scale.join)}>{join}</span>
          <span className="font-semibold tracking-tight text-mist-100">{second}</span>
        </span>
      )}
    </span>
  );
}
