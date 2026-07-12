import type { ReactNode } from "react";
import { CheckCircle, Info, AlertTriangle, type LucideIcon } from "lucide-react";

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
  className?: string;
}

export function Toast({ tone = "success", children, action, onAction, className = "" }: ToastProps) {
  const IconComp = toneIcon[tone];
  return (
    <div
      className={`inline-flex items-center gap-3 rounded-md bg-navy-900 px-[18px] py-3 font-body text-sm text-cream-50 shadow-raised ${className}`}
    >
      <span className={`inline-flex ${toneColor[tone]}`}>
        <IconComp size={18} />
      </span>
      <span>{children}</span>
      {action && (
        <button
          onClick={onAction}
          className="font-condensed text-xs font-semibold uppercase tracking-caps text-cream-100 underline"
        >
          {action}
        </button>
      )}
    </div>
  );
}
