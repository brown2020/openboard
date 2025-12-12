import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { FIREBASE_AUTH_COOKIE } from "@/lib/auth-constants";
import { getAdminAuth } from "@/lib/firebase-admin";

const SessionCreateSchema = z.object({
  idToken: z.string().min(1),
});

export async function POST(req: Request) {
  const body = SessionCreateSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

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
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(FIREBASE_AUTH_COOKIE);
  return NextResponse.json({ ok: true });
}


