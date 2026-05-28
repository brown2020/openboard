import type { Block, BoardTheme } from "@/types";

export type BoardSavePayload = {
  blocks: Block[];
  title: string;
  description: string;
  theme: BoardTheme;
};

/** Stable serialization for dirty-checking board editor state. */
export function serializeBoardSaveState(payload: BoardSavePayload): string {
  return JSON.stringify({
    title: payload.title,
    description: payload.description,
    blocks: payload.blocks,
    theme: payload.theme,
  });
}

export type AutoSaveStatus = "saved" | "pending" | "saving" | "error";

export function getAutoSaveStatus(input: {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  saveFailed: boolean;
}): AutoSaveStatus {
  if (input.isSaving) return "saving";
  if (input.saveFailed) return "error";
  if (input.hasUnsavedChanges) return "pending";
  return "saved";
}

export function shouldWarnBeforeUnload(input: {
  isSaving: boolean;
  saveFailed: boolean;
}): boolean {
  return input.isSaving || input.saveFailed;
}
