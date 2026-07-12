import type { ApiErrorBody } from "../types";

// Browsers use the same-origin Vercel/Vite proxy by default. This avoids coupling the
// storefront to backend CORS configuration and keeps guest-token headers working in previews.
// An explicit absolute URL remains useful for non-Vercel deployments.
const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
export const API_BASE_URL = (configuredApiBaseUrl || "/api/v1").replace(/\/$/, "");

const GUEST_TOKEN_KEY = "herdtastic_guest_token";

export class ApiError extends Error {
  code: string;
  requestId: string;
  status: number;
  details: unknown[];

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiError";
    this.code = body.code;
    this.requestId = body.request_id;
    this.details = body.details;
    this.status = status;
  }
}

export function getGuestToken(): string | null {
  return localStorage.getItem(GUEST_TOKEN_KEY);
}

export function setGuestToken(token: string): void {
  localStorage.setItem(GUEST_TOKEN_KEY, token);
}

export function clearGuestToken(): void {
  localStorage.removeItem(GUEST_TOKEN_KEY);
}

type FirebaseIdTokenProvider = () => Promise<string | null>;

let firebaseIdTokenProvider: FirebaseIdTokenProvider | null = null;

export function setFirebaseIdTokenProvider(fn: FirebaseIdTokenProvider): void {
  firebaseIdTokenProvider = fn;
}

async function buildHeaders(hasBody: boolean): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }

  const firebaseToken = firebaseIdTokenProvider ? await firebaseIdTokenProvider() : null;
  if (firebaseToken) {
    headers.Authorization = `Bearer ${firebaseToken}`;
  } else {
    const guestToken = getGuestToken();
    if (guestToken) {
      headers["X-Guest-Token"] = guestToken;
    }
  }

  return headers;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await buildHeaders(Boolean(options.body));

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> | undefined) },
  });

  if (!res.ok) {
    let body: { error?: ApiErrorBody } | null = null;
    try {
      body = await res.json();
    } catch {
      // response had no JSON body
    }

    if (body?.error) {
      throw new ApiError(res.status, body.error);
    }

    throw new ApiError(res.status, {
      code: "UNKNOWN_ERROR",
      message: `Request failed with status ${res.status}`,
      request_id: res.headers.get("X-Request-ID") ?? "",
      details: [],
    });
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
