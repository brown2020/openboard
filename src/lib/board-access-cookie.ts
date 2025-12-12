import "server-only";

import crypto from "node:crypto";

const COOKIE_NAME = "openboard_board_access";

function getSecret(): string {
  const secret = process.env.OPENBOARD_COOKIE_SECRET;
  if (!secret) {
    throw new Error(
      "Missing OPENBOARD_COOKIE_SECRET. Set it in .env.local to enable password-protected boards."
    );
  }
  return secret;
}

function base64urlEncode(buf: Buffer) {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64urlEncodeJson(obj: unknown) {
  return base64urlEncode(Buffer.from(JSON.stringify(obj), "utf8"));
}

function base64urlDecodeJson<T>(input: string): T | null {
  try {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const raw = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function sign(payloadB64: string) {
  return base64urlEncode(
    crypto.createHmac("sha256", getSecret()).update(payloadB64).digest()
  );
}

export function getBoardAccessCookieName() {
  return COOKIE_NAME;
}

export function createBoardAccessToken(boardId: string, expiresInSeconds: number) {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload = { boardId, exp };
  const payloadB64 = base64urlEncodeJson(payload);
  const sig = sign(payloadB64);
  return `${payloadB64}.${sig}`;
}

export function verifyBoardAccessToken(
  token: string,
  boardId: string
): { ok: true } | { ok: false } {
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return { ok: false };

  const expectedSig = sign(payloadB64);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length) return { ok: false };
    if (!crypto.timingSafeEqual(a, b)) return { ok: false };
  } catch {
    return { ok: false };
  }

  const payload = base64urlDecodeJson<{ boardId: string; exp: number }>(payloadB64);
  if (!payload) return { ok: false };
  if (payload.boardId !== boardId) return { ok: false };
  if (typeof payload.exp !== "number") return { ok: false };
  if (Math.floor(Date.now() / 1000) >= payload.exp) return { ok: false };

  return { ok: true };
}


