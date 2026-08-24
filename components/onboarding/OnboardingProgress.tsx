import { cn } from "@/lib/cn";

export type OnboardingProgressProps = {
  /** 1-based. */
  step: number;
  total: number;
  className?: string;
};

export function OnboardingProgress({
  step,
  total,
  className,
}: OnboardingProgressProps) {
  const ratio = Math.min(Math.max(step / total, 0), 1);

  return (
    <div className={cn("w-full", className)}>
      <p className="text-[13px] font-medium tracking-wide text-mist-400">
        Step {step} of {total}
      </p>
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={step}
        aria-label={`Onboarding step ${step} of ${total}`}
        className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-white/10"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-iris-500 to-iris-300 shadow-glow transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}
