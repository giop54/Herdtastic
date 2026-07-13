import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle, Info, X, type LucideIcon } from "lucide-react";

type Tone = "success" | "info" | "danger";

const toneIcon: Record<Tone, LucideIcon> = {
  success: CheckCircle,
  info: Info,
  danger: AlertTriangle,
};

const toneColor: Record<Tone, string> = {
  success: "text-[var(--status-success)]",
  info: "text-[var(--status-info)]",
  danger: "text-red-600",
};

interface ToastProps {
  tone?: Tone;
  children: ReactNode;
  action?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function Toast({
  tone = "success",
  children,
  action,
  onAction,
  onDismiss,
  className = "",
}: ToastProps) {
  const IconComp = toneIcon[tone];
  return (
    <div
      className={`inline-flex items-center gap-3 rounded-md bg-navy-900 px-[18px] py-3 font-body text-sm text-cream-50 shadow-raised ${className}`}
      role={tone === "danger" ? "alert" : "status"}
      aria-live={tone === "danger" ? "assertive" : "polite"}
    >
      <span className={`inline-flex shrink-0 ${toneColor[tone]}`}>
        <IconComp size={18} />
      </span>
      <span className="min-w-0 flex-1">{children}</span>
      {action && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="min-h-11 shrink-0 font-condensed text-xs font-semibold uppercase tracking-caps text-cream-100 underline underline-offset-4"
        >
          {action}
        </button>
      )}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="grid min-h-11 min-w-11 shrink-0 place-items-center rounded text-cream-100 transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream-50"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
