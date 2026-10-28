import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { FIREBASE_AUTH_COOKIE } from "@/lib/auth-constants";
import { verifyFirebaseSessionJwt } from "@/lib/firebase-session-jwt";
import { evaluateProxyRequest } from "@/lib/route-match";

/**
 * Next.js 16 Proxy for Authentication & Route Protection
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get(FIREBASE_AUTH_COOKIE)?.value;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const isAuthenticated = authCookie
    ? await verifyFirebaseSessionJwt(authCookie, { projectId: projectId ?? "" })
    : false;
  const shouldClearAuthCookie = !!authCookie && !isAuthenticated;

  const decision = evaluateProxyRequest({
    pathname,
    search: request.nextUrl.search,
    origin: request.nextUrl.origin,
    isAuthenticated,
    shouldClearAuthCookie,
  });

  switch (decision.action) {
    case "json": {
      const res = NextResponse.json(decision.body, { status: decision.status });
      if (decision.clearAuthCookie) {
        res.cookies.delete(FIREBASE_AUTH_COOKIE);
      }
      return res;
    }
    case "redirect": {
      const res = NextResponse.redirect(decision.url);
      if (decision.clearAuthCookie) {
        res.cookies.delete(FIREBASE_AUTH_COOKIE);
      }
      return res;
    }
    case "next":
    default: {
      const res = NextResponse.next();
      if (decision.clearAuthCookie) {
        res.cookies.delete(FIREBASE_AUTH_COOKIE);
      }
      return res;
    }
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
