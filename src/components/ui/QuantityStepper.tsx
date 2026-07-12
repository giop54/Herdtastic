interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  onChange: (value: number) => void;
  className?: string;
}

export function QuantityStepper({
  value,
  min = 1,
  max = 999,
  unit,
  onChange,
  className = "",
}: QuantityStepperProps) {
  const set = (next: number) => onChange(Math.min(max, Math.max(min, next)));
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full border border-tan-300 bg-white px-1 ${className}`}
    >
      <button
        type="button"
        aria-label="Decrease"
        className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-lg leading-none text-navy-800 disabled:opacity-30"
        onClick={() => set(value - 1)}
        disabled={value <= min}
      >
        &minus;
      </button>
      <span className="min-w-[40px] text-center font-condensed text-base font-semibold text-ink-900">
        {value}
        {unit && <span className="ml-0.5 text-xs font-normal text-ink-400">{unit}</span>}
      </span>
      <button
        type="button"
        aria-label="Increase"
        className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-lg leading-none text-navy-800 disabled:opacity-30"
        onClick={() => set(value + 1)}
        disabled={value >= max}
      >
        +
      </button>
    </span>
  );
}
