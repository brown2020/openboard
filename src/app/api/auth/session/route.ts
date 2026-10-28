import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { FIREBASE_AUTH_COOKIE } from "@/lib/auth-constants";
import { getAdminAuth } from "@/lib/firebase-admin";
import { consumeRateLimit, errorResponse } from "@/lib/api-utils";
import { getTrustedClientIp } from "@/lib/client-ip";
import { canMintSessionCookie } from "@/lib/session-mint";

const SessionCreateSchema = z.object({
  idToken: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    // Validate request body
    const body = SessionCreateSchema.safeParse(await req.json().catch(() => null));
    if (!body.success) {
      return errorResponse("Invalid request body", 400);
    }

    // Rate limit per IP: 10 requests per minute
    const ip = getTrustedClientIp(req.headers);
    if (!(await consumeRateLimit(`session:create:${ip}`, 10, 60000))) {
      return errorResponse("Too many requests. Please try again later.", 429);
    }

    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(body.data.idToken, true);
    const cookieStore = await cookies();
    const existingCookie = cookieStore.get(FIREBASE_AUTH_COOKIE)?.value;
    let hasMatchingSession = false;
    if (existingCookie) {
      try {
        const current = await adminAuth.verifySessionCookie(existingCookie, true);
        hasMatchingSession = current.uid === decoded.uid;
      } catch {
        hasMatchingSession = false;
      }
    }

    if (
      !canMintSessionCookie({
        authTime: decoded.auth_time,
        nowSeconds: Math.floor(Date.now() / 1000),
        hasMatchingSession,
      })
    ) {
      return errorResponse("Sign in again to refresh your session", 401);
    }

    const expiresInMs = 7 * 24 * 60 * 60 * 1000; // 7 days

    const sessionCookie = await adminAuth.createSessionCookie(body.data.idToken, {
      expiresIn: expiresInMs,
    });

    cookieStore.set(FIREBASE_AUTH_COOKIE, sessionCookie, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: Math.floor(expiresInMs / 1000),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("Session creation error:", error);
    return errorResponse("Failed to create session", 500);
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const existingCookie = cookieStore.get(FIREBASE_AUTH_COOKIE)?.value;
    if (existingCookie) {
      try {
        const adminAuth = getAdminAuth();
        const decoded = await adminAuth.verifySessionCookie(existingCookie, false);
        await adminAuth.revokeRefreshTokens(decoded.uid);
      } catch {
        // Still clear the cookie when the session is already invalid.
      }
    }
    cookieStore.delete(FIREBASE_AUTH_COOKIE);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Session deletion error:", error);
    return errorResponse("Failed to delete session", 500);
  }
}


