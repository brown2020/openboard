"use client";

import { User } from "firebase/auth";

type InFlightSync = { key: string; promise: Promise<void> } | null;
let inFlightSync: InFlightSync = null;

/**
 * Single-flight key for session cookie sync.
 * A persisted user can start a sync with a stale ID token before password
 * sign-in finishes. That request must not be reused for the new token.
 */
export function sessionSyncKey(uid: string | null, token: string | null): string {
  if (!uid || !token) return "signed-out";
  return `${uid}:${token}`;
}

async function errorMessage(res: Response, fallback: string): Promise<string> {
  const payload = (await res.json().catch(() => null)) as { error?: string } | null;
  return payload?.error || fallback;
}

async function syncAuthSessionCookieOnce(
  user: User | null,
  token: string | null
): Promise<void> {
  if (user) {
    const idToken = token ?? (await user.getIdToken());
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) {
      throw new Error(await errorMessage(res, "Failed to create session"));
    }
    return;
  }

  const res = await fetch("/api/auth/session", { method: "DELETE" });
  if (!res.ok) {
    throw new Error(await errorMessage(res, "Failed to delete session"));
  }
}

/**
 * Sync the server session cookie with the current Firebase user.
 * In-flight calls are shared only when they post the same ID token.
 */
export async function syncAuthSessionCookie(
  user: User | null,
  options?: { forceRefresh?: boolean }
): Promise<void> {
  const token = user ? await user.getIdToken(options?.forceRefresh ?? false) : null;
  const key = sessionSyncKey(user?.uid ?? null, token);

  if (inFlightSync?.key === key) {
    return inFlightSync.promise;
  }

  const promise = syncAuthSessionCookieOnce(user, token).finally(() => {
    if (inFlightSync?.promise === promise) {
      inFlightSync = null;
    }
  });

  inFlightSync = { key, promise };
  return promise;
}

export const setAuthCookie = syncAuthSessionCookie;

export const removeAuthCookie = () => {
  fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
};
