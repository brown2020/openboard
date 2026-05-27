import { describe, expect, it } from "vitest";
import { getJwtExp, isJwtExpired } from "@/lib/jwt-utils";

function makeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" }))
    .toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.signature`;
}

describe("jwt-utils", () => {
  it("reads exp from a JWT payload", () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const token = makeJwt({ exp });
    expect(getJwtExp(token)).toBe(exp);
  });

  it("treats malformed tokens as expired", () => {
    expect(isJwtExpired("not-a-jwt")).toBe(true);
    expect(getJwtExp("not-a-jwt")).toBeNull();
  });

  it("applies expiry with clock skew buffer", () => {
    const exp = Math.floor(Date.now() / 1000) + 20;
    const token = makeJwt({ exp });
    expect(isJwtExpired(token)).toBe(true);
  });

  it("accepts valid unexpired tokens", () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const token = makeJwt({ exp });
    expect(isJwtExpired(token)).toBe(false);
  });
});
