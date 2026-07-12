import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
  variant?: "outline" | "ghost";
  size?: number;
  badge?: number;
}

export function IconButton({
  icon: IconComp,
  label,
  variant = "outline",
  size = 40,
  badge,
  className = "",
  style,
  ...rest
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`relative inline-flex cursor-pointer items-center justify-center rounded-md text-navy-800 transition duration-200 ease-out hover:bg-cream-100 active:scale-95 ${
        variant === "outline" ? "border border-tan-300 hover:border-navy-800" : "border border-transparent"
      } ${className}`}
      style={{ width: size, height: size, ...style }}
      {...rest}
    >
      <IconComp size={Math.round(size * 0.5)} strokeWidth={1.75} />
      {badge != null && badge !== 0 && (
        <span
          key={badge}
          className="absolute -right-1.5 -top-1.5 inline-flex h-[18px] min-w-[18px] animate-scale-in items-center justify-center rounded-full bg-red-700 px-1 font-body text-[11px] font-bold text-white shadow-sm"
        >
          {badge}
        </span>
      )}
    </button>
  );
}
