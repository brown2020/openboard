import { describe, expect, it } from "vitest";
import {
  filterCollaboratorUserIds,
  isCollaboratorUserId,
  isValidCollaboratorEmail,
  mergeBoardLists,
  normalizeCollaboratorEmail,
} from "@/lib/collaborators";
import type { Board } from "@/types";

function makeBoard(id: string, updatedAtMs: number, ownerId = "owner-1"): Board {
  return {
    id,
    slug: id,
    title: id,
    ownerId,
    ownerUsername: "demo",
    collaborators: [],
    blocks: [],
    layout: "single-column",
    theme: {
      name: "Default",
      background: { type: "color", value: "#fff" },
      primaryColor: "#000",
      textColor: "#111",
      cardBackground: "#f5f5f5",
      borderRadius: "md",
      font: { heading: "system-ui", body: "system-ui" },
    },
    privacy: "public",
    seo: {},
    analytics: { enabled: true, views: 0, uniqueVisitors: 0 },
    updatedAt: { toMillis: () => updatedAtMs } as Board["updatedAt"],
    createdAt: { toMillis: () => updatedAtMs } as Board["createdAt"],
  };
}

describe("collaborator helpers", () => {
  it("normalizes emails", () => {
    expect(normalizeCollaboratorEmail("  User@Example.COM ")).toBe(
      "user@example.com"
    );
  });

  it("validates collaborator emails", () => {
    expect(isValidCollaboratorEmail("user@example.com")).toBe(true);
    expect(isValidCollaboratorEmail("not-an-email")).toBe(false);
  });

  it("distinguishes user ids from legacy email entries", () => {
    expect(isCollaboratorUserId("abc123firebaseUid28charsxx")).toBe(true);
    expect(isCollaboratorUserId("user@example.com")).toBe(false);
    expect(filterCollaboratorUserIds(["uid-1", "legacy@example.com"])).toEqual([
      "uid-1",
    ]);
  });
});

describe("mergeBoardLists", () => {
  it("deduplicates boards by id and sorts by updatedAt desc", () => {
    const owned = [makeBoard("a", 100), makeBoard("b", 300)];
    const shared = [makeBoard("b", 250, "owner-2"), makeBoard("c", 200, "owner-2")];

    const merged = mergeBoardLists(owned, shared);
    expect(merged.map((board) => board.id)).toEqual(["b", "c", "a"]);
  });
});
