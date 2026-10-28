import { isBlockedEmbedHost, isBlockedIp, normalizeHostname } from "@/lib/public-host";

const ALLOWED_PORTS = new Set(["", "80", "443"]);

/**
 * Syntactic allowlist for form webhook targets.
 * DNS resolution is checked separately before the server fetches.
 */
export function isAllowedWebhookUrl(rawUrl: string): boolean {
  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return false;
  }

  if (parsed.username || parsed.password) return false;

  const expectedPort = parsed.protocol === "https:" ? "443" : "80";
  if (parsed.port && parsed.port !== expectedPort) return false;
  if (!ALLOWED_PORTS.has(parsed.port)) return false;

  const hostname = normalizeHostname(parsed.hostname);
  if (isBlockedEmbedHost(hostname)) return false;
  if (hostname.includes(":") && isBlockedIp(hostname)) return false;

  return true;
}
