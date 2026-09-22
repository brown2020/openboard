"use client";

import { BoardEditorErrorBoundary } from "@/components/error-boundary";
import { AddBlockSheet } from "@/components/blocks/add-block-sheet";
import { ThemeModal } from "@/components/modals/theme-modal";
import { AnalyticsModal } from "@/components/modals/analytics-modal";
import { ShareModal } from "@/components/modals/share-modal";
import { CommandPalette } from "@/components/editor/command-palette";
import { BoardEditorToolbar } from "./board-editor-toolbar";
import { BoardEditorCanvas } from "./board-editor-canvas";
import type { BlockType, Board } from "@/types";
import type { ModalType } from "@/stores/ui-store";
import type { DragEndEvent, SensorDescriptor, SensorOptions } from "@dnd-kit/core";

type BoardEditorMainProps = {
  showCommandPalette: boolean;
  setShowCommandPalette: (v: boolean) => void;
  handleAddBlockFromPalette: (type: BlockType) => void;
  showAddBlock: boolean;
  setShowAddBlock: (v: boolean) => void;
  boardTitle: string;
  setBoardTitle: (v: string) => void;
  boardDescription: string;
  setBoardDescription: (v: string) => void;
  editingHeader: boolean;
  setEditingHeader: (v: boolean) => void;
  currentBoard: Board;
  user: { username: string } | null;
  saveStatus: string;
  isAutoSaving: boolean;
  isSaving: boolean;
  handleSave: () => void;
  handleDragEnd: (event: DragEndEvent) => void;
  sensors: SensorDescriptor<SensorOptions>[];
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  selectedBlockId: string | null;
  setSelectedBlock: (id: string | null) => void;
  openModal: (name: ModalType) => void;
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
    openModal,
  } = props;

  return (
    <BoardEditorErrorBoundary>
      {showCommandPalette ? (
        <CommandPalette
          key="command-palette-open"
          isOpen
          onClose={() => setShowCommandPalette(false)}
          onSelectBlock={handleAddBlockFromPalette}
        />
      ) : null}
      <ThemeModal />
      <AnalyticsModal />
      <ShareModal />
      <AddBlockSheet open={showAddBlock} onOpenChange={setShowAddBlock} />

      <div className="min-h-screen bg-muted/30">
        <BoardEditorToolbar
          boardTitle={boardTitle}
          username={user?.username}
          slug={currentBoard.slug}
          ownerUsername={currentBoard.ownerUsername}
          saveStatus={saveStatus}
          canUndo={canUndo}
          canRedo={canRedo}
          undo={undo}
          redo={redo}
          openModal={openModal}
          handleSave={handleSave}
          isAutoSaving={isAutoSaving}
          isSaving={isSaving}
        />
        <BoardEditorCanvas
          currentBoard={currentBoard}
          boardTitle={boardTitle}
          setBoardTitle={setBoardTitle}
          boardDescription={boardDescription}
          setBoardDescription={setBoardDescription}
          editingHeader={editingHeader}
          setEditingHeader={setEditingHeader}
          handleDragEnd={handleDragEnd}
          sensors={sensors}
          setShowAddBlock={setShowAddBlock}
        />
      </div>
    </BoardEditorErrorBoundary>
  );
}
