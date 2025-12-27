import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_ROUTES, PROTECTED_ROUTES } from "@/lib/routes";
import { FIREBASE_AUTH_COOKIE } from "@/lib/auth-constants";

/**
 * Next.js 16 Proxy for Authentication & Route Protection
 *
 * This proxy handles:
 * - Protected route authentication
 * - Redirect logic for authenticated/unauthenticated users
 * - API route protection
 */

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the Firebase auth cookie
  const authCookie = request.cookies.get(FIREBASE_AUTH_COOKIE)?.value;
  const isExpired = authCookie ? isJwtExpired(authCookie) : false;
  const shouldClearAuthCookie = !!authCookie && isExpired;
  const isAuthenticated = !!authCookie && !isExpired;

  // Check if the current path matches protected routes
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current path is an auth route (login/signup)
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // API routes protection (except for public APIs)
  if (pathname.startsWith("/api/")) {
    // AI routes require authentication
    if (pathname.startsWith("/api/ai/")) {
      if (!isAuthenticated) {
        const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (shouldClearAuthCookie) {
          res.cookies.delete(FIREBASE_AUTH_COOKIE);
        }
        return res;
      }
    }
    // Allow other API routes to pass through
    const res = NextResponse.next();
    if (shouldClearAuthCookie) {
      res.cookies.delete(FIREBASE_AUTH_COOKIE);
    }
    return res;
  }

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    // Preserve query string so post-login navigation doesn't lose context.
    loginUrl.searchParams.set("redirect", `${pathname}${request.nextUrl.search}`);
    const res = NextResponse.redirect(loginUrl);
    if (shouldClearAuthCookie) {
      res.cookies.delete(FIREBASE_AUTH_COOKIE);
    }
    return res;
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/boards", request.url));
  }

  const res = NextResponse.next();
  if (shouldClearAuthCookie) {
    res.cookies.delete(FIREBASE_AUTH_COOKIE);
  }
  return res;
}

function isJwtExpired(token: string): boolean {
  const exp = getJwtExp(token);
  if (!exp) return false;
  // Apply a small clock skew buffer (30s) to avoid edge timing flaps.
  const nowMs = Date.now();
  const expMs = exp * 1000;
  return nowMs >= expMs - 30_000;
}

function getJwtExp(token: string): number | null {
  // JWT: header.payload.signature
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

function decodeBase64Url(input: string): string | null {
  // Convert from base64url -> base64
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  // Pad
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  try {
    // `atob` exists in Edge/Web runtimes; `Buffer` exists in Node.
    if (typeof globalThis.atob === "function") {
      return globalThis.atob(padded);
    }
    // eslint-disable-next-line no-undef
    return Buffer.from(padded, "base64").toString("utf8");
  } catch {
    return null;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
