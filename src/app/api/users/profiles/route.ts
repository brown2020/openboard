import { NextResponse } from "next/server";
import { z } from "zod";
import { consumeRateLimit, errorResponse, requireAuth } from "@/lib/api-utils";
import { getAdminDb } from "@/lib/firebase-admin";

const ProfilesSchema = z.object({
  ids: z.array(z.string().min(1).max(128)).max(20),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    if (!(await consumeRateLimit(`user-profiles:${user.uid}`, 30, 60_000))) {
      return errorResponse("Too many requests. Please try again later.", 429);
    }

    const parsed = ProfilesSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return errorResponse("Invalid request body", 400);
    }

    const adminDb = getAdminDb();
    const profiles = [];

    for (const id of [...new Set(parsed.data.ids)]) {
      const snap = await adminDb.collection("users").doc(id).get();
      if (!snap.exists) continue;
      const data = snap.data() as {
        username?: string;
        displayName?: string;
        avatar?: string;
      };
      profiles.push({
        id,
        username: data.username ?? "",
        displayName: data.displayName ?? data.username ?? "",
        avatar: data.avatar,
      });
    }

    return NextResponse.json({ profiles });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("User profiles error:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
