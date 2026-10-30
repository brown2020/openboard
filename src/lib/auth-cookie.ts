"use client";

import { User } from "firebase/auth";

/** Skip another POST while this user's cookie was just created. */
export const SESSION_SYNC_REUSE_MS = 12 * 60 * 60 * 1000;

type InFlightSync = { uid: string; promise: Promise<void> } | null;

let backgroundSync: InFlightSync = null;
let forcedSync: InFlightSync = null;
let established: { uid: string; at: number } | null = null;
let sessionEpoch = 0;

/**
 * Single-flight key for session cookie sync.
 * A persisted user can start a sync with a stale ID token before password
 * sign-in finishes. That request must not be reused for the new token.
 */
export function sessionSyncKey(uid: string | null, token: string | null): string {
  if (!uid || !token) return "signed-out";
  return `${uid}:${token}`;
}

export function shouldSkipEstablishedSession(input: {
  uid: string;
  forceRefresh: boolean;
  establishedUid: string | null;
  establishedAt: number | null;
  now: number;
  reuseMs: number;
}): boolean {
  if (input.forceRefresh) return false;
  if (!input.establishedUid || input.establishedUid !== input.uid) return false;
  if (input.establishedAt == null) return false;
  return input.now - input.establishedAt < input.reuseMs;
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
 * A successful sync is reused across navigations. A password sign-in still
 * mints with a fresh token and does not wait on an older in-flight request.
 */
export async function syncAuthSessionCookie(
  user: User | null,
  options?: { forceRefresh?: boolean }
): Promise<void> {
  const forceRefresh = options?.forceRefresh ?? false;

  if (!user) {
    sessionEpoch += 1;
    established = null;
    return syncAuthSessionCookieOnce(null, null);
  }

  if (
    shouldSkipEstablishedSession({
      uid: user.uid,
      forceRefresh,
      establishedUid: established?.uid ?? null,
      establishedAt: established?.at ?? null,
      now: Date.now(),
      reuseMs: SESSION_SYNC_REUSE_MS,
    })
  ) {
    return;
  }

  if (forcedSync?.uid === user.uid) {
    return forcedSync.promise;
  }
  if (!forceRefresh && backgroundSync?.uid === user.uid) {
    return backgroundSync.promise;
  }

  const epoch = sessionEpoch;
  const promise = (async () => {
    const token = await user.getIdToken(forceRefresh);
    await syncAuthSessionCookieOnce(user, token);
    if (epoch === sessionEpoch) {
      established = { uid: user.uid, at: Date.now() };
    }
  })().finally(() => {
    if (forceRefresh) {
      if (forcedSync?.promise === promise) forcedSync = null;
    } else if (backgroundSync?.promise === promise) {
      backgroundSync = null;
    }
  });

  if (forceRefresh) {
    forcedSync = { uid: user.uid, promise };
  } else {
    backgroundSync = { uid: user.uid, promise };
  }
  return promise;
}

export const setAuthCookie = syncAuthSessionCookie;

export const removeAuthCookie = () => {
  sessionEpoch += 1;
  established = null;
  fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
};
