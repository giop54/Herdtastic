import type { ReactNode } from "react";

type Tone = "navy" | "red" | "success" | "warning" | "neutral";

const toneClasses: Record<Tone, string> = {
  navy: "bg-navy-800 text-cream-50",
  red: "bg-red-700 text-white",
  success: "bg-[var(--status-success-bg)] text-[var(--status-success)]",
  warning: "bg-[var(--status-warning-bg)] text-[var(--status-warning)]",
  neutral: "bg-cream-200 text-ink-600",
};

export function Badge({
  tone = "navy",
  children,
  className = "",
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-condensed text-xs font-semibold uppercase tracking-caps ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
