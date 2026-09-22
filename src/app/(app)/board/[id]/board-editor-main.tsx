"use client";

import { use, useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useBoards } from "@/hooks/use-boards";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useBoardStore, useHistory } from "@/stores/board-store";
import { useModal, useEditor } from "@/stores/ui-store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BoardEditorErrorBoundary } from "@/components/error-boundary";
import {
  Save,
  Eye,
  Plus,
  Palette,
  BarChart3,
  Share2,
  ArrowLeft,
  GripVertical,
  Undo2,
  Redo2,
  Loader2,
} from "lucide-react";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { AddBlockSheet } from "@/components/blocks/add-block-sheet";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeModal } from "@/components/modals/theme-modal";
import { AnalyticsModal } from "@/components/modals/analytics-modal";
import { ShareModal } from "@/components/modals/share-modal";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Block, BlockType } from "@/types";
import { cn } from "@/lib/utils";
import { canEditBoard } from "@/lib/board-access";
import {
  getAutoSaveStatus,
  serializeBoardSaveState,
  shouldWarnBeforeUnload,
} from "@/lib/board-save";
import { useToast } from "@/stores/ui-store";
import {
  CommandPalette,
  getDefaultBlockSettings,
} from "@/components/editor/command-palette";

interface PageProps {
  params: Promise<{ id: string }>;
}

import { SortableBlock } from "./sortable-block";



type BoardEditorMainProps = {
  [key: string]: any;
};

export function BoardEditorMain(props: BoardEditorMainProps) {
  const {
    showCommandPalette,
    setShowCommandPalette,
    handleAddBlockFromPalette,
    showAddBlock,
    setShowAddBlock,
    boardTitle,
    setBoardTitle,
    boardDescription,
    setBoardDescription,
    editingHeader,
    setEditingHeader,
    currentBoard,
    user,
    saveStatus,
    isAutoSaving,
    isSaving,
    handleSave,
    handleDragEnd,
    sensors,
    canUndo,
    canRedo,
    undo,
    redo,
    selectedBlockId,
    setSelectedBlock,
    openModal,
  } = props;

  return (
    <BoardEditorErrorBoundary>
      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onSelectBlock={handleAddBlockFromPalette}
      />
      <ThemeModal />
      <AnalyticsModal />
      <ShareModal />
      <AddBlockSheet open={showAddBlock} onOpenChange={setShowAddBlock} />

      <div className="min-h-screen bg-muted/30">
        {/* Editor Toolbar */}
        <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/boards">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Link>
              </Button>

              <div className="h-6 w-px bg-border" />

              <div>
                <h2 className="font-semibold text-sm">{boardTitle}</h2>
                <p className="text-xs text-muted-foreground">
                  /{user?.username}/{currentBoard.slug}
                </p>
              </div>

              {saveStatus === "pending" && (
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  • Unsaved changes
                </span>
              )}
              {saveStatus === "saving" && (
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                  Saving…
                </span>
              )}
              {saveStatus === "error" && (
                <span className="text-xs text-destructive font-medium">
                  • Save failed — retry with Save or ⌘S
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Undo/Redo */}
              <div className="flex items-center gap-1 mr-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={undo}
                  disabled={!canUndo}
                  title="Undo (⌘Z)"
                >
                  <Undo2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={redo}
                  disabled={!canRedo}
                  title="Redo (⌘⇧Z)"
                >
                  <Redo2 className="w-4 h-4" />
                </Button>
              </div>

              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`/u/${currentBoard.ownerUsername}/${currentBoard.slug}`}
                  target="_blank"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openModal("theme")}
              >
                <Palette className="w-4 h-4 mr-2" />
                Theme
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openModal("analytics")}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openModal("share")}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isAutoSaving || isSaving}
                className={cn(
                  (saveStatus === "pending" || saveStatus === "error") &&
                    "bg-emerald-600 hover:bg-emerald-700"
                )}
              >
                {isAutoSaving || isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isAutoSaving || isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>

        {/* Editor Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Board Preview */}
            <div
              className="rounded-2xl p-8 min-h-[600px] shadow-xl"
              style={{
                background: currentBoard.theme.background.value,
              }}
            >
              {/* Header - Editable */}
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
                      autoFocus
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
                  <div
                    onClick={() => setEditingHeader(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setEditingHeader(true);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer hover:opacity-80 transition-opacity p-4 -m-4 rounded-xl hover:bg-white/5"
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
                  </div>
                )}
              </div>

              {/* Blocks with Drag and Drop */}
              <div className="space-y-4 pl-10">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={currentBoard.blocks.map((b: Block) => b.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {[...currentBoard.blocks]
                      .sort((a: Block, b: Block) => a.order - b.order)
                      .map((block) => (
                        <SortableBlock key={block.id} block={block} />
                      ))}
                  </SortableContext>
                </DndContext>

                {/* Add Block Button */}
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

                {currentBoard.blocks.length === 0 && (
                  <p
                    className="text-center text-sm mt-4"
                    style={{
                      color: currentBoard.theme.textColor,
                      opacity: 0.6,
                    }}
                  >
                    Your board is empty. Add your first block to get started!
                  </p>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">/</kbd>{" "}
                Add block •{" "}
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↑↓</kbd>{" "}
                Navigate •{" "}
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘S</kbd>{" "}
                Save •{" "}
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘Z</kbd>{" "}
                Undo • Drag to reorder
              </p>
            </div>
          </div>
        </div>
      </div>
    </BoardEditorErrorBoundary>
  );

}
