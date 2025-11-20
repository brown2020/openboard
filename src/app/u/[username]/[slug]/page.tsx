"use client";

import { use, useEffect, useState } from "react";
import { useBoards } from "@/hooks/use-boards";
import { useAnalytics } from "@/hooks/use-analytics";
import { Board } from "@/types";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Mark this route as dynamic for Next.js 16
export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ username: string; slug: string }>;
}

export default function PublicBoardPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { getBoardBySlug } = useBoards();
  const { trackView, trackClick } = useAnalytics();
  const [board, setBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const loadBoard = async () => {
      const boardData = await getBoardBySlug(
        resolvedParams.username,
        resolvedParams.slug
      );

      if (boardData) {
        setBoard(boardData);
        setIsAuthorized(boardData.privacy !== "password");
        // Track the view
        trackView(boardData.id, navigator.userAgent);
      }
      setIsLoading(false);
    };

    loadBoard();
  }, [resolvedParams.username, resolvedParams.slug, getBoardBySlug, trackView]);

  const handleBlockClick = (blockId: string) => {
    if (board) {
      trackClick(board.id, blockId, document.referrer, navigator.userAgent);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-2xl px-4">
          <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
          <Skeleton className="h-6 w-1/2 mx-auto mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Board Not Found</h1>
          <p className="text-muted-foreground">
            The board you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
        </div>
      </div>
    );
  }

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

  if (board.privacy === "password" && !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full border rounded-lg p-6 space-y-4">
          <h1 className="text-2xl font-bold text-center">Protected Board</h1>
          <p className="text-sm text-muted-foreground text-center">
            Enter the password provided by the board owner to continue.
          </p>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (passwordInput === board.password) {
                setIsAuthorized(true);
                setPasswordError("");
              } else {
                setPasswordError("Incorrect password. Please try again.");
              }
            }}
          >
            <Input
              type="password"
              placeholder="Enter password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
            {passwordError && (
              <p className="text-sm text-red-500">{passwordError}</p>
            )}
            <Button type="submit" className="w-full">
              Unlock
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          board.theme.background.type === "gradient"
            ? board.theme.background.value
            : board.theme.background.value,
      }}
    >
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ color: board.theme.textColor }}
            >
              {board.title}
            </h1>
            {board.description && (
              <p
                className="text-xl"
                style={{ color: board.theme.textColor, opacity: 0.9 }}
              >
                {board.description}
              </p>
            )}
          </div>

          {/* Blocks */}
          <div className="space-y-4">
            {board.blocks
              .filter((block) => block.visible)
              .sort((a, b) => a.order - b.order)
              .map((block) => (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  isEditing={false}
                  onBlockClick={handleBlockClick}
                />
              ))}
          </div>

          {/* Footer */}
          <div className="mt-16 text-center">
            <p
              className="text-sm"
              style={{ color: board.theme.textColor, opacity: 0.6 }}
            >
              Created with OpenBoard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
