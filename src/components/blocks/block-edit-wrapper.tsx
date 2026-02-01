"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface BlockEditWrapperProps {
  isEditMode: boolean;
  isEditing: boolean;
  onSave: () => void | Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
  isValid?: boolean;
  saveText?: string;
  savingText?: string;
  children: ReactNode;
}

/**
 * Shared wrapper component for block edit forms.
 * Provides consistent styling and save/cancel buttons for all editable blocks.
 */
export function BlockEditWrapper({
  isEditMode,
  isEditing,
  onSave,
  onCancel,
  isSaving = false,
  isValid = true,
  saveText = "Save",
  savingText = "Saving...",
  children,
}: BlockEditWrapperProps) {
  if (!isEditMode || !isEditing) {
    return null;
  }

  return (
    <div className="p-4 border rounded-lg bg-card space-y-4">
      {children}
      <div className="flex gap-2">
        <Button onClick={onSave} disabled={!isValid || isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {savingText}
            </>
          ) : (
            saveText
          )}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
