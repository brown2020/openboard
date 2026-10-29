import { describe, expect, it } from "vitest";
import { sessionSyncKey } from "./auth-cookie";

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
