import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { consumeRateLimit, errorResponse, requireAuth } from "@/lib/api-utils";
import { getAdminDb } from "@/lib/firebase-admin";
import { isValidUsername, sanitizeUsername, usernameFromEmail } from "@/lib/username";

function suffix(): string {
  return crypto.randomBytes(2).toString("hex");
}

export async function POST() {
  try {
    const user = await requireAuth();
    if (!(await consumeRateLimit(`username:${user.uid}`, 10, 60_000))) {
      return errorResponse("Too many requests. Please try again later.", 429);
    }

    const adminDb = getAdminDb();
    const profileRef = adminDb.collection("users").doc(user.uid);
    const profileSnap = await profileRef.get();
    if (!profileSnap.exists) {
      return errorResponse("Profile not found", 404);
    }

    const profile = profileSnap.data() as { username?: string };
    const preferred = sanitizeUsername(profile.username ?? "") ||
      usernameFromEmail(user.email, user.uid);
    const candidates = [preferred];
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const base = preferred.slice(0, 20).replace(/[._-]+$/, "");
      const candidate = sanitizeUsername(`${base}-${suffix()}`);
      if (isValidUsername(candidate)) candidates.push(candidate);
    }

    let claimed = "";
    for (const candidate of candidates) {
      if (!isValidUsername(candidate)) continue;
      const ref = adminDb.collection("usernames").doc(candidate);
      const won = await adminDb.runTransaction(async (transaction) => {
        const snap = await transaction.get(ref);
        if (snap.exists && snap.data()?.uid !== user.uid) return false;
        if (!snap.exists) transaction.set(ref, { uid: user.uid });
        return true;
      });
      if (won) {
        claimed = candidate;
        break;
      }
    }

    if (!claimed) {
      return errorResponse("Could not claim a username", 409);
    }

    if (profile.username !== claimed) {
      await profileRef.update({ username: claimed });
    }

    const boards = await adminDb
      .collection("boards")
      .where("ownerId", "==", user.uid)
      .get();
    for (const board of boards.docs) {
      if (board.data().ownerUsername !== claimed) {
        await board.ref.update({ ownerUsername: claimed });
      }
    }

    return NextResponse.json({ username: claimed });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Username claim error:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
