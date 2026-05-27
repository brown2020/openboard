import { AUTH_ROUTES, PROTECTED_ROUTES } from "@/lib/routes";

/** API route prefixes that require an authenticated session cookie. */
export const AUTHENTICATED_API_PREFIXES = [
  "/api/ai/",
  "/api/boards/privacy",
] as const;

/**
 * Match a pathname against a route prefix using segment boundaries.
 * `/board` matches `/board/123` but not `/boards` or `/boardroom`.
 */
export function matchesRoutePrefix(pathname: string, routePrefix: string): boolean {
  if (pathname === routePrefix) return true;
  return pathname.startsWith(`${routePrefix}/`);
}

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => matchesRoutePrefix(pathname, route));
}

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => matchesRoutePrefix(pathname, route));
}

export function isAuthenticatedApiRoute(pathname: string): boolean {
  return AUTHENTICATED_API_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
}

export type ProxyDecision =
  | { action: "next"; clearAuthCookie?: boolean }
  | { action: "redirect"; url: string; clearAuthCookie?: boolean }
  | { action: "json"; status: number; body: { error: string }; clearAuthCookie?: boolean };

/**
 * Pure proxy routing decision used by `src/proxy.ts` and unit tests.
 */
export function evaluateProxyRequest(input: {
  pathname: string;
  search: string;
  origin: string;
  isAuthenticated: boolean;
  shouldClearAuthCookie: boolean;
}): ProxyDecision {
  const { pathname, search, origin, isAuthenticated, shouldClearAuthCookie } =
    input;

  if (pathname.startsWith("/api/")) {
    if (isAuthenticatedApiRoute(pathname) && !isAuthenticated) {
      return {
        action: "json",
        status: 401,
        body: { error: "Unauthorized" },
        clearAuthCookie: shouldClearAuthCookie || undefined,
      };
    }

    return {
      action: "next",
      clearAuthCookie: shouldClearAuthCookie || undefined,
    };
  }

  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    return {
      action: "redirect",
      url: loginUrl.toString(),
      clearAuthCookie: shouldClearAuthCookie || undefined,
    };
  }

  if (isAuthRoute(pathname) && isAuthenticated) {
    return {
      action: "redirect",
      url: new URL("/boards", origin).toString(),
    };
  }

  return {
    action: "next",
    clearAuthCookie: shouldClearAuthCookie || undefined,
  };
}
