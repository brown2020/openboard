import { NextResponse } from "next/server";
import { z } from "zod";
import { consumeRateLimit, errorResponse, requireAuth } from "@/lib/api-utils";
import { canEditBoard } from "@/lib/board-access";
import { getAdminDb } from "@/lib/firebase-admin";
import type { BoardAnalytics } from "@/types";

const QuerySchema = z.object({
  boardIds: z.array(z.string().min(1).max(200)).max(50),
  days: z.number().int().min(1).max(90).default(30),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    if (!(await consumeRateLimit(`analytics-read:${user.uid}`, 30, 60_000))) {
      return errorResponse("Too many requests. Please try again later.", 429);
    }

    const parsed = QuerySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return errorResponse("Invalid request body", 400);
    }

    const { boardIds, days } = parsed.data;
    const adminDb = getAdminDb();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const start = startDate.toISOString().split("T")[0]!;
    const end = endDate.toISOString().split("T")[0]!;

    const analytics: BoardAnalytics[] = [];

    for (const boardId of boardIds) {
      const boardSnap = await adminDb.collection("boards").doc(boardId).get();
      if (!boardSnap.exists) continue;
      const data = boardSnap.data() as { ownerId?: string; collaborators?: string[] };
      if (!canEditBoard(user.uid, data)) continue;

      const snapshot = await adminDb
        .collection("analytics")
        .where("boardId", "==", boardId)
        .where("date", ">=", start)
        .where("date", "<=", end)
        .get();

      for (const doc of snapshot.docs) {
        analytics.push(doc.data() as BoardAnalytics);
      }
    }

    return NextResponse.json({ analytics });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Analytics query error:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
