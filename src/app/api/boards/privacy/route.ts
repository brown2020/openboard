import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, canEditBoard, errorResponse } from "@/lib/api-utils";
import { getAdminDb } from "@/lib/firebase-admin";
import { hashPassword } from "@/lib/password";

const PrivacySchema = z.object({
  boardId: z.string().min(1),
  privacy: z.enum(["public", "unlisted", "private", "password"]),
  password: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    // Validate request body
    const body = PrivacySchema.safeParse(await req.json().catch(() => null));
    if (!body.success) {
      return errorResponse("Invalid request body", 400);
    }

    // Verify authentication
    const user = await requireAuth();

    const { boardId, privacy, password } = body.data;

    // Get board data
    const adminDb = getAdminDb();
    const ref = adminDb.collection("boards").doc(boardId);
    const snap = await ref.get();
    
    if (!snap.exists) {
      return errorResponse("Board not found", 404);
    }

    const data = snap.data() as { ownerId?: string; collaborators?: string[] };
    
    // Check if user can edit (owner or collaborator)
    if (!canEditBoard(user.uid, data)) {
      return errorResponse("Forbidden", 403);
    }

    // Handle password-protected boards
    if (privacy === "password") {
      if (!password || password.trim().length === 0) {
        return errorResponse("Password required for password-protected boards", 400);
      }
      const passwordHash = await hashPassword(password.trim());
      await ref.update({
        privacy,
        passwordHash,
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
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("Privacy update error:", error);
    return errorResponse("Internal Server Error", 500);
  }
}


