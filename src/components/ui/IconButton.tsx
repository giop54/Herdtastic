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
      className={`relative inline-flex items-center justify-center rounded-sm text-navy-800 transition-colors duration-200 ease-out hover:bg-cream-100 ${
        variant === "outline" ? "border border-tan-300" : "border border-transparent"
      } ${className}`}
      style={{ width: size, height: size, ...style }}
      {...rest}
    >
      <IconComp size={Math.round(size * 0.5)} strokeWidth={1.75} />
      {badge != null && badge !== 0 && (
        <span className="absolute -right-1.5 -top-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-700 px-1 font-body text-[11px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}
