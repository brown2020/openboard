function decodeBase64Url(input: string): string | null {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "="
  );

  try {
    if (typeof globalThis.atob === "function") {
      return globalThis.atob(padded);
    }
    return Buffer.from(padded, "base64").toString("utf8");
  } catch {
    return null;
  }
}

export function getJwtExp(token: string): number | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  const payloadJson = decodeBase64Url(parts[1]);
  if (!payloadJson) return null;

  try {
    const payload = JSON.parse(payloadJson) as { exp?: unknown };
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

/** Treat malformed tokens as expired. Applies a 30s clock-skew buffer. */
export function isJwtExpired(token: string, nowMs: number = Date.now()): boolean {
  const exp = getJwtExp(token);
  if (!exp) return true;
  const expMs = exp * 1000;
  return nowMs >= expMs - 30_000;
}
