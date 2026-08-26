"use client";

import * as RadixSwitch from "@radix-ui/react-switch";

import { cn } from "@/lib/cn";

/**
 * Textory's switch. Radix supplies the button semantics, keyboard handling and
 * `aria-checked`; everything visual is ours, tuned to the violet accent ramp.
 */
export function Switch({
  checked,
  onCheckedChange,
  className,
  ...props
}: RadixSwitch.SwitchProps) {
  return (
    <RadixSwitch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        "group relative inline-flex h-6 w-[42px] shrink-0 cursor-pointer items-center rounded-full",
        "border border-white/[0.12] bg-white/[0.07] transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "data-[state=checked]:border-iris-400/60 data-[state=checked]:bg-iris-500/70",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris-300",
        className,
      )}
      {...props}
    >
      <RadixSwitch.Thumb
        className={cn(
          "pointer-events-none absolute top-1/2 block h-[18px] w-[18px] -translate-y-1/2 rounded-full",
          "bg-mist-100 shadow-[0_2px_6px_rgba(0,0,0,0.45)]",
          // Positioned on the inline axis rather than translated, so RTL is
          // handled by the writing direction instead of a mirrored override.
          "start-[3px] data-[state=checked]:start-[21px] data-[state=checked]:shadow-glow",
          "transition-[inset-inline-start] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
        )}
      />
    </RadixSwitch.Root>
  );
}
