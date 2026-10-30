import { describe, expect, it } from "vitest";
import {
  canMintSessionCookie,
  SESSION_REUSE_MIN_TTL_SECONDS,
  sessionRequestPlan,
} from "./session-mint";

describe("canMintSessionCookie", () => {
  it("allows a fresh sign-in and a matching existing session", () => {
    expect(
      canMintSessionCookie({
        authTime: 1_000,
        nowSeconds: 1_100,
        hasMatchingSession: false,
      })
    ).toBe(true);
    expect(
      canMintSessionCookie({
        authTime: 1_000,
        nowSeconds: 10_000,
        hasMatchingSession: true,
      })
    ).toBe(true);
  });

  it("reuses a matching cookie until it is near expiry", () => {
    const nowSeconds = 1_000_000;
    expect(
      sessionRequestPlan({
        hasMatchingSession: true,
        sessionExpiresAtSeconds: nowSeconds + SESSION_REUSE_MIN_TTL_SECONDS + 1,
        nowSeconds,
      })
    ).toBe("reuse");
    expect(
      sessionRequestPlan({
        hasMatchingSession: true,
        sessionExpiresAtSeconds: nowSeconds + SESSION_REUSE_MIN_TTL_SECONDS,
        nowSeconds,
      })
    ).toBe("mint");
    expect(
      sessionRequestPlan({
        hasMatchingSession: false,
        sessionExpiresAtSeconds: nowSeconds + SESSION_REUSE_MIN_TTL_SECONDS + 1,
        nowSeconds,
      })
    ).toBe("mint");
  });

  it("rejects a stale token that is not refreshing an existing session", () => {
    expect(
      canMintSessionCookie({
        authTime: 1_000,
        nowSeconds: 1_000 + 5 * 60,
        hasMatchingSession: false,
      })
    ).toBe(false);
  });
});
