interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "alert";
}

export function StatCard({ label, value, sub, tone = "default" }: StatCardProps) {
  return (
    <div className="rounded-md border border-cream-200 bg-white px-4 py-3 shadow-card">
      <div className="font-condensed text-[11px] font-semibold uppercase tracking-caps text-ink-400">
        {label}
      </div>
      <div
        className={`font-display text-2xl leading-tight tabular-nums ${
          tone === "alert" ? "text-red-700" : "text-ink-900"
        }`}
      >
        {value}
      </div>
      {sub && <div className="text-xs text-ink-600">{sub}</div>}
    </div>
  );
}
