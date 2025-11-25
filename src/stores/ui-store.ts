import { create } from "zustand";
import { devtools } from "zustand/middleware";

/**
 * Modal types supported by the application
 */
export type ModalType =
  | "createBoard"
  | "settings"
  | "theme"
  | "analytics"
  | "templates"
  | "share"
  | "deleteConfirm"
  | "blockSettings";

/**
 * Toast notification types
 */
export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

/**
 * UI State Interface - Clean separation of concerns
 */
interface UIState {
  // Editor state
  isEditorMode: boolean;
  selectedBlockId: string | null;
  isDragging: boolean;
  isPreviewMode: boolean;
  isSaving: boolean;

  // Active modal (only one at a time)
  activeModal: ModalType | null;
  modalData: Record<string, unknown> | null;

  // Toast notifications
  toasts: Toast[];

  // Sidebar state
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;

  // Global loading state
  isGlobalLoading: boolean;
  loadingMessage: string | null;
}

/**
 * UI Actions Interface
 */
interface UIActions {
  // Editor actions
  setEditorMode: (isEditorMode: boolean) => void;
  setSelectedBlock: (blockId: string | null) => void;
  setDragging: (isDragging: boolean) => void;
  setPreviewMode: (isPreviewMode: boolean) => void;
  setSaving: (isSaving: boolean) => void;

  // Modal actions
  openModal: (modal: ModalType, data?: Record<string, unknown>) => void;
  closeModal: () => void;

  // Toast actions
  showToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
  clearToasts: () => void;

  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setSidebarCollapsed: (isCollapsed: boolean) => void;

  // Loading actions
  setGlobalLoading: (isLoading: boolean, message?: string) => void;

  // Reset
  reset: () => void;
}

type UIStore = UIState & UIActions;

const initialState: UIState = {
  // Editor state
  isEditorMode: false,
  selectedBlockId: null,
  isDragging: false,
  isPreviewMode: false,
  isSaving: false,

  // Modal state
  activeModal: null,
  modalData: null,

  // Toast state
  toasts: [],

  // Sidebar state
  isSidebarOpen: true,
  isSidebarCollapsed: false,

  // Loading state
  isGlobalLoading: false,
  loadingMessage: null,
};

/**
 * UI Store - Manages all UI-related state
 *
 * Uses Zustand with devtools for debugging support
 */
export const useUIStore = create<UIStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Editor actions
      setEditorMode: (isEditorMode) =>
        set({ isEditorMode }, false, "setEditorMode"),
      setSelectedBlock: (blockId) =>
        set({ selectedBlockId: blockId }, false, "setSelectedBlock"),
      setDragging: (isDragging) => set({ isDragging }, false, "setDragging"),
      setPreviewMode: (isPreviewMode) =>
        set({ isPreviewMode }, false, "setPreviewMode"),
      setSaving: (isSaving) => set({ isSaving }, false, "setSaving"),

      // Modal actions
      openModal: (modal, data) =>
        set(
          { activeModal: modal, modalData: data ?? null },
          false,
          "openModal"
        ),
      closeModal: () =>
        set({ activeModal: null, modalData: null }, false, "closeModal"),

      // Toast actions
      showToast: (toast) => {
        const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const newToast: Toast = { ...toast, id };

        set(
          (state) => ({ toasts: [...state.toasts, newToast] }),
          false,
          "showToast"
        );

        // Auto-dismiss after duration (default 5s)
        const duration = toast.duration ?? 5000;
        if (duration > 0) {
          setTimeout(() => {
            get().dismissToast(id);
          }, duration);
        }
      },
      dismissToast: (id) =>
        set(
          (state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id),
          }),
          false,
          "dismissToast"
        ),
      clearToasts: () => set({ toasts: [] }, false, "clearToasts"),

      // Sidebar actions
      toggleSidebar: () =>
        set(
          (state) => ({ isSidebarOpen: !state.isSidebarOpen }),
          false,
          "toggleSidebar"
        ),
      setSidebarOpen: (isOpen) =>
        set({ isSidebarOpen: isOpen }, false, "setSidebarOpen"),
      setSidebarCollapsed: (isCollapsed) =>
        set({ isSidebarCollapsed: isCollapsed }, false, "setSidebarCollapsed"),

      // Loading actions
      setGlobalLoading: (isLoading, message) =>
        set(
          { isGlobalLoading: isLoading, loadingMessage: message ?? null },
          false,
          "setGlobalLoading"
        ),

      // Reset
      reset: () => set(initialState, false, "reset"),
    }),
    { name: "openboard-ui" }
  )
);

/**
 * Convenience hooks for common UI patterns
 */
export const useModal = () => {
  const { activeModal, modalData, openModal, closeModal } = useUIStore();
  return { activeModal, modalData, openModal, closeModal };
};

export const useToast = () => {
  const { toasts, showToast, dismissToast, clearToasts } = useUIStore();

  return {
    toasts,
    success: (title: string, message?: string) =>
      showToast({ type: "success", title, message }),
    error: (title: string, message?: string) =>
      showToast({ type: "error", title, message }),
    warning: (title: string, message?: string) =>
      showToast({ type: "warning", title, message }),
    info: (title: string, message?: string) =>
      showToast({ type: "info", title, message }),
    dismiss: dismissToast,
    clear: clearToasts,
  };
};

export const useEditor = () => {
  const {
    isEditorMode,
    selectedBlockId,
    isDragging,
    isPreviewMode,
    isSaving,
    setEditorMode,
    setSelectedBlock,
    setDragging,
    setPreviewMode,
    setSaving,
  } = useUIStore();

  return {
    isEditorMode,
    selectedBlockId,
    isDragging,
    isPreviewMode,
    isSaving,
    setEditorMode,
    setSelectedBlock,
    setDragging,
    setPreviewMode,
    setSaving,
  };
};
