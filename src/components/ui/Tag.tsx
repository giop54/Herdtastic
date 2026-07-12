import type { ReactNode } from "react";

export function Tag({
  selected,
  onClick,
  children,
}: {
  selected?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 font-condensed text-sm font-medium tracking-wide transition-colors duration-200 ease-out ${
        selected
          ? "border-navy-800 bg-navy-800 text-cream-50"
          : "border-tan-300 bg-white text-navy-800 hover:bg-cream-100"
      }`}
    >
      {children}
    </button>
  );
}
