export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-xs",
  md: "px-5 py-3 text-[13px]",
  lg: "px-7 py-4 text-[15px]",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-2 border-transparent bg-red-700 text-white shadow-soft hover:bg-red-800 hover:shadow-lift active:scale-[0.98] active:bg-red-900",
  secondary:
    "border-2 border-navy-800 bg-transparent text-navy-800 hover:bg-navy-50 active:scale-[0.98] active:bg-navy-100",
  ghost:
    "border-2 border-transparent bg-transparent text-navy-800 hover:bg-cream-100 active:scale-[0.98]",
};

export function buttonClassName(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className = "",
) {
  return `inline-flex min-h-11 cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-sm font-condensed font-semibold uppercase tracking-caps transition duration-200 ease-out ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
}
