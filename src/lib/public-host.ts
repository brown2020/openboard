/**
 * Host checks for server-side fetches and third-party embeds.
 * Blocks loopback, link-local, unique-local, and cloud-metadata names.
 */

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata.goog",
]);

const BLOCKED_SUFFIXES = [
  ".local",
  ".localhost",
  ".internal",
  ".localdomain",
  ".nip.io",
  ".sslip.io",
  ".xip.io",
  ".localtest.me",
];

export function normalizeHostname(hostname: string): string {
  let host = hostname.trim().toLowerCase();
  if (host.startsWith("[") && host.endsWith("]")) {
    host = host.slice(1, -1);
  }
  if (host.endsWith(".")) {
    host = host.slice(0, -1);
  }
  return host;
}

export function isBlockedHostname(hostname: string): boolean {
  const host = normalizeHostname(hostname);
  if (!host) return true;
  if (BLOCKED_HOSTNAMES.has(host)) return true;
  return BLOCKED_SUFFIXES.some(
    (suffix) => host.endsWith(suffix) || host === suffix.slice(1)
  );
}

function isIpv4Literal(hostname: string): boolean {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
}

function ipv4Parts(hostname: string): number[] | null {
  if (!isIpv4Literal(hostname)) return null;
  const parts = hostname.split(".").map(Number);
  if (parts.some((part) => part > 255)) return null;
  return parts;
}

/** True for non-routable, private, link-local, and reserved IPv4 addresses. */
export function isNonGlobalIpv4(hostname: string): boolean {
  const parts = ipv4Parts(hostname);
  if (!parts) return false;
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 192 && b === 0) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a === 198 && b === 51) return true;
  if (a === 203 && b === 0) return true;
  if (a >= 224) return true;
  return false;
}

function ipv6ToBigInt(hostname: string): bigint | null {
  let host = normalizeHostname(hostname);
  if (host.includes("%")) return null;

  const dotted = host.match(/^(.*:)(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (dotted) {
    const parts = ipv4Parts(dotted[2]);
    if (!parts) return null;
    const high = ((parts[0] << 8) | parts[1]).toString(16);
    const low = ((parts[2] << 8) | parts[3]).toString(16);
    host = `${dotted[1]}${high}:${low}`;
  }

  const halves = host.split("::");
  if (halves.length > 2) return null;

  const expand = (part: string) => (part ? part.split(":") : []);
  let groups: string[];
  if (halves.length === 2) {
    const left = expand(halves[0]);
    const right = expand(halves[1]);
    if (left.length + right.length > 8) return null;
    groups = [
      ...left,
      ...Array(8 - left.length - right.length).fill("0"),
      ...right,
    ];
  } else {
    groups = expand(host);
    if (groups.length !== 8) return null;
  }

  if (groups.some((group) => !/^[0-9a-f]{1,4}$/.test(group))) return null;
  return groups.reduce(
    (value, group) => (value << BigInt(16)) + BigInt(parseInt(group, 16)),
    BigInt(0)
  );
}

function isNonGlobalIpv6(address: bigint): boolean {
  if (address === BigInt(0) || address === BigInt(1)) return true;

  const top8 = Number(address >> BigInt(120));
  const top10 = Number(address >> BigInt(118));
  if ((top8 & 0xfe) === 0xfc) return true;
  if (top10 === 0x3fa || top10 === 0x3fb) return true;
  if (top8 === 0xff) return true;
  if (Number(address >> BigInt(96)) === 0x20010db8) return true;

  // IPv4-mapped ::ffff:0:0/96
  if (address >> BigInt(32) === BigInt(0xffff)) {
    const v4 = Number(address & BigInt(0xffffffff));
    const dotted = [
      (v4 >>> 24) & 255,
      (v4 >>> 16) & 255,
      (v4 >>> 8) & 255,
      v4 & 255,
    ].join(".");
    return isNonGlobalIpv4(dotted);
  }

  return false;
}

export function isBlockedIp(address: string): boolean {
  const host = normalizeHostname(address);
  if (host.includes(":")) {
    const parsed = ipv6ToBigInt(host);
    if (parsed === null) return true;
    return isNonGlobalIpv6(parsed);
  }
  if (isIpv4Literal(host)) return isNonGlobalIpv4(host);
  return false;
}

export function isBlockedEmbedHost(hostname: string): boolean {
  const host = normalizeHostname(hostname);
  if (isBlockedHostname(host)) return true;
  if (host.includes(":") || isIpv4Literal(host)) return isBlockedIp(host);
  return false;
}
