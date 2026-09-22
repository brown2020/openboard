"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  type SensorDescriptor,
  type SensorOptions,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Block, Board } from "@/types";
import { SortableBlock } from "./sortable-block";

type Props = {
  currentBoard: Board;
  boardTitle: string;
  setBoardTitle: (v: string) => void;
  boardDescription: string;
  setBoardDescription: (v: string) => void;
  editingHeader: boolean;
  setEditingHeader: (v: boolean) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  sensors: SensorDescriptor<SensorOptions>[];
  setShowAddBlock: (v: boolean) => void;
};

export function BoardEditorCanvas({
  currentBoard,
  boardTitle,
  setBoardTitle,
  boardDescription,
  setBoardDescription,
  editingHeader,
  setEditingHeader,
  handleDragEnd,
  sensors,
  setShowAddBlock,
}: Props) {
  const sortedBlocks = [...currentBoard.blocks].sort(
    (a: Block, b: Block) => a.order - b.order
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div
          className="rounded-2xl p-8 min-h-[600px] shadow-xl"
          style={{ background: currentBoard.theme.background.value }}
        >
          <div className="text-center mb-10 space-y-4">
            {editingHeader ? (
              <div className="space-y-3">
                <Input
                  value={boardTitle}
                  onChange={(e) => setBoardTitle(e.target.value)}
                  className="text-3xl font-bold text-center bg-white/10 border-white/20"
                  style={{ color: currentBoard.theme.textColor }}
                  placeholder="Board Title"
                  onBlur={() => setEditingHeader(false)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && setEditingHeader(false)
                  }
                />
                <Input
                  value={boardDescription}
                  onChange={(e) => setBoardDescription(e.target.value)}
                  className="text-lg text-center bg-white/10 border-white/20"
                  style={{
                    color: currentBoard.theme.textColor,
                    opacity: 0.8,
                  }}
                  placeholder="Add a description..."
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditingHeader(true)}
                className="cursor-pointer hover:opacity-80 transition-opacity p-4 -m-4 rounded-xl hover:bg-white/5 w-full"
              >
                <h1
                  className="text-3xl md:text-4xl font-bold mb-2"
                  style={{ color: currentBoard.theme.textColor }}
                >
                  {boardTitle || "Click to add title"}
                </h1>
                <p
                  className="text-lg"
                  style={{
                    color: currentBoard.theme.textColor,
                    opacity: 0.8,
                  }}
                >
                  {boardDescription || "Click to add description"}
                </p>
              </button>
            )}
          </div>

          <div className="space-y-4 pl-10">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedBlocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                {sortedBlocks.map((block) => (
                  <SortableBlock key={block.id} block={block} />
                ))}
              </SortableContext>
            </DndContext>

            <Button
              variant="outline"
              className={cn(
                "w-full py-6 border-2 border-dashed",
                "hover:border-primary hover:bg-primary/5",
                "transition-all duration-200"
              )}
              onClick={() => setShowAddBlock(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Block
            </Button>

            {sortedBlocks.length === 0 ? (
              <p
                className="text-center text-sm mt-4"
                style={{
                  color: currentBoard.theme.textColor,
                  opacity: 0.6,
                }}
              >
                Your board is empty. Add your first block to get started!
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">/</kbd> Add
            block •{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↑↓</kbd>{" "}
            Navigate •{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘S</kbd> Save
            • <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘Z</kbd>{" "}
            Undo • Drag to reorder
          </p>
        </div>
      </div>
    </div>
  );
}
