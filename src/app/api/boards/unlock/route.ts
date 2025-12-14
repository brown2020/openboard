import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminDb } from "@/lib/firebase-admin";
import { verifyPassword } from "@/lib/password";
import {
  createBoardAccessToken,
  getBoardAccessCookieName,
} from "@/lib/board-access-cookie";

const UnlockSchema = z.object({
  boardId: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = UnlockSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { boardId, password } = body.data;

  const adminDb = getAdminDb();
  const snap = await adminDb.collection("boards").doc(boardId).get();

  if (!snap.exists) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  const data = snap.data() as { privacy?: string; passwordHash?: string };

  if (data.privacy !== "password" || !data.passwordHash) {
    return NextResponse.json({ error: "Board is not password protected" }, { status: 400 });
  }

  const ok = await verifyPassword(password, data.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  // 24h access cookie for this board.
  const accessToken = createBoardAccessToken(boardId, 24 * 60 * 60);
  const cookieStore = await cookies();
  cookieStore.set(getBoardAccessCookieName(), accessToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 24 * 60 * 60,
  });

  return NextResponse.json({ ok: true });
}


