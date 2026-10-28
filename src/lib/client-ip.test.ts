import { describe, expect, it } from "vitest";
import { getTrustedClientIp } from "./client-ip";

function headers(values: Record<string, string>) {
  return {
    get(name: string) {
      return values[name.toLowerCase()] ?? null;
    },
  };
}

describe("getTrustedClientIp", () => {
  it("prefers the platform real IP over a spoofed forwarded list", () => {
    expect(
      getTrustedClientIp(
        headers({
          "x-real-ip": "203.0.113.10",
          "x-forwarded-for": "127.0.0.1, 203.0.113.10",
        })
      )
    ).toBe("203.0.113.10");
  });

  it("uses the last forwarded hop when no real IP is present", () => {
    expect(
      getTrustedClientIp(
        headers({
          "x-forwarded-for": "1.2.3.4, 203.0.113.8",
        })
      )
    ).toBe("203.0.113.8");
  });
});
