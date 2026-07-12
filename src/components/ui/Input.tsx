import { useId, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({ label, hint, error, id, className = "", ...rest }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <label htmlFor={inputId} className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <span className="font-condensed text-xs font-semibold uppercase tracking-caps text-navy-800">
          {label}
        </span>
      )}
      <input
        id={inputId}
        className={`rounded-sm border bg-white px-3 py-2.5 font-body text-base text-ink-900 outline-none focus:outline-2 focus:outline-navy-600 focus:outline-offset-1 ${
          error ? "border-red-700" : "border-tan-300"
        }`}
        {...rest}
      />
      {error ? (
        <span className="text-xs text-red-700">{error}</span>
      ) : hint ? (
        <span className="text-xs text-ink-400">{hint}</span>
      ) : null}
    </label>
  );
}
