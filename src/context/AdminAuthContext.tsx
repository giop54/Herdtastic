import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { clearAdminKey, getAdminKey, setAdminKey, verifyAdminKey } from "../api/admin";
import { ApiError } from "../api/client";

interface AdminAuthValue {
  authenticated: boolean;
  login: (key: string) => Promise<void>;
  logout: () => void;
  /** Normalizes an unknown error to a message; a 401 also signs the admin out. */
  describeError: (err: unknown) => string;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(() => Boolean(getAdminKey()));

  const login = useCallback(async (key: string) => {
    await verifyAdminKey(key);
    setAdminKey(key);
    setAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    clearAdminKey();
    setAuthenticated(false);
  }, []);

  const describeError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          logout();
          return "Your admin session expired. Sign in again.";
        }
        return err.message;
      }
      return err instanceof Error ? err.message : "Something went wrong.";
    },
    [logout],
  );

  return (
    <AdminAuthContext.Provider value={{ authenticated, login, logout, describeError }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
