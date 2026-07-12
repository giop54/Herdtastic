import { useId, type SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
}

export function Select({ label, options, id, className = "", ...rest }: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <label htmlFor={selectId} className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <span className="font-condensed text-xs font-semibold uppercase tracking-caps text-navy-800">
          {label}
        </span>
      )}
      <select
        id={selectId}
        className="cursor-pointer rounded-sm border border-tan-300 bg-white px-3 py-2.5 font-body text-base text-ink-900"
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
