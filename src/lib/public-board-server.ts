import "server-only";

import { getAdminDb } from "@/lib/firebase-admin";
import type { Board } from "@/types";

export async function fetchPublicBoardBySlug(
  username: string,
  slug: string
): Promise<Board | null> {
  const adminDb = getAdminDb();

  const snap = await adminDb
    .collection("boards")
    .where("ownerUsername", "==", username)
    .where("slug", "==", slug)
    .limit(1)
    .get();

  const doc = snap.docs[0];
  if (!doc) return null;

  return { id: doc.id, ...doc.data() } as Board;
}
