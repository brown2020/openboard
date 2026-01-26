import "server-only";

/**
 * Shared base64url encoding/decoding utilities (RFC 4648).
 * Used for password hashing, JWT parsing, and board access tokens.
 */

export function base64urlEncode(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function base64urlDecodeToBuffer(input: string): Buffer {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return Buffer.from(padded, "base64");
}

export function base64urlEncodeJson(obj: unknown): string {
  return base64urlEncode(Buffer.from(JSON.stringify(obj), "utf8"));
}

export function base64urlDecodeJson<T>(input: string): T | null {
  try {
    const raw = base64urlDecodeToBuffer(input).toString("utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
