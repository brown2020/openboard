import { describe, expect, it } from "vitest";
import { shouldFetchEditorBoard } from "./editor-load";

describe("shouldFetchEditorBoard", () => {
  it("fetches once and ignores repeat renders of the same board", () => {
    expect(shouldFetchEditorBoard(null, "board-1")).toBe(true);
    expect(shouldFetchEditorBoard("board-1", "board-1")).toBe(false);
    expect(shouldFetchEditorBoard("board-1", "board-2")).toBe(true);
  });
});
