import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const sizeClasses: Record<Size, string> = {
  sm: "px-3.5 py-2 text-xs",
  md: "px-5 py-3 text-[13px]",
  lg: "px-7 py-4 text-[15px]",
};

const variantClasses: Record<Variant, string> = {
  primary:
    "border-2 border-transparent bg-red-700 text-white shadow-hard hover:bg-red-800 hover:-translate-y-px active:bg-red-900 active:translate-y-0.5 active:shadow-hard-sm",
  secondary:
    "border-2 border-navy-800 bg-transparent text-navy-800 hover:bg-navy-50 active:bg-navy-100 active:scale-[0.98]",
  ghost: "border-2 border-transparent bg-transparent text-navy-800 hover:bg-cream-100 active:scale-[0.98]",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-sm font-condensed font-semibold uppercase tracking-caps transition duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
