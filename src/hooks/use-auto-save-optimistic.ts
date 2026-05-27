"use client";

import { useCallback, useState } from "react";
import { useBoardStore } from "@/stores/board-store";
import { Block } from "@/types";

/**
 * Hook for optimistic updates with rollback on failure.
 */
export function useOptimisticUpdate() {
  const { currentBoard } = useBoardStore();
  const [rollbackState, setRollbackState] = useState<{
    blocks: Block[];
  } | null>(null);

  const executeOptimistic = useCallback(
    async <T>(
      localUpdate: () => T,
      remoteUpdate: (localResult: T) => Promise<boolean>
    ): Promise<boolean> => {
      if (!currentBoard) return false;

      const savedState = {
        blocks: structuredClone(currentBoard.blocks),
      };
      setRollbackState(savedState);

      const localResult = localUpdate();

      try {
        const success = await remoteUpdate(localResult);

        if (!success) {
          setRollbackState(null);
          return false;
        }

        setRollbackState(null);
        return true;
      } catch {
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
