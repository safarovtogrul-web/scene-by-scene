import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/cn";

const BASE =
  "group relative inline-flex items-center justify-center gap-2.5 rounded-full font-semibold " +
  "transition-[transform,box-shadow,filter] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] " +
  "active:scale-[0.985] disabled:pointer-events-none disabled:opacity-40";

const VARIANTS = {
  /** Violet gradient pill — the one CTA per screen. */
  solid:
    "bg-gradient-to-r from-iris-600 to-iris-500 text-white shadow-cta hover:brightness-110 hover:shadow-[0_22px_50px_-14px_rgba(124,58,237,1)]",
  /** Quiet glass pill for secondary actions. */
  ghost:
    "border border-white/12 bg-white/[0.04] text-mist-100 backdrop-blur-md hover:border-iris-400/50 hover:bg-white/[0.07]",
} as const;

const SIZES = {
  sm: "h-10 px-5 text-sm",
  md: "h-12 px-6 text-[15px]",
  lg: "h-[58px] px-8 text-[17px]",
  block: "h-14 w-full px-6 text-base",
} as const;

type SharedProps = {
  children: ReactNode;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  className?: string;
};

type ButtonProps = SharedProps &
  Omit<ComponentPropsWithoutRef<"button">, "className" | "children"> & {
    href?: undefined;
  };

type AnchorProps = SharedProps & {
  href: string;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "className" | "children" | "href">;

export function PrimaryButton(props: ButtonProps | AnchorProps) {
  const {
    children,
    variant = "solid",
    size = "md",
    className,
    ...rest
  } = props;

  const classes = cn(BASE, VARIANTS[variant], SIZES[size], className);

  if ("href" in rest && rest.href) {
    const { href, ...anchorRest } = rest as AnchorProps;
    return (
      <Link href={href} className={classes} {...anchorRest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonProps)}>
      {children}
    </button>
  );
}

/** Arrow that nudges forward on hover — used inside the hero CTA. */
export function ArrowGlyph({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="none"
      className={cn(
        "h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-1",
        className,
      )}
    >
      <path
        d="M4 10h11M11 5.5 15.5 10 11 14.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
