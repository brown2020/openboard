import { NextResponse } from "next/server";
import { z } from "zod";
import { consumeRateLimit, errorResponse, requireAuth } from "@/lib/api-utils";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { normalizeCollaboratorEmail } from "@/lib/collaborators";

const LookupSchema = z.object({
  email: z.string().min(3).max(320),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    if (!(await consumeRateLimit(`user-lookup:${user.uid}`, 20, 60_000))) {
      return errorResponse("Too many requests. Please try again later.", 429);
    }

    const parsed = LookupSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return errorResponse("Invalid request body", 400);
    }

    const email = normalizeCollaboratorEmail(parsed.data.email);
    try {
      const record = await getAdminAuth().getUserByEmail(email);
      const profile = await getAdminDb().collection("users").doc(record.uid).get();
      const data = profile.data() as { username?: string; displayName?: string } | undefined;
      return NextResponse.json({
        id: record.uid,
        username: data?.username ?? null,
        displayName: data?.displayName ?? record.displayName ?? null,
      });
    } catch {
      return errorResponse("User not found", 404);
    }
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("User lookup error:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
