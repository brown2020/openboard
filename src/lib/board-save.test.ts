import { describe, expect, it } from "vitest";
import {
  getAutoSaveStatus,
  serializeBoardSaveState,
  shouldWarnBeforeUnload,
} from "@/lib/board-save";
import type { BoardSavePayload } from "@/lib/board-save";

const samplePayload: BoardSavePayload = {
  title: "My Board",
  description: "Hello",
  blocks: [
    {
      id: "b1",
      type: "text",
      order: 0,
      visible: true,
      settings: { content: "Hi" },
    },
  ],
  theme: {
    name: "Default",
    background: { type: "color", value: "#ffffff" },
    primaryColor: "#000000",
    textColor: "#111111",
    cardBackground: "#f5f5f5",
    borderRadius: "md",
    font: { heading: "system-ui", body: "system-ui" },
  },
};

describe("serializeBoardSaveState", () => {
  it("produces stable fingerprints for identical payloads", () => {
    const a = serializeBoardSaveState(samplePayload);
    const b = serializeBoardSaveState({ ...samplePayload });
    expect(a).toBe(b);
  });

  it("changes when editable fields change", () => {
    const base = serializeBoardSaveState(samplePayload);
    const updated = serializeBoardSaveState({
      ...samplePayload,
      title: "Updated",
    });
    expect(updated).not.toBe(base);
  });
});

describe("getAutoSaveStatus", () => {
  it("prioritizes saving and error states", () => {
    expect(
      getAutoSaveStatus({
        hasUnsavedChanges: true,
        isSaving: true,
        saveFailed: false,
      })
    ).toBe("saving");

    expect(
      getAutoSaveStatus({
        hasUnsavedChanges: true,
        isSaving: false,
        saveFailed: true,
      })
    ).toBe("error");

    expect(
      getAutoSaveStatus({
        hasUnsavedChanges: true,
        isSaving: false,
        saveFailed: false,
      })
    ).toBe("pending");

    expect(
      getAutoSaveStatus({
        hasUnsavedChanges: false,
        isSaving: false,
        saveFailed: false,
      })
    ).toBe("saved");
  });
});

describe("shouldWarnBeforeUnload", () => {
  it("warns only while saving or after failure", () => {
    expect(
      shouldWarnBeforeUnload({ isSaving: false, saveFailed: false })
    ).toBe(false);
    expect(shouldWarnBeforeUnload({ isSaving: true, saveFailed: false })).toBe(
      true
    );
    expect(shouldWarnBeforeUnload({ isSaving: false, saveFailed: true })).toBe(
      true
    );
  });
});
