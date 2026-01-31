import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { FIREBASE_AUTH_COOKIE } from "@/lib/auth-constants";
import { getAdminAuth } from "@/lib/firebase-admin";
import { rateLimit, errorResponse } from "@/lib/api-utils";

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

    // Rate limit: 10 requests per minute
    if (!rateLimit("session:create", 10, 60000)) {
      return errorResponse("Too many requests. Please try again later.", 429);
    }

    // Create session cookie
    const adminAuth = getAdminAuth();
    const expiresInMs = 7 * 24 * 60 * 60 * 1000; // 7 days

    const sessionCookie = await adminAuth.createSessionCookie(body.data.idToken, {
      expiresIn: expiresInMs,
    });

    const cookieStore = await cookies();
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
    cookieStore.delete(FIREBASE_AUTH_COOKIE);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Session deletion error:", error);
    return errorResponse("Failed to delete session", 500);
  }
}


