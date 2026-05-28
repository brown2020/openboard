import { PROTECTED_ROUTES } from "@/lib/routes";
import { matchesRoutePrefix } from "@/lib/route-match";

const DEFAULT_REDIRECT = "/boards";

/** Internal paths users may be sent to after login/signup. */
const ALLOWED_REDIRECT_PREFIXES = [...PROTECTED_ROUTES, DEFAULT_REDIRECT] as const;

function isAllowedRedirectPath(path: string): boolean {
  return ALLOWED_REDIRECT_PREFIXES.some((route) =>
    matchesRoutePrefix(path, route)
  );
}

/**
 * Sanitize post-auth redirect targets to same-origin relative paths only.
 * Blocks open redirects (`//evil.com`, `\`, `@`, protocol-relative tricks).
 */
export function sanitizeRedirectPath(
  raw: string | null | undefined,
  fallback: string = DEFAULT_REDIRECT
): string {
  if (!raw) return fallback;

  let path = raw.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  if (path.includes("\\") || path.includes("@") || path.includes(":")) {
    return fallback;
  }
  if (/[\0\r\n]/.test(path)) return fallback;

  try {
    path = decodeURIComponent(path);
  } catch {
    return fallback;
  }

  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  if (path.includes("\\") || path.includes("@") || path.includes(":")) {
    return fallback;
  }
  if (/[\0\r\n]/.test(path)) return fallback;

  const queryIndex = path.indexOf("?");
  const pathOnly = queryIndex === -1 ? path : path.slice(0, queryIndex);
  const query = queryIndex === -1 ? "" : path.slice(queryIndex + 1);

  if (!isAllowedRedirectPath(pathOnly)) return fallback;
  return query ? `${pathOnly}?${query}` : pathOnly;
}
