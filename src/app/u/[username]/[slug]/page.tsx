import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Board } from "@/types";
import {
  getBoardAccessCookieName,
  verifyBoardAccessToken,
} from "@/lib/board-access-cookie";
import {
  getPublicBoardRobots,
  isDirectLinkAccessible,
  isPrivateBoard,
  requiresPasswordUnlock,
} from "@/lib/public-board-access";
import { fetchPublicBoardBySlug } from "@/lib/public-board-server";
import { PasswordGate } from "@/components/public-board/password-gate";
import { PublicBoardClient } from "@/components/public-board/public-board-client";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ username: string; slug: string }>;
}

function buildBoardMetadata(board: Board): Metadata {
  const robots = getPublicBoardRobots(board.privacy);

  return {
    title: board.seo?.title ?? board.title,
    description: board.seo?.description ?? board.description,
    robots,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, slug } = await params;
  const board = await fetchPublicBoardBySlug(username, slug);

  if (!board) {
    return {
      title: "Board Not Found",
      robots: { index: false, follow: false },
    };
  }

  if (isPrivateBoard(board.privacy)) {
    return {
      title: "Private Board",
      robots: getPublicBoardRobots("private"),
    };
  }

  return buildBoardMetadata(board);
}

function BoardNotFound() {
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

function PrivateBoardMessage() {
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

function serializeBoardForClient(board: Board) {
  const { passwordHash: _passwordHash, createdAt, updatedAt, ...boardPublic } =
    board;

  return {
    ...boardPublic,
    createdAt: createdAt?.toDate?.() ? createdAt.toDate().toISOString() : null,
    updatedAt: updatedAt?.toDate?.() ? updatedAt.toDate().toISOString() : null,
  };
}

export default async function PublicBoardPage({ params }: PageProps) {
  const { username, slug } = await params;
  const board = await fetchPublicBoardBySlug(username, slug);

  if (!board) {
    return <BoardNotFound />;
  }

  if (isPrivateBoard(board.privacy)) {
    return <PrivateBoardMessage />;
  }

  if (requiresPasswordUnlock(board.privacy)) {
    const cookieStore = await cookies();
    const access = cookieStore.get(getBoardAccessCookieName())?.value;
    const isAuthorized =
      !!access && verifyBoardAccessToken(access, board.id).ok;

    if (!isAuthorized) {
      return <PasswordGate boardId={board.id} />;
    }
  } else if (!isDirectLinkAccessible(board.privacy)) {
    // Unknown privacy value — fail closed.
    return <BoardNotFound />;
  }

  // Public and unlisted boards render for direct URL visitors.
  // Unlisted boards are excluded from search indexes via generateMetadata robots tags.
  return <PublicBoardClient board={serializeBoardForClient(board)} />;
}
