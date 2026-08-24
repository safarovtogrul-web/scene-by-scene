import { cn } from "@/lib/cn";

const SIZES = {
  sm: { mark: "h-7 w-7 rounded-[9px] text-[15px]", word: "text-lg" },
  md: { mark: "h-9 w-9 rounded-[11px] text-[19px]", word: "text-[22px]" },
  lg: { mark: "h-12 w-12 rounded-[15px] text-2xl", word: "text-3xl" },
} as const;

export type TextoryLogoProps = {
  size?: keyof typeof SIZES;
  /** Hide the wordmark and show the glyph only. */
  markOnly?: boolean;
  className?: string;
};

export function TextoryLogo({
  size = "md",
  markOnly = false,
  className,
}: TextoryLogoProps) {
  const scale = SIZES[size];

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className={cn(
          "grid place-items-center bg-gradient-to-br from-iris-400 to-iris-700 font-display font-bold text-white shadow-[0_6px_20px_-6px_rgba(124,58,237,0.9)]",
          scale.mark,
        )}
      >
        T
      </span>
      {markOnly ? (
        <span className="sr-only">Textory</span>
      ) : (
        <span
          className={cn(
            "font-display font-semibold tracking-tight text-mist-100",
            scale.word,
          )}
        >
          Textory
        </span>
      )}
    </span>
  );
}
