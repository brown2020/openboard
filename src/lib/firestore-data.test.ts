import { describe, expect, it } from "vitest";
import {
  isFirestorePermissionDenied,
  omitUndefinedDeep,
} from "./firestore-data";

describe("omitUndefinedDeep", () => {
  it("removes undefined fields nested in blocks", () => {
    expect(
      omitUndefinedDeep([
        {
          id: "video-1",
          settings: { url: "https://youtu.be/abc", title: undefined },
        },
      ])
    ).toEqual([
      {
        id: "video-1",
        settings: { url: "https://youtu.be/abc" },
      },
    ]);
  });
});

describe("isFirestorePermissionDenied", () => {
  it("recognizes client and namespaced permission errors", () => {
    expect(isFirestorePermissionDenied({ code: "permission-denied" })).toBe(true);
    expect(
      isFirestorePermissionDenied({ code: "firestore/permission-denied" })
    ).toBe(true);
    expect(isFirestorePermissionDenied({ code: "unavailable" })).toBe(false);
  });
});
