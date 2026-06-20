"use client";

import { useEffect } from "react";
import { Board } from "@/types";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { useAnalytics } from "@/hooks/use-analytics";
import { PublicBoardErrorBoundary } from "@/components/error-boundary";

// Serialized board type for client components (Timestamps converted to ISO strings)
type PublicBoard = Omit<Board, "passwordHash" | "createdAt" | "updatedAt"> & {
  createdAt: string | null;
  updatedAt: string | null;
};

export function PublicBoardClient({ board }: { board: PublicBoard }) {
  const { trackView, trackClick } = useAnalytics();
  const analyticsEnabled = board.analytics?.enabled ?? true;

  useEffect(() => {
    if (!analyticsEnabled) return;
    trackView(board.id, navigator.userAgent);
  }, [analyticsEnabled, board.id, trackView]);

  const handleBlockClick = (blockId: string) => {
    if (!analyticsEnabled) return;
    trackClick(board.id, blockId, document.referrer, navigator.userAgent);
  };

  return (
    <PublicBoardErrorBoundary>
      <div
        className="min-h-screen"
        style={{ background: board.theme.background.value }}
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
                  boardId={board.id}
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
    </PublicBoardErrorBoundary>
  );
}

