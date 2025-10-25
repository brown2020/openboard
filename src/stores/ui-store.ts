import { create } from "zustand";

interface UIState {
  // Editor state
  isEditorMode: boolean;
  selectedBlockId: string | null;
  isDragging: boolean;
  showPreview: boolean;

  // Modals
  showCreateBoardModal: boolean;
  showSettingsModal: boolean;
  showThemeModal: boolean;
  showAnalyticsModal: boolean;
  showTemplatesModal: boolean;
  showShareModal: boolean;

  // Actions
  setEditorMode: (isEditorMode: boolean) => void;
  setSelectedBlock: (blockId: string | null) => void;
  setDragging: (isDragging: boolean) => void;
  setShowPreview: (showPreview: boolean) => void;

  // Modal actions
  openModal: (
    modal: keyof Omit<
      UIState,
      | "openModal"
      | "closeModal"
      | "closeAllModals"
      | "isEditorMode"
      | "selectedBlockId"
      | "isDragging"
      | "showPreview"
      | "setEditorMode"
      | "setSelectedBlock"
      | "setDragging"
      | "setShowPreview"
    >
  ) => void;
  closeModal: (
    modal: keyof Omit<
      UIState,
      | "openModal"
      | "closeModal"
      | "closeAllModals"
      | "isEditorMode"
      | "selectedBlockId"
      | "isDragging"
      | "showPreview"
      | "setEditorMode"
      | "setSelectedBlock"
      | "setDragging"
      | "setShowPreview"
    >
  ) => void;
  closeAllModals: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Editor state
  isEditorMode: false,
  selectedBlockId: null,
  isDragging: false,
  showPreview: false,

  // Modals
  showCreateBoardModal: false,
  showSettingsModal: false,
  showThemeModal: false,
  showAnalyticsModal: false,
  showTemplatesModal: false,
  showShareModal: false,

  // Actions
  setEditorMode: (isEditorMode) => set({ isEditorMode }),
  setSelectedBlock: (blockId) => set({ selectedBlockId: blockId }),
  setDragging: (isDragging) => set({ isDragging }),
  setShowPreview: (showPreview) => set({ showPreview }),

  // Modal actions
  openModal: (modal) => set({ [modal]: true }),
  closeModal: (modal) => set({ [modal]: false }),
  closeAllModals: () =>
    set({
      showCreateBoardModal: false,
      showSettingsModal: false,
      showThemeModal: false,
      showAnalyticsModal: false,
      showTemplatesModal: false,
      showShareModal: false,
    }),
}));
