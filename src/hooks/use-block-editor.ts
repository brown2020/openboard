"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Block } from "@/types";

export interface UseBlockEditorOptions<T extends Record<string, any>> {
  block: Block;
  isEditing: boolean;
  initialSettings: T;
  onSave: (settings: T) => void | Promise<void>;
  validate?: (settings: T) => boolean | string;
  transformBeforeSave?: (settings: T) => T;
}

export interface UseBlockEditorReturn<T> {
  isEditMode: boolean;
  editSettings: T;
  setEditSettings: React.Dispatch<React.SetStateAction<T>>;
  updateField: <K extends keyof T>(field: K, value: T[K]) => void;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
  startEdit: () => void;
  isValid: boolean;
  errorMessage?: string;
  isSaving: boolean;
}

/**
 * Shared hook for block editing patterns.
 * Centralizes edit mode state, validation, save/cancel logic.
 */
export function useBlockEditor<T extends Record<string, any>>({
  block,
  isEditing,
  initialSettings,
  onSave,
  validate,
  transformBeforeSave,
}: UseBlockEditorOptions<T>): UseBlockEditorReturn<T> {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editSettings, setEditSettings] = useState<T>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);

  // Reset edit settings when block ID changes
  useEffect(() => {
    setEditSettings(initialSettings);
    setIsEditMode(false);
  }, [block.id]);

  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setEditSettings((prev) => ({ ...prev, [field]: value }));
  }, []);

  const validationResult = useMemo(() => {
    if (!validate) return { isValid: true };
    const result = validate(editSettings);
    if (typeof result === "boolean") {
      return { isValid: result };
    }
    return { isValid: false, errorMessage: result };
  }, [editSettings, validate]);

  const handleSave = useCallback(async () => {
    if (!validationResult.isValid) return;

    setIsSaving(true);
    try {
      const settingsToSave = transformBeforeSave
        ? transformBeforeSave(editSettings)
        : editSettings;
      await onSave(settingsToSave);
      setIsEditMode(false);
    } catch (error) {
      console.error("Block save failed:", error);
      // Error will be handled by error boundary if critical
    } finally {
      setIsSaving(false);
    }
  }, [editSettings, onSave, transformBeforeSave, validationResult.isValid]);

  const handleCancel = useCallback(() => {
    setIsEditMode(false);
  }, []);

  const startEdit = useCallback(() => {
    setIsEditMode(true);
  }, []);

  return {
    isEditMode,
    editSettings,
    setEditSettings,
    updateField,
    handleSave,
    handleCancel,
    startEdit,
    isValid: validationResult.isValid,
    errorMessage: validationResult.errorMessage,
    isSaving,
  };
}
