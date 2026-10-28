import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyFirebaseSessionJwt } from "./firebase-session-jwt";

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
const cert = publicKey.export({ type: "spki", format: "pem" }).toString();

function token(payload: Record<string, unknown>, header: Record<string, unknown> = {}) {
  const encodedHeader = Buffer.from(
    JSON.stringify({ alg: "RS256", kid: "test", ...header })
  ).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.sign("RSA-SHA256", Buffer.from(data), privateKey).toString("base64url");
  return `${data}.${signature}`;
}

const validPayload = {
  exp: 2_000_000_000,
  aud: "proj",
  iss: "https://session.firebase.google.com/proj",
  sub: "user-1",
};

describe("verifyFirebaseSessionJwt", () => {
  it("accepts a signed session cookie and rejects bad claims", async () => {
    const getCerts = async () => ({ test: cert });
    await expect(
      verifyFirebaseSessionJwt(token(validPayload), {
        projectId: "proj",
        nowMs: 1_700_000_000_000,
        getCerts,
      })
    ).resolves.toBe(true);

    await expect(
      verifyFirebaseSessionJwt(token({ ...validPayload, aud: "other" }), {
        projectId: "proj",
        nowMs: 1_700_000_000_000,
        getCerts,
      })
    ).resolves.toBe(false);

    await expect(
      verifyFirebaseSessionJwt(token(validPayload, { alg: "none" }), {
        projectId: "proj",
        nowMs: 1_700_000_000_000,
        getCerts,
      })
    ).resolves.toBe(false);
  });
});
