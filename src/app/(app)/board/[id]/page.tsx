"use client";

import { use, useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useBoards } from "@/hooks/use-boards";
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
import { useToast } from "@/stores/ui-store";
import {
  CommandPalette,
  getDefaultBlockSettings,
} from "@/components/editor/command-palette";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface SortableBlockProps {
  block: Block;
}

function SortableBlock({ block }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });
  const { selectedBlockId } = useEditor();
  const isSelected = selectedBlockId === block.id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-block-id={block.id}
      className={cn(
        "relative group",
        isDragging && "opacity-50 z-50 scale-[1.02]",
        // Selection indicator - blue left border like Notion
        isSelected &&
          "before:absolute before:-left-3 before:top-0 before:bottom-0 before:w-0.5 before:bg-blue-500 before:rounded-full"
      )}
    >
      {/* Drag Handle - Always slightly visible, fully visible on hover */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute -left-10 top-1/2 -translate-y-1/2",
          "opacity-30 group-hover:opacity-100 transition-all duration-200",
          "cursor-grab active:cursor-grabbing",
          "p-1.5 rounded-md hover:bg-muted",
          isSelected && "opacity-60"
        )}
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </div>

      <BlockRenderer block={block} isEditing={true} />
    </div>
  );
}

export default function BoardEditorPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { user, isLoaded } = useAuth();
  const { getBoard, updateBoard: updateBoardDB } = useBoards();
  const { currentBoard, setCurrentBoard, reorderBlocks, addBlock } =
    useBoardStore();
  const { setEditorMode, isSaving, setSaving, selectedBlockId, setSelectedBlock } =
    useEditor();
  const { openModal } = useModal();
  const { canUndo, canRedo, undo, redo } = useHistory();
  const router = useRouter();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [editingHeader, setEditingHeader] = useState(false);
  const [boardTitle, setBoardTitle] = useState("");
  const [boardDescription, setBoardDescription] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const loadedBoardIdRef = useRef<string | null>(null);

  // Refs to avoid stale closure issues in callbacks
  const currentBoardRef = useRef(currentBoard);
  const boardTitleRef = useRef(boardTitle);
  const boardDescriptionRef = useRef(boardDescription);

  // Keep refs in sync
  useEffect(() => {
    currentBoardRef.current = currentBoard;
  }, [currentBoard]);

  useEffect(() => {
    boardTitleRef.current = boardTitle;
  }, [boardTitle]);

  useEffect(() => {
    boardDescriptionRef.current = boardDescription;
  }, [boardDescription]);

  // Handle adding a new block from command palette
  const handleAddBlockFromPalette = useCallback(
    (type: BlockType) => {
      const board = currentBoardRef.current;
      if (!board) return;

      const newBlockId = `block_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}`;

      // Find insert position (after selected block or at end)
      const currentIndex = selectedBlockId
        ? board.blocks.findIndex((b) => b.id === selectedBlockId)
        : board.blocks.length - 1;

      const newBlock: Block = {
        id: newBlockId,
        type,
        order: currentIndex + 1,
        visible: true,
        settings: getDefaultBlockSettings(type),
      } as Block;

      addBlock(newBlock);
      setSelectedBlock(newBlockId);
      setHasUnsavedChanges(true);
    },
    [selectedBlockId, addBlock, setSelectedBlock]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Enable editor mode
  useEffect(() => {
    setEditorMode(true);
    return () => setEditorMode(false);
  }, [setEditorMode]);

  // Load board - only once per board ID
  useEffect(() => {
    const loadBoard = async () => {
      // Skip if already loaded this board
      if (loadedBoardIdRef.current === resolvedParams.id) return;
      
      if (!isLoaded) return;
      if (!user) {
        router.push("/login");
        return;
      }

      const board = await getBoard(resolvedParams.id);
      if (board) {
        if (board.ownerId !== user.id) {
          toast.error(
            "Access denied",
            "You don't have permission to edit this board"
          );
          router.push("/boards");
          return;
        }
        setCurrentBoard(board);
        setBoardTitle(board.title);
        setBoardDescription(board.description || "");
        loadedBoardIdRef.current = resolvedParams.id;
      } else {
        toast.error(
          "Board not found",
          "This board doesn't exist or has been deleted"
        );
        router.push("/boards");
      }
      setIsLoading(false);
    };

    loadBoard();
  }, [resolvedParams.id, user, isLoaded]);

  // Track unsaved changes
  useEffect(() => {
    if (!currentBoard) return;

    const hasChanges =
      boardTitle !== currentBoard.title ||
      boardDescription !== (currentBoard.description || "");

    setHasUnsavedChanges(hasChanges);
  }, [boardTitle, boardDescription, currentBoard]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Save handler - defined before keyboard shortcuts that use it
  const handleSave = useCallback(async () => {
    // Use refs to get latest values and avoid stale closure
    const board = currentBoardRef.current;
    const title = boardTitleRef.current;
    const description = boardDescriptionRef.current;

    if (!board) return;

    setSaving(true);
    const success = await updateBoardDB(board.id, {
      blocks: board.blocks,
      title,
      description,
    });
    setSaving(false);

    if (success) {
      toast.success("Changes saved", "Your board has been updated");
      setHasUnsavedChanges(false);
    } else {
      toast.error("Save failed", "Failed to save changes. Please try again.");
    }
  }, [updateBoardDB, setSaving, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Cmd/Ctrl shortcuts
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "s") {
          e.preventDefault();
          handleSave();
        } else if (e.key === "z" && !e.shiftKey) {
          if (canUndo) {
            e.preventDefault();
            undo();
          }
        } else if ((e.key === "z" && e.shiftKey) || e.key === "y") {
          if (canRedo) {
            e.preventDefault();
            redo();
          }
        } else if (e.key === "Enter" && !isTyping) {
          // Cmd+Enter to add new block after selected
          e.preventDefault();
          setShowCommandPalette(true);
        }
      }

      // Slash command (/) to open command palette
      if (e.key === "/" && !isTyping && !showCommandPalette) {
        e.preventDefault();
        setShowCommandPalette(true);
      }

      // Escape to close command palette or deselect block
      if (e.key === "Escape") {
        if (showCommandPalette) {
          setShowCommandPalette(false);
        } else if (selectedBlockId) {
          setSelectedBlock(null);
        }
      }

      // Arrow key navigation between blocks (when not typing)
      if (!isTyping && currentBoard) {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
          const currentIndex = selectedBlockId
            ? currentBoard.blocks.findIndex((b) => b.id === selectedBlockId)
            : -1;

          if (e.key === "ArrowUp" && currentIndex > 0) {
            setSelectedBlock(currentBoard.blocks[currentIndex - 1].id);
          } else if (
            e.key === "ArrowDown" &&
            currentIndex < currentBoard.blocks.length - 1
          ) {
            setSelectedBlock(currentBoard.blocks[currentIndex + 1].id);
          } else if (e.key === "ArrowDown" && currentIndex === -1 && currentBoard.blocks.length > 0) {
            // If no block selected, select the first one
            setSelectedBlock(currentBoard.blocks[0].id);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    canUndo,
    canRedo,
    undo,
    redo,
    handleSave,
    showCommandPalette,
    selectedBlockId,
    currentBoard,
    setSelectedBlock,
  ]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!currentBoard || !over || active.id === over.id) return;

    const oldIndex = currentBoard.blocks.findIndex((b) => b.id === active.id);
    const newIndex = currentBoard.blocks.findIndex((b) => b.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedBlocks = arrayMove(
        currentBoard.blocks,
        oldIndex,
        newIndex
      );
      const blocksWithUpdatedOrder = reorderedBlocks.map((block, index) => ({
        ...block,
        order: index,
      }));
      reorderBlocks(blocksWithUpdatedOrder);
      setHasUnsavedChanges(true);
    }
  };

  if (isLoading || !currentBoard) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 border-b bg-background">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Skeleton className="h-10 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Skeleton className="h-[600px] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

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

              {hasUnsavedChanges && (
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  • Unsaved changes
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
                disabled={isSaving}
                className={cn(
                  hasUnsavedChanges && "bg-emerald-600 hover:bg-emerald-700"
                )}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSaving ? "Saving..." : "Save"}
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
                    items={currentBoard.blocks.map((b) => b.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {[...currentBoard.blocks]
                      .sort((a, b) => a.order - b.order)
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
