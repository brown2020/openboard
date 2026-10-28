import { describe, expect, it } from "vitest";
import {
  createBoardAccessToken,
  verifyBoardAccessToken,
} from "./board-access-token";

const secret = "test-secret-that-is-long-enough";

describe("board access tokens", () => {
  it("keeps access to previously unlocked boards", () => {
    const first = createBoardAccessToken({
      secret,
      boardId: "board-a",
      expiresInSeconds: 100,
      nowSeconds: 1_000,
    });
    const second = createBoardAccessToken({
      secret,
      boardId: "board-b",
      expiresInSeconds: 100,
      existingToken: first,
      nowSeconds: 1_010,
    });

    expect(
      verifyBoardAccessToken({
        secret,
        token: second,
        boardId: "board-a",
        nowSeconds: 1_020,
      }).ok
    ).toBe(true);
    expect(
      verifyBoardAccessToken({
        secret,
        token: second,
        boardId: "board-b",
        nowSeconds: 1_020,
      }).ok
    ).toBe(true);
  });

  it("rejects another board and a bad signature", () => {
    const token = createBoardAccessToken({
      secret,
      boardId: "board-a",
      expiresInSeconds: 100,
      nowSeconds: 1_000,
    });

    expect(
      verifyBoardAccessToken({
        secret,
        token,
        boardId: "board-b",
        nowSeconds: 1_010,
      }).ok
    ).toBe(false);
    expect(
      verifyBoardAccessToken({
        secret: "other-secret",
        token,
        boardId: "board-a",
        nowSeconds: 1_010,
      }).ok
    ).toBe(false);
  });
});
