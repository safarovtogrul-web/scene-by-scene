"use client";

import * as ToggleGroup from "@radix-ui/react-toggle-group";

import { cn } from "@/lib/cn";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

/**
 * A segmented control with a single indicator that slides between segments.
 *
 * Radix supplies roving focus and arrow-key navigation, so the whole control is
 * one tab stop rather than one per option. The indicator is positioned with
 * `inset-inline-start` and moved by a plain CSS transition: that keeps it
 * correct in RTL for free, and means the active segment is never mid-flight if
 * the tab is hidden while the value changes.
 */
export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  label,
  size = "md",
  className,
}: {
  value: T;
  onValueChange: (value: T) => void;
  options: ReadonlyArray<SegmentedOption<T>>;
  /** Accessible name for the whole group. */
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const activeIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  );
  const segment = `((100% - 6px) / ${options.length})`;

  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      aria-label={label}
      // A segmented control always has exactly one selection: ignore the
      // deselect event Radix emits when the active segment is pressed again.
      onValueChange={(next) => {
        if (next) onValueChange(next as T);
      }}
      className={cn(
        "relative inline-flex items-center rounded-full border border-white/[0.09] bg-white/[0.035] p-[3px]",
        className,
      )}
    >
      <span
        aria-hidden
        style={{
          width: `calc(${segment})`,
          insetInlineStart: `calc(3px + ${activeIndex} * ${segment})`,
        }}
        className={cn(
          "absolute top-[3px] bottom-[3px] rounded-full",
          "bg-gradient-to-b from-iris-500/35 to-iris-600/25 ring-1 ring-iris-400/45 ring-inset",
          "shadow-[0_6px_18px_-10px_rgba(124,58,237,0.95)]",
          "transition-[inset-inline-start] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
        )}
      />

      {options.map((option) => (
        <ToggleGroup.Item
          key={option.value}
          value={option.value}
          className={cn(
            "relative z-10 inline-flex flex-1 items-center justify-center rounded-full font-medium",
            "transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris-300",
            size === "sm" ? "h-8 px-4 text-[13px]" : "h-9 px-5 text-[14px]",
            option.value === value ? "text-mist-100" : "text-mist-400 hover:text-mist-200",
          )}
        >
          {option.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
