import { cookies } from "next/headers";
import { getAdminDb } from "@/lib/firebase-admin";
import { Board } from "@/types";
import {
  getBoardAccessCookieName,
  verifyBoardAccessToken,
} from "@/lib/board-access-cookie";
import { PasswordGate } from "@/components/public-board/password-gate";
import { PublicBoardClient } from "@/components/public-board/public-board-client";

// Mark this route as dynamic for Next.js 16
export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface PageProps {
  params: { username: string; slug: string };
}

export default async function PublicBoardPage({ params }: PageProps) {
  const adminDb = getAdminDb();

  const snap = await adminDb
    .collection("boards")
    .where("ownerUsername", "==", params.username)
    .where("slug", "==", params.slug)
    .limit(1)
    .get();

  const doc = snap.docs[0];
  if (!doc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Board Not Found</h1>
          <p className="text-muted-foreground">
            The board you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const board = { id: doc.id, ...doc.data() } as Board;

  // Check if board is private
  if (board.privacy === "private") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Private Board</h1>
          <p className="text-muted-foreground">
            This board is private and cannot be viewed.
          </p>
        </div>
      </div>
    );
  }

  if (board.privacy === "password") {
    const cookieStore = await cookies();
    const access = cookieStore.get(getBoardAccessCookieName())?.value;
    const isAuthorized = !!access && verifyBoardAccessToken(access, board.id).ok;

    if (!isAuthorized) {
      return <PasswordGate boardId={board.id} />;
    }
  }

  // Never pass passwordHash to the client tree.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...boardPublic } = board;

  return <PublicBoardClient board={boardPublic} />;
}
