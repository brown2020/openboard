import { describe, expect, it } from "vitest";
import {
  getPublicBoardRobots,
  isDirectLinkAccessible,
  isPrivateBoard,
  requiresPasswordUnlock,
} from "@/lib/public-board-access";

describe("getPublicBoardRobots", () => {
  it("allows indexing for public boards", () => {
    expect(getPublicBoardRobots("public")).toEqual({
      index: true,
      follow: true,
    });
  });

  it("blocks indexing for unlisted boards", () => {
    expect(getPublicBoardRobots("unlisted")).toEqual({
      index: false,
      follow: false,
    });
  });

  it("blocks indexing for private and password boards", () => {
    expect(getPublicBoardRobots("private")).toEqual({
      index: false,
      follow: false,
    });
    expect(getPublicBoardRobots("password")).toEqual({
      index: false,
      follow: false,
    });
  });
});

describe("public board access helpers", () => {
  it("treats public and unlisted as direct-link accessible", () => {
    expect(isDirectLinkAccessible("public")).toBe(true);
    expect(isDirectLinkAccessible("unlisted")).toBe(true);
    expect(isDirectLinkAccessible("private")).toBe(false);
    expect(isDirectLinkAccessible("password")).toBe(false);
  });

  it("identifies password and private gates", () => {
    expect(requiresPasswordUnlock("password")).toBe(true);
    expect(requiresPasswordUnlock("public")).toBe(false);
    expect(isPrivateBoard("private")).toBe(true);
    expect(isPrivateBoard("unlisted")).toBe(false);
  });
});
