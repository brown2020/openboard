import crypto from "node:crypto";

const SESSION_CERT_URL =
  "https://www.googleapis.com/identitytoolkit/v3/relyingparty/publicKeys";

type CertMap = Record<string, string>;

let certCache: { expiresAt: number; certs: CertMap } | null = null;

export async function fetchFirebaseSessionCerts(
  fetchImpl: typeof fetch = fetch
): Promise<CertMap> {
  if (certCache && certCache.expiresAt > Date.now()) {
    return certCache.certs;
  }

  const response = await fetchImpl(SESSION_CERT_URL);
  if (!response.ok) {
    throw new Error("Unable to load Firebase session certificates");
  }

  const certs = (await response.json()) as CertMap;
  const cacheControl = response.headers.get("cache-control") ?? "";
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAgeSeconds = maxAgeMatch ? Number(maxAgeMatch[1]) : 3600;
  certCache = {
    certs,
    expiresAt: Date.now() + Math.max(60, maxAgeSeconds) * 1000,
  };
  return certs;
}

function decodeJson(segment: string): Record<string, unknown> | null {
  try {
    return JSON.parse(Buffer.from(segment, "base64url").toString("utf8")) as Record<
      string,
      unknown
    >;
  } catch {
    return null;
  }
}

/**
 * Verify a Firebase session cookie signature, issuer, audience, and expiry.
 * Revocation is enforced later by the Admin SDK on API routes.
 */
export async function verifyFirebaseSessionJwt(
  token: string,
  options: {
    projectId: string;
    nowMs?: number;
    getCerts?: () => Promise<CertMap>;
  }
): Promise<boolean> {
  if (!options.projectId) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const header = decodeJson(parts[0]);
  const payload = decodeJson(parts[1]);
  if (!header || !payload) return false;
  if (header.alg !== "RS256" || typeof header.kid !== "string") return false;

  const nowSeconds = Math.floor((options.nowMs ?? Date.now()) / 1000);
  if (typeof payload.exp !== "number" || nowSeconds > payload.exp + 30) {
    return false;
  }
  if (payload.aud !== options.projectId) return false;
  if (payload.iss !== `https://session.firebase.google.com/${options.projectId}`) {
    return false;
  }
  if (typeof payload.sub !== "string" || payload.sub.length === 0 || payload.sub.length > 128) {
    return false;
  }

  try {
    const certs = await (options.getCerts ?? fetchFirebaseSessionCerts)();
    const cert = certs[header.kid];
    if (!cert) return false;

    const verifier = crypto.createVerify("RSA-SHA256");
    verifier.update(`${parts[0]}.${parts[1]}`);
    verifier.end();
    return verifier.verify(cert, Buffer.from(parts[2], "base64url"));
  } catch {
    return false;
  }
}
