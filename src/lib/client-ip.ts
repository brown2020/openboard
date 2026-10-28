type HeaderReader = { get(name: string): string | null };

function isPlausibleIp(value: string): boolean {
  if (!value || value.length > 64) return false;
  if (value.toLowerCase() === "unknown") return false;
  return /^[a-fA-F0-9:.]+$/.test(value);
}

function lastForwardedIp(header: string | null): string | null {
  if (!header) return null;
  const parts = header
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const last = parts[parts.length - 1];
  return last && isPlausibleIp(last) ? last : null;
}

/**
 * Client IP for rate limits.
 * Prefer the platform-set `x-real-ip`. Otherwise use the last
 * `x-forwarded-for` hop, which is the address a proxy appended.
 */
export function getTrustedClientIp(headers: HeaderReader): string {
  const realIp = headers.get("x-real-ip")?.trim() ?? "";
  if (isPlausibleIp(realIp)) return realIp;

  return (
    lastForwardedIp(headers.get("x-vercel-forwarded-for")) ??
    lastForwardedIp(headers.get("x-forwarded-for")) ??
    "unknown"
  );
}
