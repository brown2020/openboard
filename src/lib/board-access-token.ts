import crypto from "node:crypto";
import { base64urlEncode, base64urlEncodeJson, base64urlDecodeJson } from "./base64url";

const MAX_BOARDS = 20;

type AccessPayload = {
  exp: number;
  boards?: Record<string, number>;
  /** Legacy single-board tokens. */
  boardId?: string;
};

function sign(secret: string, payloadB64: string) {
  return base64urlEncode(
    crypto.createHmac("sha256", secret).update(payloadB64).digest()
  );
}

function readPayload(secret: string, token: string): AccessPayload | null {
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig || token.split(".").length !== 2) return null;

  const expectedSig = sign(secret, payloadB64);
  try {
    const actual = Buffer.from(sig);
    const expected = Buffer.from(expectedSig);
    if (actual.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(actual, expected)) return null;
  } catch {
    return null;
  }

  return base64urlDecodeJson<AccessPayload>(payloadB64);
}

function activeGrants(payload: AccessPayload | null, nowSeconds: number) {
  const grants: Record<string, number> = {};
  if (!payload) return grants;

  if (payload.boards) {
    for (const [boardId, exp] of Object.entries(payload.boards)) {
      if (typeof exp === "number" && exp > nowSeconds) grants[boardId] = exp;
    }
  }

  if (
    payload.boardId &&
    typeof payload.exp === "number" &&
    payload.exp > nowSeconds &&
    grants[payload.boardId] === undefined
  ) {
    grants[payload.boardId] = payload.exp;
  }

  return grants;
}

export function createBoardAccessToken(input: {
  secret: string;
  boardId: string;
  expiresInSeconds: number;
  existingToken?: string;
  nowSeconds?: number;
}): string {
  const nowSeconds = input.nowSeconds ?? Math.floor(Date.now() / 1000);
  const existing = input.existingToken
    ? readPayload(input.secret, input.existingToken)
    : null;
  const grants = activeGrants(existing, nowSeconds);
  grants[input.boardId] = nowSeconds + input.expiresInSeconds;

  const entries = Object.entries(grants)
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_BOARDS);
  const boards = Object.fromEntries(entries);
  const exp = Math.max(...entries.map(([, value]) => value));
  const payloadB64 = base64urlEncodeJson({ boards, exp });
  return `${payloadB64}.${sign(input.secret, payloadB64)}`;
}

export function verifyBoardAccessToken(input: {
  secret: string;
  token: string;
  boardId: string;
  nowSeconds?: number;
}): { ok: true } | { ok: false } {
  const payload = readPayload(input.secret, input.token);
  if (!payload) return { ok: false };
  const nowSeconds = input.nowSeconds ?? Math.floor(Date.now() / 1000);
  const exp = activeGrants(payload, nowSeconds)[input.boardId];
  if (typeof exp !== "number" || nowSeconds >= exp) return { ok: false };
  return { ok: true };
}
