import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { FIREBASE_AUTH_COOKIE } from "@/lib/auth-constants";
import { verifyFirebaseAuthCookie } from "@/lib/firebase-admin";
import type { DecodedIdToken } from "firebase-admin/auth";

/**
 * Simple in-memory rate limiter
 * For production, consider Redis or similar
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  // Clean up expired entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (now > v.resetAt) rateLimitStore.delete(k);
    }
  }

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Require authentication for API routes
 * Returns the decoded user token or throws an error response
 */
export async function requireAuth(): Promise<DecodedIdToken> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(FIREBASE_AUTH_COOKIE)?.value;

  if (!authCookie) {
    throw NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await verifyFirebaseAuthCookie(authCookie);
  } catch (error) {
    throw NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

/**
 * Check if user is owner or collaborator of a board
 */
export function canEditBoard(
  userId: string,
  boardData: { ownerId?: string; collaborators?: string[] }
): boolean {
  return (
    boardData.ownerId === userId ||
    (Array.isArray(boardData.collaborators) && boardData.collaborators.includes(userId))
  );
}

/**
 * Standardized error response helper
 */
export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}
