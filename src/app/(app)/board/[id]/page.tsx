"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useBoards } from "@/hooks/use-boards";
import { useBoardStore, useHistory } from "@/stores/board-store";
import { useModal, useEditor } from "@/stores/ui-store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Block } from "@/types";
import { cn } from "@/lib/utils";
import { useToastNotification } from "@/components/ui/toast";

// Mark this route as dynamic for Next.js 16
export const dynamic = "force-dynamic";
export const dynamicParams = true;

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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        isDragging && "opacity-50 z-50 scale-[1.02]"
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute -left-10 top-1/2 -translate-y-1/2",
          "opacity-0 group-hover:opacity-100 transition-all duration-200",
          "cursor-grab active:cursor-grabbing",
          "p-1.5 rounded-md hover:bg-muted"
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
  const { currentBoard, setCurrentBoard, reorderBlocks } = useBoardStore();
  const { setEditorMode, isSaving, setSaving } = useEditor();
  const { openModal } = useModal();
  const { canUndo, canRedo, undo, redo } = useHistory();
  const router = useRouter();
  const toast = useToastNotification();
  
  const [isLoading, setIsLoading] = useState(true);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [editingHeader, setEditingHeader] = useState(false);
  const [boardTitle, setBoardTitle] = useState("");
  const [boardDescription, setBoardDescription] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  // Load board
  useEffect(() => {
    const loadBoard = async () => {
      if (!isLoaded) return;
      if (!user) {
        router.push("/login");
        return;
      }

      const board = await getBoard(resolvedParams.id);
      if (board) {
        if (board.ownerId !== user.id) {
          toast.error("Access denied", "You don't have permission to edit this board");
          router.push("/boards");
          return;
        }
        setCurrentBoard(board);
        setBoardTitle(board.title);
        setBoardDescription(board.description || "");
      } else {
        toast.error("Board not found", "This board doesn't exist or has been deleted");
        router.push("/boards");
      }
      setIsLoading(false);
    };

    loadBoard();
  }, [resolvedParams.id, user, isLoaded, getBoard, setCurrentBoard, router, toast]);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "s") {
          e.preventDefault();
          handleSave();
        } else if (e.key === "z" && !e.shiftKey && canUndo) {
          e.preventDefault();
          undo();
        } else if ((e.key === "z" && e.shiftKey) || (e.key === "y" && canRedo)) {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  const handleSave = useCallback(async () => {
    if (!currentBoard) return;

    setSaving(true);
    const success = await updateBoardDB(currentBoard.id, {
      blocks: currentBoard.blocks,
      title: boardTitle,
      description: boardDescription,
    });
    setSaving(false);

    if (success) {
      toast.success("Changes saved", "Your board has been updated");
      setHasUnsavedChanges(false);
    } else {
      toast.error("Save failed", "Failed to save changes. Please try again.");
    }
  }, [currentBoard, boardTitle, boardDescription, updateBoardDB, setSaving, toast]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!currentBoard || !over || active.id === over.id) return;

    const oldIndex = currentBoard.blocks.findIndex((b) => b.id === active.id);
    const newIndex = currentBoard.blocks.findIndex((b) => b.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedBlocks = arrayMove(currentBoard.blocks, oldIndex, newIndex);
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
    <>
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
                background:
                  currentBoard.theme.background.type === "gradient"
                    ? currentBoard.theme.background.value
                    : currentBoard.theme.background.value,
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
                      onKeyDown={(e) => e.key === "Enter" && setEditingHeader(false)}
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
                    {currentBoard.blocks
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
                  <p className="text-center text-sm mt-4" style={{ color: currentBoard.theme.textColor, opacity: 0.6 }}>
                    Your board is empty. Add your first block to get started!
                  </p>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘S</kbd> Save •{" "}
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘Z</kbd> Undo •{" "}
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘⇧Z</kbd> Redo •{" "}
                Drag blocks to reorder
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
