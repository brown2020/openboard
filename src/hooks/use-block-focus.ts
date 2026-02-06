"use client";

import { useCallback, useEffect, useRef } from "react";
import { useEditor } from "@/stores/ui-store";
import { useBoardStore } from "@/stores/board-store";

interface UseBlockFocusOptions {
  blockId: string;
  onEnterEdit?: () => void;
}

interface UseBlockFocusReturn {
  isSelected: boolean;
  isFocused: boolean;
  handleFocus: () => void;
  handleBlur: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  blockRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Hook for managing block focus, selection, and keyboard navigation.
 * Provides Notion-like block interaction behavior.
 */
export function useBlockFocus({
  blockId,
  onEnterEdit,
}: UseBlockFocusOptions): UseBlockFocusReturn {
  const { selectedBlockId, setSelectedBlock, isEditorMode } = useEditor();
  const { currentBoard, deleteBlock } = useBoardStore();
  const blockRef = useRef<HTMLDivElement | null>(null);

  const isSelected = selectedBlockId === blockId;
  const isFocused = isSelected && isEditorMode;

  const handleFocus = useCallback(() => {
    if (isEditorMode) {
      setSelectedBlock(blockId);
    }
  }, [blockId, isEditorMode, setSelectedBlock]);

  const handleBlur = useCallback(() => {
    // Don't deselect on blur to maintain selection state
  }, []);

  const getBlockIndex = useCallback(() => {
    if (!currentBoard) return -1;
    return currentBoard.blocks.findIndex((b) => b.id === blockId);
  }, [currentBoard, blockId]);

  const navigateToBlock = useCallback(
    (direction: "up" | "down") => {
      if (!currentBoard) return;

      const currentIndex = getBlockIndex();
      if (currentIndex === -1) return;

      const newIndex =
        direction === "up"
          ? Math.max(0, currentIndex - 1)
          : Math.min(currentBoard.blocks.length - 1, currentIndex + 1);

      if (newIndex !== currentIndex) {
        const targetBlock = currentBoard.blocks[newIndex];
        setSelectedBlock(targetBlock.id);

        // Focus the target block element
        setTimeout(() => {
          const targetElement = document.querySelector(
            `[data-block-id="${targetBlock.id}"]`
          );
          if (targetElement instanceof HTMLElement) {
            targetElement.focus();
          }
        }, 0);
      }
    },
    [currentBoard, getBlockIndex, setSelectedBlock]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isEditorMode || !isSelected) return;

      // Prevent default for navigation keys
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          navigateToBlock("up");
          break;

        case "ArrowDown":
          e.preventDefault();
          navigateToBlock("down");
          break;

        case "Enter":
          // Enter to start editing
          if (!e.shiftKey && onEnterEdit) {
            e.preventDefault();
            onEnterEdit();
          }
          break;

        case "Escape":
          // Escape to deselect
          e.preventDefault();
          setSelectedBlock(null);
          break;

        case "Backspace":
        case "Delete":
          // Delete block if not in text input
          if (
            e.target instanceof HTMLElement &&
            !["INPUT", "TEXTAREA"].includes(e.target.tagName) &&
            !e.target.isContentEditable
          ) {
            e.preventDefault();
            const currentIndex = getBlockIndex();
            deleteBlock(blockId);

            // Select the previous block or next block
            if (currentBoard && currentBoard.blocks.length > 1) {
              const newIndex = Math.max(0, currentIndex - 1);
              const remainingBlocks = currentBoard.blocks.filter(
                (b) => b.id !== blockId
              );
              if (remainingBlocks[newIndex]) {
                setSelectedBlock(remainingBlocks[newIndex].id);
              }
            }
          }
          break;
      }
    },
    [
      isEditorMode,
      isSelected,
      navigateToBlock,
      onEnterEdit,
      setSelectedBlock,
      getBlockIndex,
      deleteBlock,
      blockId,
      currentBoard,
    ]
  );

  // Auto-focus when selected
  useEffect(() => {
    if (isSelected && blockRef.current) {
      blockRef.current.focus();
    }
  }, [isSelected]);

  return {
    isSelected,
    isFocused,
    handleFocus,
    handleBlur,
    handleKeyDown,
    blockRef,
  };
}

/**
 * Hook for managing keyboard navigation at the board level.
 * Use this in the board editor page component.
 */
export function useBoardKeyboardNavigation() {
  const { selectedBlockId, setSelectedBlock, isEditorMode } = useEditor();
  const { currentBoard, addBlock } = useBoardStore();

  const handleGlobalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isEditorMode || !currentBoard) return;

      // Cmd/Ctrl + Enter to add new block after selected
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();

        // Find current position and add block after it
        const currentIndex = selectedBlockId
          ? currentBoard.blocks.findIndex((b) => b.id === selectedBlockId)
          : currentBoard.blocks.length - 1;

        const newBlockId = `block_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2)}`;

        // Create a new text block by default
        addBlock({
          id: newBlockId,
          type: "text",
          order: currentIndex + 1,
          visible: true,
          settings: {
            content: "",
            alignment: "left",
            fontSize: "md",
          },
        });

        // Select the new block
        setTimeout(() => setSelectedBlock(newBlockId), 0);
      }

      // Escape to deselect all
      if (e.key === "Escape" && selectedBlockId) {
        setSelectedBlock(null);
      }
    },
    [isEditorMode, currentBoard, selectedBlockId, addBlock, setSelectedBlock]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);
}
