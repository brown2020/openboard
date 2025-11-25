import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 Proxy for Authentication & Route Protection
 * 
 * This proxy handles:
 * - Protected route authentication
 * - Redirect logic for authenticated/unauthenticated users
 * - API route protection
 */

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/boards",
  "/board",
  "/templates",
];

// Routes only accessible when NOT authenticated
const authRoutes = ["/login", "/signup", "/reset-password"];

// Public routes that bypass all checks
const publicRoutes = ["/", "/u"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the Firebase auth cookie
  const authCookie = request.cookies.get("firebaseAuth")?.value;
  const isAuthenticated = !!authCookie;

  // Check if the current path matches protected routes
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname.startsWith(route)
  );

  // Check if the current path is an auth route (login/signup)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/u/")
  );

  // API routes protection (except for public APIs)
  if (pathname.startsWith("/api/")) {
    // AI routes require authentication
    if (pathname.startsWith("/api/ai/")) {
      if (!authCookie) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }
    // Allow other API routes to pass through
    return NextResponse.next();
  }

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/boards", request.url));
  }

  return NextResponse.next();
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

