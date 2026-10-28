import { beforeEach, describe, expect, it } from "vitest";
import { Timestamp } from "firebase/firestore";
import { DEFAULT_THEME } from "@/lib/constants";
import { useBoardStore } from "@/stores/board-store";
import type { Board, TextBlock } from "@/types";

function makeTextBlock(id: string, order: number): TextBlock {
  return {
    id,
    type: "text",
    order,
    visible: true,
    settings: {
      content: id,
      alignment: "left",
      fontSize: "md",
    },
  };
}

function makeBoard(blocks: TextBlock[]): Board {
  const timestamp = Timestamp.fromDate(new Date("2026-01-01T00:00:00.000Z"));

  return {
    id: "board-1",
    slug: "board-1",
    title: "Board",
    description: "",
    ownerId: "user-1",
    ownerUsername: "owner",
    collaborators: [],
    blocks,
    layout: "single-column",
    theme: DEFAULT_THEME,
    privacy: "public",
    seo: {},
    analytics: {
      enabled: true,
      views: 0,
      uniqueVisitors: 0,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

describe("useBoardStore block insertion", () => {
  beforeEach(() => {
    useBoardStore.getState().reset();
  });

  it("inserts a block at the requested order and renumbers siblings", () => {
    useBoardStore
      .getState()
      .setCurrentBoard(
        makeBoard([
          makeTextBlock("first", 0),
          makeTextBlock("second", 1),
          makeTextBlock("third", 2),
        ])
      );

    useBoardStore.getState().addBlock(makeTextBlock("inserted", 1));

    const blocks = useBoardStore.getState().currentBoard?.blocks ?? [];

    expect(blocks.map((block) => block.id)).toEqual([
      "first",
      "inserted",
      "second",
      "third",
    ]);
    expect(blocks.map((block) => block.order)).toEqual([0, 1, 2, 3]);
  });

  it("undoes a block edit back to the loaded content", () => {
    useBoardStore
      .getState()
      .setCurrentBoard(makeBoard([makeTextBlock("first", 0)]));

    useBoardStore.getState().updateBlock("first", {
      settings: {
        content: "edited",
        alignment: "left",
        fontSize: "md",
      },
    });

    const edited = useBoardStore.getState().currentBoard?.blocks[0];
    expect(edited?.type === "text" && edited.settings.content).toBe("edited");

    useBoardStore.getState().undo();

    const restored = useBoardStore.getState().currentBoard?.blocks[0];
    expect(restored?.type === "text" && restored.settings.content).toBe("first");
  });
});
