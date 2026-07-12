import { formatCents } from "../../lib/money";

interface PriceTagProps {
  cents: number;
  currency?: string;
  unit?: string;
  size?: "sm" | "md" | "lg";
  compareAtCents?: number;
  className?: string;
}

const sizeClasses: Record<NonNullable<PriceTagProps["size"]>, string> = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-3xl",
};

export function PriceTag({
  cents,
  currency = "usd",
  unit,
  size = "md",
  compareAtCents,
  className = "",
}: PriceTagProps) {
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className={`font-display leading-none text-red-700 ${sizeClasses[size]}`}>
        {formatCents(cents, currency)}
      </span>
      {unit && (
        <span className="font-condensed text-xs uppercase tracking-caps text-ink-600">{unit}</span>
      )}
      {compareAtCents != null && (
        <span className="text-sm text-ink-400 line-through">
          {formatCents(compareAtCents, currency)}
        </span>
      )}
    </span>
  );
}
