import { describe, expect, it } from "vitest";
import { shareSettingsSyncKey } from "./share-settings";

describe("shareSettingsSyncKey", () => {
  it("stays stable when only blocks change", () => {
    const board = {
      id: "board-1",
      privacy: "public",
      collaborators: ["collab-1"],
    };
    expect(shareSettingsSyncKey(board)).toBe(shareSettingsSyncKey({ ...board }));
  });

  it("changes when privacy or the board changes", () => {
    const board = { id: "board-1", privacy: "public", collaborators: [] };
    expect(shareSettingsSyncKey(board)).not.toBe(
      shareSettingsSyncKey({ ...board, privacy: "password" })
    );
    expect(shareSettingsSyncKey(board)).not.toBe(
      shareSettingsSyncKey({ ...board, id: "board-2" })
    );
  });
});