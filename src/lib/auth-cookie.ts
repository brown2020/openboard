"use client";

import { User } from "firebase/auth";

type InFlightSync = { uid: string | null; promise: Promise<void> } | null;
let inFlightSync: InFlightSync = null;

async function syncAuthSessionCookieOnce(user: User | null): Promise<void> {
  if (user) {
    const token = await user.getIdToken();
    // Exchange for an HttpOnly session cookie (server-set).
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
    });
    if (!res.ok) {
      throw new Error("Failed to create session");
    }
    return;
  }

  // Remove the cookie if user is null (logged out)
  const res = await fetch("/api/auth/session", { method: "DELETE" });
  if (!res.ok) {
    throw new Error("Failed to delete session");
  }
}

/**
 * Sync the server session cookie with the current Firebase user.
 *
 * - Single-flight per user to avoid redundant parallel requests from:
 *   login/signup flows + `onIdTokenChanged` events.
 */
export async function syncAuthSessionCookie(user: User | null): Promise<void> {
  const uid = user?.uid ?? null;

  if (inFlightSync && inFlightSync.uid === uid) {
    return inFlightSync.promise;
  }

  const promise = syncAuthSessionCookieOnce(user).finally(() => {
    if (inFlightSync?.promise === promise) {
      inFlightSync = null;
    }
  });

  inFlightSync = { uid, promise };
  return promise;
}

// Backward-compatible name (preferred: `syncAuthSessionCookie`)
export const setAuthCookie = syncAuthSessionCookie;

// Remove the auth cookie (for logout)
export const removeAuthCookie = () => {
  // Best-effort.
  fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
};
