"use client";

import { use, useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useBoards } from "@/hooks/use-boards";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useBoardStore, useHistory } from "@/stores/board-store";
import { useModal, useEditor, useToast } from "@/stores/ui-store";
import { redirect } from "next/navigation";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Block, BlockType } from "@/types";
import { canEditBoard } from "@/lib/board-access";
import {
  getAutoSaveStatus,
  serializeBoardSaveState,
  shouldWarnBeforeUnload,
} from "@/lib/board-save";
import { getDefaultBlockSettings } from "@/lib/default-block-settings";
import { useBoardEditorHotkeys } from "./use-board-editor-hotkeys";
import { BoardEditorLoading } from "./board-editor-loading";
import { BoardEditorMain } from "./board-editor-main";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BoardEditorPage({ params }: PageProps) {
  const resolvedParams = use(params);
  return (
    <BoardEditorSession
      key={resolvedParams.id}
      boardId={resolvedParams.id}
    />
  );
}

function BoardEditorSession({ boardId }: { boardId: string }) {
  const { user, isLoaded } = useAuth();
  const { getBoard } = useBoards();
  const { currentBoard, setCurrentBoard, reorderBlocks, addBlock } =
    useBoardStore();
  const { setEditorMode, isSaving, selectedBlockId, setSelectedBlock } =
    useEditor();
  const { openModal } = useModal();
  const { canUndo, canRedo, undo, redo } = useHistory();
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

  const currentBoardRef = useRef(currentBoard);
  const boardTitleRef = useRef(boardTitle);
  const boardDescriptionRef = useRef(boardDescription);

  useEffect(() => {
    currentBoardRef.current = currentBoard;
  }, [currentBoard]);

  useEffect(() => {
    boardTitleRef.current = boardTitle;
  }, [boardTitle]);

  useEffect(() => {
    boardDescriptionRef.current = boardDescription;
  }, [boardDescription]);

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
    boardId,
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

  useEffect(() => {
    setEditorMode(true);
    return () => setEditorMode(false);
  }, [setEditorMode]);

  useEffect(() => {
    let cancelled = false;

    const loadBoard = async () => {
      if (!isLoaded) return;
      if (!user) {
        return;
      }

      const board = await getBoard(boardId);
      if (cancelled) return;

      if (board) {
        if (!canEditBoard(user.id, board)) {
          toast.error(
            "Access denied",
            "You don't have permission to edit this board"
          );
          if (!cancelled) {
            window.location.replace("/boards");
          }
          return;
        }
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
        loadedBoardIdRef.current = boardId;
      } else {
        toast.error(
          "Board not found",
          "This board doesn't exist or has been deleted"
        );
        if (!cancelled) {
          window.location.replace("/boards");
        }
      }
      if (!cancelled) {
        setIsLoading(false);
      }
    };

    void loadBoard();
    return () => {
      cancelled = true;
    };
  }, [boardId, user, isLoaded, getBoard, setCurrentBoard, toast]);

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

  if (isLoaded && !user) {
    redirect("/login");
  }

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
