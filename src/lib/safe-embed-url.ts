import { isBlockedEmbedHost, normalizeHostname } from "@/lib/public-host";

const PROVIDER_HOSTS: Record<string, string[]> = {
  youtube: ["youtube.com", "youtube-nocookie.com"],
  vimeo: ["vimeo.com", "player.vimeo.com"],
  loom: ["loom.com"],
  spotify: ["open.spotify.com"],
  twitter: ["twitter.com", "x.com", "platform.twitter.com"],
  instagram: ["instagram.com"],
  cal: ["cal.com"],
  calendly: ["calendly.com"],
};

/** Sandbox without top-navigation or popup escape. */
export const EMBED_IFRAME_SANDBOX =
  "allow-scripts allow-same-origin allow-presentation allow-popups";

function hostAllowed(hostname: string, allowedHosts: string[]): boolean {
  const host = normalizeHostname(hostname);
  return allowedHosts.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`)
  );
}

export function sanitizeEmbedSrc(
  rawUrl: string,
  allowedHosts: string[],
  pageHostname?: string
): string {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return "";
  }

  if (parsed.protocol !== "https:") return "";
  if (parsed.username || parsed.password) return "";
  if (isBlockedEmbedHost(parsed.hostname)) return "";

  const host = normalizeHostname(parsed.hostname);
  if (pageHostname && host === normalizeHostname(pageHostname)) return "";
  if (!hostAllowed(host, allowedHosts)) return "";

  return parsed.toString();
}

export function sanitizeProviderEmbed(
  rawUrl: string,
  provider: string,
  pageHostname?: string
): string {
  const hosts = PROVIDER_HOSTS[provider];
  if (!hosts) {
    return sanitizeCustomEmbed(rawUrl, pageHostname);
  }
  return sanitizeEmbedSrc(rawUrl, hosts, pageHostname);
}

export function sanitizeCustomEmbed(
  rawUrl: string,
  pageHostname?: string
): string {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return "";
  }
  if (parsed.protocol !== "https:") return "";
  if (parsed.username || parsed.password) return "";
  if (isBlockedEmbedHost(parsed.hostname)) return "";
  const host = normalizeHostname(parsed.hostname);
  if (pageHostname && host === normalizeHostname(pageHostname)) return "";
  if (host.includes(":") || /^(\d{1,3}\.){3}\d{1,3}$/.test(host)) return "";
  return parsed.toString();
}
