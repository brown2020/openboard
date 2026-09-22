"use client";

import { useEffect } from "react";
import type { Board } from "@/types";

type Deps = {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  handleSave: () => void;
  showCommandPalette: boolean;
  setShowCommandPalette: (v: boolean | ((b: boolean) => boolean)) => void;
  selectedBlockId: string | null;
  setSelectedBlock: (id: string | null) => void;
  currentBoard: Board | null;
};

export function useBoardEditorHotkeys({
  canUndo,
  canRedo,
  undo,
  redo,
  handleSave,
  showCommandPalette,
  setShowCommandPalette,
  selectedBlockId,
  setSelectedBlock,
  currentBoard,
}: Deps) {
    useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Cmd/Ctrl shortcuts
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "s") {
          e.preventDefault();
          handleSave();
        } else if (e.key === "z" && !e.shiftKey) {
          if (canUndo) {
            e.preventDefault();
            undo();
          }
        } else if ((e.key === "z" && e.shiftKey) || e.key === "y") {
          if (canRedo) {
            e.preventDefault();
            redo();
          }
        } else if (e.key === "Enter" && !isTyping) {
          // Cmd+Enter to add new block after selected
          e.preventDefault();
          setShowCommandPalette(true);
        }
      }

      // Slash command (/) to open command palette
      if (e.key === "/" && !isTyping && !showCommandPalette) {
        e.preventDefault();
        setShowCommandPalette(true);
      }

      // Escape to close command palette or deselect block
      if (e.key === "Escape") {
        if (showCommandPalette) {
          setShowCommandPalette(false);
        } else if (selectedBlockId) {
          setSelectedBlock(null);
        }
      }

      // Arrow key navigation between blocks (when not typing)
      if (!isTyping && currentBoard) {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
          const currentIndex = selectedBlockId
            ? currentBoard.blocks.findIndex((b) => b.id === selectedBlockId)
            : -1;

          if (e.key === "ArrowUp" && currentIndex > 0) {
            setSelectedBlock(currentBoard.blocks[currentIndex - 1].id);
          } else if (
            e.key === "ArrowDown" &&
            currentIndex < currentBoard.blocks.length - 1
          ) {
            setSelectedBlock(currentBoard.blocks[currentIndex + 1].id);
          } else if (e.key === "ArrowDown" && currentIndex === -1 && currentBoard.blocks.length > 0) {
            // If no block selected, select the first one
            setSelectedBlock(currentBoard.blocks[0].id);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    canUndo,
    canRedo,
    undo,
    redo,
    handleSave,
    showCommandPalette,
    setShowCommandPalette,
    selectedBlockId,
    currentBoard,
    setSelectedBlock,
  ]);

}
