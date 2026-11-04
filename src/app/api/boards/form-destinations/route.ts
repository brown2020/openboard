import { NextResponse } from "next/server";
import { z } from "zod";
import { consumeRateLimit, errorResponse, requireAuth } from "@/lib/api-utils";
import { canEditBoard } from "@/lib/board-access";
import { getAdminDb } from "@/lib/firebase-admin";

const FormDestinationsSchema = z
  .object({
    boardId: z.string().min(1).max(200),
    urls: z.record(z.string().min(1).max(200), z.string().max(2000)),
  })
  .refine((value) => Object.keys(value.urls).length <= 50, {
    path: ["urls"],
  });

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    if (!(await consumeRateLimit(`form-destinations:${user.uid}`, 60, 60_000))) {
      return errorResponse("Too many requests. Please try again later.", 429);
    }

    const parsed = FormDestinationsSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return errorResponse("Invalid request body", 400);
    }

    const { boardId, urls } = parsed.data;
    const adminDb = getAdminDb();
    const boardSnap = await adminDb.collection("boards").doc(boardId).get();
    if (!boardSnap.exists) {
      return errorResponse("Board not found", 404);
    }

    const data = boardSnap.data() as { ownerId?: string; collaborators?: string[] };
    if (!canEditBoard(user.uid, data)) {
      return errorResponse("Forbidden", 403);
    }

    if (typeof data.ownerId !== "string" || data.ownerId.length === 0) {
      return NextResponse.json({ stored: false });
    }

    await adminDb
      .collection("boardFormWebhooks")
      .doc(boardId)
      .set({ ownerId: data.ownerId, urls }, { merge: true });

    return NextResponse.json({ stored: true });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Form destination store error:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
