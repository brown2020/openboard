import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminDb } from "@/lib/firebase-admin";
import { verifyPassword } from "@/lib/password";
import { consumeRateLimit, errorResponse } from "@/lib/api-utils";
import { getTrustedClientIp } from "@/lib/client-ip";
import {
  createBoardAccessToken,
  getBoardAccessCookieName,
} from "@/lib/board-access-cookie";

const UnlockSchema = z.object({
  boardId: z.string().min(1),
  password: z.string().min(1).max(128),
});

export async function POST(req: Request) {
  try {
    // Validate request body
    const body = UnlockSchema.safeParse(await req.json().catch(() => null));
    if (!body.success) {
      return errorResponse("Invalid request body", 400);
    }

    const { boardId, password } = body.data;
    const ip = getTrustedClientIp(req.headers);

    if (!(await consumeRateLimit(`unlock:${ip}:${boardId}`, 5, 10 * 60_000))) {
      return errorResponse("Too many attempts. Please try again later.", 429);
    }
    if (!(await consumeRateLimit(`unlock-board:${boardId}`, 30, 10 * 60_000))) {
      return errorResponse("Too many attempts. Please try again later.", 429);
    }

    // Get board data
    const adminDb = getAdminDb();
    const snap = await adminDb.collection("boards").doc(boardId).get();

    if (!snap.exists) {
      return errorResponse("Board not found", 404);
    }

    const data = snap.data() as { privacy?: string; passwordHash?: string };

    if (data.privacy !== "password" || !data.passwordHash) {
      return errorResponse("Board is not password protected", 400);
    }

    // Verify password
    const ok = await verifyPassword(password, data.passwordHash);
    if (!ok) {
      return errorResponse("Invalid password", 401);
    }

    // Set 24h access cookie for this board
    const cookieStore = await cookies();
    const existingAccess = cookieStore.get(getBoardAccessCookieName())?.value;
    const accessToken = createBoardAccessToken(
      boardId,
      24 * 60 * 60,
      existingAccess
    );
    cookieStore.set(getBoardAccessCookieName(), accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 24 * 60 * 60,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("Unlock error:", error);
    return errorResponse("Internal Server Error", 500);
  }
}


