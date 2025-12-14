import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { FIREBASE_AUTH_COOKIE } from "@/lib/auth-constants";
import { verifyFirebaseAuthCookie, getAdminDb } from "@/lib/firebase-admin";
import { hashPassword } from "@/lib/password";

const PrivacySchema = z.object({
  boardId: z.string().min(1),
  privacy: z.enum(["public", "unlisted", "private", "password"]),
  password: z.string().optional(),
});

export async function POST(req: Request) {
  const body = PrivacySchema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const authCookie = cookieStore.get(FIREBASE_AUTH_COOKIE)?.value;
  if (!authCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decoded = await verifyFirebaseAuthCookie(authCookie).catch(() => null);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { boardId, privacy, password } = body.data;

  const adminDb = getAdminDb();
  const ref = adminDb.collection("boards").doc(boardId);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "Board not found" }, { status: 404 });

  const data = snap.data() as { ownerId?: string; collaborators?: string[] };
  const isOwner = data.ownerId === decoded.uid;
  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (privacy === "password") {
    if (!password || password.trim().length === 0) {
      return NextResponse.json(
        { error: "Password required for password-protected boards" },
        { status: 400 }
      );
    }
    const passwordHash = await hashPassword(password.trim());
    await ref.update({
      privacy,
      passwordHash,
      // Remove any legacy plaintext field if present.
      password: null,
      updatedAt: new Date(),
    });
  } else {
    await ref.update({
      privacy,
      passwordHash: null,
      password: null,
      updatedAt: new Date(),
    });
  }

  return NextResponse.json({ ok: true });
}


