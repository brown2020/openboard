import "server-only";

import { getAdminDb } from "@/lib/firebase-admin";
import {
  extractFormSubmitUrls,
  stripFormSubmitUrls,
} from "@/lib/form-webhooks";
import type { Board, BoardPrivacy } from "@/types";

async function quarantinePublicSecrets(board: Board): Promise<void> {
  const urls = extractFormSubmitUrls(board.blocks ?? []);
  const openPrivacy =
    board.privacy === "public" || board.privacy === "unlisted";
  const exposedHash = openPrivacy && !!board.passwordHash;
  if (Object.keys(urls).length === 0 && !exposedHash) {
    board.blocks = stripFormSubmitUrls(board.blocks ?? []);
    return;
  }

  const adminDb = getAdminDb();
  const boardRef = adminDb.collection("boards").doc(board.id);

  if (Object.keys(urls).length > 0) {
    const secretRef = adminDb.collection("boardFormWebhooks").doc(board.id);
    await adminDb.runTransaction(async (transaction) => {
      const secret = await transaction.get(secretRef);
      const existing = (secret.data()?.urls ?? {}) as Record<string, string>;
      transaction.set(
        secretRef,
        { ownerId: board.ownerId, urls: { ...urls, ...existing } },
        { merge: true }
      );
      transaction.update(boardRef, { blocks: stripFormSubmitUrls(board.blocks) });
    });
    board.blocks = stripFormSubmitUrls(board.blocks);
  }

  if (exposedHash) {
    await boardRef.update({ passwordHash: null });
    delete board.passwordHash;
  }
}

export async function fetchPublicBoardBySlug(
  username: string,
  slug: string
): Promise<Board | null> {
  const adminDb = getAdminDb();

  const snap = await adminDb
    .collection("boards")
    .where("ownerUsername", "==", username)
    .where("slug", "==", slug)
    .get();

  if (snap.empty) return null;

  const claim = await adminDb.collection("usernames").doc(username).get();
  const claimUid = claim.exists ? String(claim.data()?.uid ?? "") : "";
  const matches = snap.docs.filter((entry) => {
    if (!claimUid) return true;
    return entry.data().ownerId === claimUid;
  });

  if (matches.length !== 1) return null;

  const doc = matches[0]!;
  const board = { id: doc.id, ...doc.data() } as Board;
  const privacy = board.privacy as BoardPrivacy | undefined;
  if (privacy === "public" || privacy === "unlisted" || privacy === "password") {
    try {
      await quarantinePublicSecrets(board);
    } catch (error) {
      console.error("Failed to quarantine board secrets:", error);
      board.blocks = stripFormSubmitUrls(board.blocks ?? []);
      if (privacy !== "password") delete board.passwordHash;
    }
  }

  return board;
}
