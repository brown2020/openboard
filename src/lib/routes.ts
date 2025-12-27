/**
 * Route constants used for auth + navigation decisions.
 *
 * Keep this file small and server-safe: it is imported by `src/proxy.ts`
 * (Next.js 16 request interception entry point).
 */

/** Routes that require authentication */
export const PROTECTED_ROUTES = [
  "/dashboard",
  "/boards",
  "/board",
  "/templates",
] as const;

/** Routes only accessible when NOT authenticated */
export const AUTH_ROUTES = ["/login", "/signup", "/reset-password"] as const;

/** Public routes that bypass all checks */
export const PUBLIC_ROUTES = ["/", "/u"] as const;

export type ProtectedRoute = (typeof PROTECTED_ROUTES)[number];
export type AuthRoute = (typeof AUTH_ROUTES)[number];
export type PublicRoute = (typeof PUBLIC_ROUTES)[number];


