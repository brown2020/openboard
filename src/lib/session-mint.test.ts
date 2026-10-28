import { describe, expect, it } from "vitest";
import { canMintSessionCookie } from "./session-mint";

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
