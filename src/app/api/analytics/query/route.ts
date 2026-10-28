import { NextResponse } from "next/server";
import { z } from "zod";
import { consumeRateLimit, errorResponse, requireAuth } from "@/lib/api-utils";
import { canEditBoard } from "@/lib/board-access";
import { isAnalyticsDateWithinDays } from "@/lib/dashboard-analytics";
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
    const analytics: BoardAnalytics[] = [];

    for (const boardId of boardIds) {
      const boardSnap = await adminDb.collection("boards").doc(boardId).get();
      if (!boardSnap.exists) continue;
      const data = boardSnap.data() as { ownerId?: string; collaborators?: string[] };
      if (!canEditBoard(user.uid, data)) continue;

      // Equality on boardId uses the automatic single-field index.
      // A date range here needs a composite index that may not be deployed yet.
      const snapshot = await adminDb
        .collection("analytics")
        .where("boardId", "==", boardId)
        .get();

      for (const doc of snapshot.docs) {
        const row = doc.data() as BoardAnalytics;
        if (!row.date || !isAnalyticsDateWithinDays(row.date, days)) continue;
        analytics.push(row);
      }
    }

    return NextResponse.json({ analytics });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Analytics query error:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
