import type { ReactNode } from "react";
import { X } from "lucide-react";
import { IconButton } from "./IconButton";

interface DialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Dialog({ open, title, onClose, children, footer }: DialogProps) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-lg border-2 border-navy-800 bg-white shadow-raised"
      >
        <div className="flex items-center justify-between border-b border-cream-200 px-6 py-4">
          <div className="font-display text-xl text-navy-800">{title}</div>
          <IconButton icon={X} label="Close" variant="ghost" size={32} onClick={onClose} />
        </div>
        <div className="px-6 py-5 text-base leading-relaxed text-ink-900">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2.5 border-t border-cream-200 bg-cream-100 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
