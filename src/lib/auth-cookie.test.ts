import { describe, expect, it } from "vitest";
import {
  SESSION_SYNC_REUSE_MS,
  sessionSyncKey,
  shouldSkipEstablishedSession,
} from "./auth-cookie";

describe("sessionSyncKey", () => {
  it("does not reuse a sync started with a different ID token", () => {
    const stale = sessionSyncKey("uid-1", "stale-token");
    const fresh = sessionSyncKey("uid-1", "fresh-token");
    expect(stale).not.toBe(fresh);
  });

  it("shares one sync for the same user and token", () => {
    expect(sessionSyncKey("uid-1", "token")).toBe(sessionSyncKey("uid-1", "token"));
  });

  it("uses one signed-out key", () => {
    expect(sessionSyncKey(null, null)).toBe("signed-out");
    expect(sessionSyncKey("uid-1", null)).toBe("signed-out");
  });
});

describe("shouldSkipEstablishedSession", () => {
  const now = 10_000_000;

  it("skips another sync for the same user inside the reuse window", () => {
    expect(
      shouldSkipEstablishedSession({
        uid: "uid-1",
        forceRefresh: false,
        establishedUid: "uid-1",
        establishedAt: now - 1_000,
        now,
        reuseMs: SESSION_SYNC_REUSE_MS,
      })
    ).toBe(true);
  });

  it("still syncs a fresh sign-in and a different user", () => {
    expect(
      shouldSkipEstablishedSession({
        uid: "uid-1",
        forceRefresh: true,
        establishedUid: "uid-1",
        establishedAt: now - 1_000,
        now,
        reuseMs: SESSION_SYNC_REUSE_MS,
      })
    ).toBe(false);
    expect(
      shouldSkipEstablishedSession({
        uid: "uid-2",
        forceRefresh: false,
        establishedUid: "uid-1",
        establishedAt: now - 1_000,
        now,
        reuseMs: SESSION_SYNC_REUSE_MS,
      })
    ).toBe(false);
  });
});
