interface BrandMedallionProps {
  className?: string;
  decorative?: boolean;
  priority?: boolean;
}

export function BrandMedallion({
  className = "",
  decorative = false,
  priority = false,
}: BrandMedallionProps) {
  return (
    <span
      className={`relative block aspect-square overflow-hidden rounded-full bg-white ${className}`}
    >
      <img
        src="/brand/herdtastic-medallion.png"
        alt={decorative ? "" : "Herdtastic Texas All-American Cattle Co."}
        aria-hidden={decorative || undefined}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="absolute left-1/2 top-0 h-[112%] w-auto max-w-none -translate-x-1/2"
      />
    </span>
  );
}
