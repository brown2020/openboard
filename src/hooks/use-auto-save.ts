"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useBoards } from "@/hooks/use-boards";
import { useEditor } from "@/stores/ui-store";
import {
  serializeBoardSaveState,
  type BoardSavePayload,
} from "@/lib/board-save";

interface UseAutoSaveOptions {
  /** Board ID to auto-save */
  boardId: string;
  /** Debounce delay in milliseconds (default: 2000) */
  debounceMs?: number;
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean;
  /** Fingerprint of the current editor state (changes trigger dirty detection) */
  stateFingerprint: string;
  /** Returns payload to persist; null skips save */
  getPayload: () => BoardSavePayload | null;
  /** Reset baseline when a board finishes loading */
  baselineFingerprint?: string | null;
  /** Callback after a successful save */
  onSaveSuccess?: (payload: BoardSavePayload) => void;
}

interface SaveNowOptions {
  /** Suppress success/error toasts (auto-save uses silent mode) */
  silent?: boolean;
}

interface UseAutoSaveReturn {
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  saveFailed: boolean;
  lastSavedAt: number | null;
  saveNow: (options?: SaveNowOptions) => Promise<boolean>;
}

/**
 * Debounced auto-save for the board editor.
 * Tracks blocks, title, description, and theme via `stateFingerprint` + `getPayload`.
 */
export function useAutoSave({
  boardId,
  debounceMs = 2000,
  enabled = true,
  stateFingerprint,
  getPayload,
  baselineFingerprint = null,
  onSaveSuccess,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const { updateBoard } = useBoards();
  const { setSaving } = useEditor();

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedFingerprintRef = useRef<string>("");
  const isMountedRef = useRef(true);
  const getPayloadRef = useRef(getPayload);
  const onSaveSuccessRef = useRef(onSaveSuccess);

  useEffect(() => {
    getPayloadRef.current = getPayload;
  }, [getPayload]);

  useEffect(() => {
    onSaveSuccessRef.current = onSaveSuccess;
  }, [onSaveSuccess]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!baselineFingerprint) return;
    lastSavedFingerprintRef.current = baselineFingerprint;
    setHasUnsavedChanges(false);
    setSaveFailed(false);
  }, [baselineFingerprint]);

  const saveNow = useCallback(
    async (options: SaveNowOptions = {}): Promise<boolean> => {
      const payload = getPayloadRef.current();
      if (!payload) return false;

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      setIsSaving(true);
      setSaving(true);
      setSaveFailed(false);

      try {
        const success = await updateBoard(boardId, {
          blocks: payload.blocks,
          title: payload.title,
          description: payload.description,
          theme: payload.theme,
        });

        if (!isMountedRef.current) return success;

        if (success) {
          const fingerprint = serializeBoardSaveState(payload);
          lastSavedFingerprintRef.current = fingerprint;
          setLastSavedAt(Date.now());
          setHasUnsavedChanges(false);
          setSaveFailed(false);
          onSaveSuccessRef.current?.(payload);
        } else {
          setSaveFailed(true);
        }

        return success;
      } catch {
        if (isMountedRef.current) {
          setSaveFailed(true);
        }
        return false;
      } finally {
        if (isMountedRef.current) {
          setIsSaving(false);
          setSaving(false);
        }
      }
    },
    [boardId, updateBoard, setSaving]
  );

  const saveNowRef = useRef(saveNow);
  useEffect(() => {
    saveNowRef.current = saveNow;
  }, [saveNow]);

  useEffect(() => {
    if (!enabled || !baselineFingerprint) {
      return;
    }

    if (stateFingerprint === lastSavedFingerprintRef.current) {
      setHasUnsavedChanges(false);
      return;
    }

    setHasUnsavedChanges(true);
    setSaveFailed(false);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      void saveNowRef.current({ silent: true });
    }, debounceMs);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [stateFingerprint, boardId, enabled, debounceMs, baselineFingerprint]);

  return {
    isSaving,
    hasUnsavedChanges,
    saveFailed,
    lastSavedAt,
    saveNow,
  };
}

// Re-export optimistic helper unchanged for future use
export { useOptimisticUpdate } from "./use-auto-save-optimistic";
