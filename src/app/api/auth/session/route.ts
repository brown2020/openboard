import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { FIREBASE_AUTH_COOKIE } from "@/lib/auth-constants";
import { getAdminAuth } from "@/lib/firebase-admin";
import { consumeRateLimit, errorResponse } from "@/lib/api-utils";
import { getTrustedClientIp } from "@/lib/client-ip";
import {
  canMintSessionCookie,
  sessionRequestPlan,
  SESSION_CREATE_PER_MINUTE,
  SESSION_POST_PER_MINUTE,
  SESSION_REFRESH_PER_MINUTE,
} from "@/lib/session-mint";

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

    const ip = getTrustedClientIp(req.headers);
    const cookieStore = await cookies();
    const existingCookie = cookieStore.get(FIREBASE_AUTH_COOKIE)?.value;
    // Callers who already have a session cookie are not held to the mint cap.
    if (
      !existingCookie &&
      !(await consumeRateLimit(`session:post:${ip}`, SESSION_POST_PER_MINUTE, 60000))
    ) {
      return errorResponse("Too many requests. Please try again later.", 429);
    }

    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(body.data.idToken, true);
    let hasMatchingSession = false;
    let sessionExpiresAtSeconds: number | null = null;
    if (existingCookie) {
      try {
        const current = await adminAuth.verifySessionCookie(existingCookie, true);
        hasMatchingSession = current.uid === decoded.uid;
        sessionExpiresAtSeconds = typeof current.exp === "number" ? current.exp : null;
      } catch {
        hasMatchingSession = false;
      }
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (
      sessionRequestPlan({
        hasMatchingSession,
        sessionExpiresAtSeconds,
        nowSeconds,
      }) === "reuse"
    ) {
      if (
        !(await consumeRateLimit(
          `session:refresh:${decoded.uid}`,
          SESSION_REFRESH_PER_MINUTE,
          60000
        ))
      ) {
        return errorResponse("Too many requests. Please try again later.", 429);
      }
      return NextResponse.json({ ok: true });
    }

    if (
      !canMintSessionCookie({
        authTime: decoded.auth_time,
        nowSeconds,
        hasMatchingSession,
      })
    ) {
      return errorResponse("Sign in again to refresh your session", 401);
    }

    if (
      existingCookie &&
      !hasMatchingSession &&
      !(await consumeRateLimit(`session:post:${ip}`, SESSION_POST_PER_MINUTE, 60000))
    ) {
      return errorResponse("Too many requests. Please try again later.", 429);
    }

    if (
      !(await consumeRateLimit(
        `session:create:${decoded.uid}`,
        SESSION_CREATE_PER_MINUTE,
        60000
      ))
    ) {
      return errorResponse("Too many requests. Please try again later.", 429);
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
    const code = (error as { code?: string } | null)?.code ?? "";
    if (code === "auth/insufficient-permission") {
      return errorResponse(
        "Firebase Admin cannot mint session cookies. Grant the service account the Firebase Authentication Admin role.",
        500
      );
    }
    if (
      code === "auth/invalid-id-token" ||
      code === "auth/id-token-expired" ||
      code === "auth/argument-error"
    ) {
      return errorResponse("The sign-in token was rejected. Sign in again.", 401);
    }
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


