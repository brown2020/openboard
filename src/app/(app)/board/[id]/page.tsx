"use client";

import { use, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useBoards } from "@/hooks/use-boards";
import { useBoardStore } from "@/stores/board-store";
import { useUIStore } from "@/stores/ui-store";
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
      className={cn("relative group", isDragging && "opacity-50 z-50")}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
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
  const { getBoard, updateBoard } = useBoards();
  const { currentBoard, setCurrentBoard, reorderBlocks } = useBoardStore();
  const { setEditorMode, openModal } = useUIStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [boardTitle, setBoardTitle] = useState("");
  const [boardDescription, setBoardDescription] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setEditorMode(true);
    return () => setEditorMode(false);
  }, [setEditorMode]);

  useEffect(() => {
    const loadBoard = async () => {
      if (!isLoaded) return;
      if (!user) {
        router.push("/");
        return;
      }

      const board = await getBoard(resolvedParams.id);
      if (board) {
        if (board.ownerId !== user.id) {
          router.push("/boards");
          return;
        }
        setCurrentBoard(board);
        setBoardTitle(board.title);
        setBoardDescription(board.description || "");
      } else {
        router.push("/boards");
      }
      setIsLoading(false);
    };

    loadBoard();
  }, [resolvedParams.id, user, isLoaded, getBoard, setCurrentBoard, router]);

  const handleSave = async () => {
    if (!currentBoard) return;

    setIsSaving(true);
    await updateBoard(currentBoard.id, {
      blocks: currentBoard.blocks,
      title: boardTitle,
      description: boardDescription,
    });
    setIsSaving(false);
  };

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
      // Update order property on each block
      const blocksWithUpdatedOrder = reorderedBlocks.map((block, index) => ({
        ...block,
        order: index,
      }));
      reorderBlocks(blocksWithUpdatedOrder);
    }
  };

  if (isLoading || !currentBoard) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <>
      <ThemeModal />
      <AnalyticsModal />
      <ShareModal />
      <AddBlockSheet open={showAddBlock} onOpenChange={setShowAddBlock} />

      <div className="min-h-screen bg-background">
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
              <div>
                <h2 className="font-semibold">{boardTitle}</h2>
                <p className="text-xs text-muted-foreground">
                  /{user?.username}/{currentBoard.slug}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
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
                onClick={() => openModal("showThemeModal")}
              >
                <Palette className="w-4 h-4 mr-2" />
                Theme
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openModal("showAnalyticsModal")}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openModal("showShareModal")}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
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
              className="rounded-lg p-8 min-h-[600px]"
              style={{
                background:
                  currentBoard.theme.background.type === "gradient"
                    ? currentBoard.theme.background.value
                    : currentBoard.theme.background.value,
              }}
            >
              {/* Header - Editable */}
              <div className="text-center mb-8 space-y-4">
                {editingTitle ? (
                  <div className="space-y-2">
                    <Input
                      value={boardTitle}
                      onChange={(e) => setBoardTitle(e.target.value)}
                      className="text-3xl font-bold text-center"
                      style={{ color: currentBoard.theme.textColor }}
                      placeholder="Board Title"
                      onBlur={() => setEditingTitle(false)}
                      autoFocus
                    />
                    <Input
                      value={boardDescription}
                      onChange={(e) => setBoardDescription(e.target.value)}
                      className="text-lg text-center"
                      style={{
                        color: currentBoard.theme.textColor,
                        opacity: 0.8,
                      }}
                      placeholder="Board Description (optional)"
                      onBlur={() => setEditingTitle(false)}
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => setEditingTitle(true)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <h1
                      className="text-3xl font-bold mb-2"
                      style={{ color: currentBoard.theme.textColor }}
                    >
                      {boardTitle}
                    </h1>
                    {boardDescription && (
                      <p
                        className="text-lg"
                        style={{
                          color: currentBoard.theme.textColor,
                          opacity: 0.8,
                        }}
                      >
                        {boardDescription}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Blocks with Drag and Drop */}
              <div className="space-y-4 pl-8">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={currentBoard.blocks.map((b) => b.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {currentBoard.blocks.map((block) => (
                      <SortableBlock key={block.id} block={block} />
                    ))}
                  </SortableContext>
                </DndContext>

                {/* Add Block Button */}
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={() => setShowAddBlock(true)}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Block
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
