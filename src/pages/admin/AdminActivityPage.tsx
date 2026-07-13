import { useEffect, useState } from "react";
import { listAuditLog } from "../../api/admin";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { AdminPageHeader } from "./AdminLayout";
import type { AuditEntry } from "../../types";
import { DataPageSkeleton } from "../../components/ui";

export function AdminActivityPage() {
  const { describeError } = useAdminAuth();
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    listAuditLog(200)
      .then(setEntries)
      .catch((err) => setError(describeError(err)));
  }, [describeError]);

  if (error) return <p className="text-red-700">{error}</p>;

  return (
    <div>
      <AdminPageHeader title="Activity" />
      {!entries ? (
        <DataPageSkeleton />
      ) : entries.length === 0 ? (
        <p className="text-ink-600">No admin activity recorded yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-cream-200 bg-white shadow-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-tan-300 bg-cream-100 text-left font-condensed text-[11px] font-semibold uppercase tracking-caps text-ink-400">
                <th className="px-4 py-2.5">When</th>
                <th className="px-4 py-2.5">Who</th>
                <th className="px-4 py-2.5">Action</th>
                <th className="px-4 py-2.5">What</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="whitespace-nowrap px-4 py-2.5 text-xs tabular-nums text-ink-600">
                    {new Date(entry.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-ink-900">{entry.actor}</td>
                  <td className="px-4 py-2.5">
                    <code className="rounded-sm bg-cream-100 px-1.5 py-0.5 text-xs text-navy-800">
                      {entry.action}
                    </code>
                  </td>
                  <td className="px-4 py-2.5 text-ink-900">{entry.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
