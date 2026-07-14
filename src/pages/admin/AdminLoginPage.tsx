import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button, Input } from "../../components/ui";
import { Seo } from "../../components/Seo";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { ApiError } from "../../api/client";

export function AdminLoginPage() {
  const { authenticated, login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (authenticated) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!key.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      await login(key.trim());
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from && from.startsWith("/admin") ? from : "/admin", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("That password isn't right.");
      } else {
        setError(err instanceof Error ? err.message : "Could not reach the API.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-800 p-6">
      <Seo title="Admin sign in" description="Herdtastic back office." noindex />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border-2 border-navy-900 bg-white p-8 shadow-raised"
      >
        <div className="mb-1 flex items-center gap-2 font-display text-2xl text-navy-800">
          <Lock size={20} aria-hidden />
          Back office
        </div>
        <p className="mb-6 text-sm text-ink-600">
          Heard<span className="font-semibold text-red-700">tastic</span> admin. Enter the admin
          password to continue.
        </p>
        <Input
          label="Admin password"
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          error={error}
          autoFocus
          autoComplete="current-password"
        />
        <Button type="submit" disabled={busy || !key.trim()} className="mt-5 w-full">
          {busy ? "Checking…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
