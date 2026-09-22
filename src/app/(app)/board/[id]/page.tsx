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

import { useBoardEditorHotkeys } from "./use-board-editor-hotkeys";
import { BoardEditorLoading } from "./board-editor-loading";
import { BoardEditorMain } from "./board-editor-main";
export default function BoardEditorPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { user, isLoaded } = useAuth();
  const { getBoard } = useBoards();
  const { currentBoard, setCurrentBoard, reorderBlocks, addBlock } =
    useBoardStore();
  const { setEditorMode, isSaving, selectedBlockId, setSelectedBlock } =
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
  const [baselineFingerprint, setBaselineFingerprint] = useState<string | null>(
    null
  );
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

      const sortedBlocks = [...board.blocks].sort((a, b) => a.order - b.order);
      const selectedIndex = selectedBlockId
        ? sortedBlocks.findIndex((b) => b.id === selectedBlockId)
        : -1;
      const insertIndex =
        selectedIndex >= 0 ? selectedIndex + 1 : sortedBlocks.length;

      const newBlock: Block = {
        id: newBlockId,
        type,
        order: insertIndex,
        visible: true,
        settings: getDefaultBlockSettings(type),
      } as Block;

      addBlock(newBlock);
      setSelectedBlock(newBlockId);
    },
    [selectedBlockId, addBlock, setSelectedBlock]
  );

  const getSavePayload = useCallback(() => {
    const board = currentBoardRef.current;
    if (!board) return null;
    return {
      blocks: board.blocks,
      title: boardTitleRef.current,
      description: boardDescriptionRef.current,
      theme: board.theme,
    };
  }, []);

  const stateFingerprint = useMemo(() => {
    if (!currentBoard) return "";
    return serializeBoardSaveState({
      title: boardTitle,
      description: boardDescription,
      blocks: currentBoard.blocks,
      theme: currentBoard.theme,
    });
  }, [boardTitle, boardDescription, currentBoard]);

  const {
    hasUnsavedChanges,
    isSaving: isAutoSaving,
    saveFailed,
    saveNow,
  } = useAutoSave({
    boardId: resolvedParams.id,
    stateFingerprint,
    getPayload: getSavePayload,
    baselineFingerprint,
    enabled: !isLoading && !!baselineFingerprint,
  });

  const saveStatus = getAutoSaveStatus({
    hasUnsavedChanges,
    isSaving: isAutoSaving || isSaving,
    saveFailed,
  });

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

  // Reset auto-save baseline when navigating to a different board
  useEffect(() => {
    setBaselineFingerprint(null);
    loadedBoardIdRef.current = null;
  }, [resolvedParams.id]);

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
        if (!canEditBoard(user.id, board)) {
          toast.error(
            "Access denied",
            "You don't have permission to edit this board"
          );
          router.push("/boards");
          return;
        }
        // Never keep password hashes in client editor state.
        const { passwordHash: _passwordHash, ...boardWithoutSecrets } = board;
        setCurrentBoard(boardWithoutSecrets as typeof board);
        setBoardTitle(boardWithoutSecrets.title);
        setBoardDescription(boardWithoutSecrets.description || "");
        setBaselineFingerprint(
          serializeBoardSaveState({
            title: boardWithoutSecrets.title,
            description: boardWithoutSecrets.description || "",
            blocks: boardWithoutSecrets.blocks,
            theme: boardWithoutSecrets.theme,
          })
        );
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
  }, [
    resolvedParams.id,
    user,
    isLoaded,
    getBoard,
    router,
    setCurrentBoard,
    toast,
  ]);

  // Warn before leaving only while saving or after a failed save
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (
        shouldWarnBeforeUnload({
          isSaving: isAutoSaving || isSaving,
          saveFailed,
        })
      ) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isAutoSaving, isSaving, saveFailed]);

  const handleSave = useCallback(async () => {
    const success = await saveNow();
    if (success) {
      toast.success("Changes saved", "Your board has been updated");
    } else {
      toast.error("Save failed", "Failed to save changes. Please try again.");
    }
  }, [saveNow, toast]);


  useBoardEditorHotkeys({
    canUndo,
    canRedo,
    undo,
    redo,
    handleSave,
    showCommandPalette,
    setShowCommandPalette,
    selectedBlockId,
    setSelectedBlock,
    currentBoard,
  });


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
    }
  };


  if (isLoading || !currentBoard) {
    return <BoardEditorLoading />;
  }

  return (
    <BoardEditorMain
      showCommandPalette={showCommandPalette}
      setShowCommandPalette={setShowCommandPalette}
      handleAddBlockFromPalette={handleAddBlockFromPalette}
      showAddBlock={showAddBlock}
      setShowAddBlock={setShowAddBlock}
      boardTitle={boardTitle}
      setBoardTitle={setBoardTitle}
      boardDescription={boardDescription}
      setBoardDescription={setBoardDescription}
      editingHeader={editingHeader}
      setEditingHeader={setEditingHeader}
      currentBoard={currentBoard}
      user={user}
      saveStatus={saveStatus}
      isAutoSaving={isAutoSaving}
      isSaving={isSaving}
      handleSave={handleSave}
      handleDragEnd={handleDragEnd}
      sensors={sensors}
      canUndo={canUndo}
      canRedo={canRedo}
      undo={undo}
      redo={redo}
      selectedBlockId={selectedBlockId}
      setSelectedBlock={setSelectedBlock}
      openModal={openModal}
    />
  );
}
