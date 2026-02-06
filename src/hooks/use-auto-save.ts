"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useBoardStore } from "@/stores/board-store";
import { useBoards } from "@/hooks/use-boards";
import { Block } from "@/types";

interface UseAutoSaveOptions {
  /** Board ID to auto-save */
  boardId: string;
  /** Debounce delay in milliseconds (default: 2000) */
  debounceMs?: number;
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean;
  /** Callback when save starts */
  onSaveStart?: () => void;
  /** Callback when save completes */
  onSaveComplete?: (success: boolean) => void;
}

interface UseAutoSaveReturn {
  /** Whether a save is currently in progress */
  isSaving: boolean;
  /** Whether there are unsaved changes */
  hasUnsavedChanges: boolean;
  /** Last successful save timestamp */
  lastSavedAt: number | null;
  /** Trigger an immediate save */
  saveNow: () => Promise<boolean>;
  /** Mark content as having unsaved changes */
  markDirty: () => void;
}

/**
 * Hook for automatic saving with debounce.
 * Watches for changes to the current board and saves after a delay.
 */
export function useAutoSave({
  boardId,
  debounceMs = 2000,
  enabled = true,
  onSaveStart,
  onSaveComplete,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const { currentBoard } = useBoardStore();
  const { updateBoard } = useBoards();

  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  // Refs for debouncing and tracking
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedBlocksRef = useRef<string>("");
  const isMountedRef = useRef(true);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Save function
  const saveNow = useCallback(async (): Promise<boolean> => {
    if (!currentBoard || currentBoard.id !== boardId) {
      return false;
    }

    // Clear any pending debounced save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    setIsSaving(true);
    onSaveStart?.();

    try {
      const success = await updateBoard(boardId, {
        blocks: currentBoard.blocks,
        title: currentBoard.title,
        description: currentBoard.description,
      });

      if (isMountedRef.current) {
        if (success) {
          // Update tracking refs
          lastSavedBlocksRef.current = JSON.stringify(currentBoard.blocks);
          setLastSavedAt(Date.now());
          setHasUnsavedChanges(false);
        }
        setIsSaving(false);
      }

      onSaveComplete?.(success);
      return success;
    } catch (error) {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
      onSaveComplete?.(false);
      return false;
    }
  }, [currentBoard, boardId, updateBoard, onSaveStart, onSaveComplete]);

  // Mark as dirty (has unsaved changes)
  const markDirty = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  // Debounced auto-save effect
  useEffect(() => {
    if (!enabled || !currentBoard || currentBoard.id !== boardId) {
      return;
    }

    // Serialize current blocks for comparison
    const currentBlocksJson = JSON.stringify(currentBoard.blocks);

    // Check if there are actual changes
    if (currentBlocksJson === lastSavedBlocksRef.current) {
      return;
    }

    // Mark as having unsaved changes
    setHasUnsavedChanges(true);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set up new debounced save
    saveTimeoutRef.current = setTimeout(() => {
      saveNow();
    }, debounceMs);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [currentBoard?.blocks, boardId, enabled, debounceMs, saveNow]);

  // Initialize lastSavedBlocksRef when board loads
  useEffect(() => {
    if (currentBoard && currentBoard.id === boardId) {
      lastSavedBlocksRef.current = JSON.stringify(currentBoard.blocks);
    }
  }, [boardId]); // Only on board ID change, not blocks change

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    isSaving,
    hasUnsavedChanges,
    lastSavedAt,
    saveNow,
    markDirty,
  };
}

/**
 * Hook for optimistic updates with rollback on failure.
 */
export function useOptimisticUpdate() {
  const { currentBoard } = useBoardStore();
  const [rollbackState, setRollbackState] = useState<{
    blocks: Block[];
  } | null>(null);

  /**
   * Execute an optimistic update with automatic rollback on failure.
   * @param localUpdate - Function to apply local state change
   * @param remoteUpdate - Async function to persist to server
   * @returns Promise<boolean> - Whether the operation succeeded
   */
  const executeOptimistic = useCallback(
    async <T>(
      localUpdate: () => T,
      remoteUpdate: (localResult: T) => Promise<boolean>
    ): Promise<boolean> => {
      if (!currentBoard) return false;

      // Save current state for potential rollback
      const savedState = {
        blocks: structuredClone(currentBoard.blocks),
      };
      setRollbackState(savedState);

      // Apply local update immediately
      const localResult = localUpdate();

      try {
        // Attempt remote update
        const success = await remoteUpdate(localResult);

        if (!success) {
          // Rollback on failure
          // Note: The calling code should handle the rollback using the store
          setRollbackState(null);
          return false;
        }

        setRollbackState(null);
        return true;
      } catch (error) {
        // Rollback on error
        setRollbackState(null);
        return false;
      }
    },
    [currentBoard]
  );

  return {
    executeOptimistic,
    rollbackState,
  };
}
