import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { consumeRateLimit, errorResponse } from "@/lib/api-utils";
import { getTrustedClientIp } from "@/lib/client-ip";
import {
  getBoardAccessCookieName,
  verifyBoardAccessToken,
} from "@/lib/board-access-cookie";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  isPrivateBoard,
  requiresPasswordUnlock,
} from "@/lib/public-board-access";
import type { Block, BoardPrivacy } from "@/types";
import { FieldValue } from "firebase-admin/firestore";
import { cookies } from "next/headers";

const TrackSchema = z.object({
  boardId: z.string().min(1).max(200),
  event: z.enum(["view", "click"]),
  blockId: z.string().min(1).max(200).optional(),
});

function deviceBucket(userAgent: string) {
  const isTablet = /Tablet|iPad/i.test(userAgent);
  const isMobile = /Mobile/i.test(userAgent) && !isTablet;
  return {
    mobile: isMobile ? 1 : 0,
    tablet: isTablet ? 1 : 0,
    desktop: !isMobile && !isTablet ? 1 : 0,
  };
}

export async function POST(req: NextRequest) {
  try {
    const parsed = TrackSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return errorResponse("Invalid request body", 400);
    }

    const { boardId, event, blockId } = parsed.data;
    if (event === "click" && !blockId) {
      return errorResponse("Invalid request body", 400);
    }

    const ip = getTrustedClientIp(req.headers);
    if (!(await consumeRateLimit(`analytics:${ip}`, 60, 60_000))) {
      return errorResponse("Too many requests. Please try again later.", 429);
    }
    if (!(await consumeRateLimit(`analytics:board:${boardId}`, 300, 60_000))) {
      return errorResponse("Too many requests. Please try again later.", 429);
    }

    const adminDb = getAdminDb();
    const snap = await adminDb.collection("boards").doc(boardId).get();
    if (!snap.exists) {
      return errorResponse("Board not found", 404);
    }

    const board = snap.data() as {
      privacy?: BoardPrivacy;
      blocks?: Block[];
      analytics?: { enabled?: boolean };
    };
    const privacy = board.privacy ?? "public";
    if (isPrivateBoard(privacy)) {
      return errorResponse("Board not found", 404);
    }
    if (board.analytics?.enabled === false) {
      return NextResponse.json({ ok: true });
    }

    if (requiresPasswordUnlock(privacy)) {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get(getBoardAccessCookieName())?.value;
      const access = accessToken
        ? verifyBoardAccessToken(accessToken, boardId)
        : { ok: false as const };
      if (!access.ok) {
        return errorResponse("Board access required", 403);
      }
    }

    if (event === "click") {
      const block = board.blocks?.find((item) => item.id === blockId && item.visible);
      if (!block) {
        return errorResponse("Block not found", 404);
      }
    }

    const today = new Date().toISOString().split("T")[0]!;
    const userAgent = (req.headers.get("user-agent") ?? "").slice(0, 500);
    const referrer = (req.headers.get("referer") ?? "").slice(0, 500);
    const analyticsRef = adminDb.collection("analytics").doc(`${boardId}_${today}`);

    if (event === "view") {
      const devices = deviceBucket(userAgent);
      await analyticsRef.set(
        {
          boardId,
          date: today,
          views: FieldValue.increment(1),
          uniqueVisitors: FieldValue.increment(1),
          devices: {
            mobile: FieldValue.increment(devices.mobile),
            desktop: FieldValue.increment(devices.desktop),
            tablet: FieldValue.increment(devices.tablet),
          },
        },
        { merge: true }
      );
    } else if (blockId) {
      await analyticsRef.set(
        {
          boardId,
          date: today,
          clicks: { [blockId]: FieldValue.increment(1) },
        },
        { merge: true }
      );
      await adminDb.collection("clicks").add({
        boardId,
        blockId,
        timestamp: FieldValue.serverTimestamp(),
        referrer: referrer || null,
        userAgent: userAgent || null,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Analytics track error:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
