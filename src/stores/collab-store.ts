import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Operation } from "@/lib/operations";

/**
 * Cursor position in the editor
 */
export interface CursorPosition {
  blockId: string;
  offset?: number;
}

/**
 * Active collaborator information
 */
export interface Collaborator {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  cursor?: CursorPosition;
  lastSeen: number;
}

/**
 * Sync status
 */
export type SyncStatus = "synced" | "syncing" | "pending" | "offline" | "error";

/**
 * Collaboration state interface
 */
interface CollabState {
  // Active collaborators
  collaborators: Map<string, Collaborator>;

  // Current user's cursor
  localCursor: CursorPosition | null;

  // Pending operations to sync
  pendingOperations: Operation[];

  // Last synced operation ID
  lastSyncedOperationId: string | null;

  // Sync status
  syncStatus: SyncStatus;

  // Connection status
  isConnected: boolean;

  // Server version for conflict detection
  serverVersion: number;

  // Local version
  localVersion: number;
}

/**
 * Collaboration actions interface
 */
interface CollabActions {
  // Collaborator management
  addCollaborator: (collaborator: Collaborator) => void;
  removeCollaborator: (userId: string) => void;
  updateCollaboratorCursor: (userId: string, cursor: CursorPosition) => void;
  updateCollaboratorPresence: (userId: string) => void;

  // Local cursor
  setLocalCursor: (cursor: CursorPosition | null) => void;

  // Operations queue
  queueOperation: (operation: Operation) => void;
  acknowledgeOperation: (operationId: string) => void;
  clearPendingOperations: () => void;

  // Sync status
  setSyncStatus: (status: SyncStatus) => void;
  setConnected: (connected: boolean) => void;

  // Version tracking
  incrementLocalVersion: () => void;
  setServerVersion: (version: number) => void;

  // Reset
  reset: () => void;
}

type CollabStore = CollabState & CollabActions;

const initialState: CollabState = {
  collaborators: new Map(),
  localCursor: null,
  pendingOperations: [],
  lastSyncedOperationId: null,
  syncStatus: "synced",
  isConnected: false,
  serverVersion: 0,
  localVersion: 0,
};

// Color palette for collaborators
const COLLABORATOR_COLORS = [
  "#F87171", // red
  "#FB923C", // orange
  "#FBBF24", // amber
  "#34D399", // emerald
  "#22D3EE", // cyan
  "#60A5FA", // blue
  "#A78BFA", // violet
  "#F472B6", // pink
];

let colorIndex = 0;
function getNextColor(): string {
  const color = COLLABORATOR_COLORS[colorIndex % COLLABORATOR_COLORS.length];
  colorIndex++;
  return color;
}

/**
 * Collaboration Store - Manages real-time collaboration state
 *
 * Features:
 * - Active collaborator tracking
 * - Cursor position broadcasting
 * - Operation queue for offline support
 * - Version tracking for conflict resolution
 */
export const useCollabStore = create<CollabStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Collaborator management
      addCollaborator: (collaborator) =>
        set(
          (state) => {
            const newCollaborators = new Map(state.collaborators);
            newCollaborators.set(collaborator.userId, {
              ...collaborator,
              color: collaborator.color || getNextColor(),
            });
            return { collaborators: newCollaborators };
          },
          false,
          "addCollaborator"
        ),

      removeCollaborator: (userId) =>
        set(
          (state) => {
            const newCollaborators = new Map(state.collaborators);
            newCollaborators.delete(userId);
            return { collaborators: newCollaborators };
          },
          false,
          "removeCollaborator"
        ),

      updateCollaboratorCursor: (userId, cursor) =>
        set(
          (state) => {
            const collaborator = state.collaborators.get(userId);
            if (!collaborator) return state;

            const newCollaborators = new Map(state.collaborators);
            newCollaborators.set(userId, {
              ...collaborator,
              cursor,
              lastSeen: Date.now(),
            });
            return { collaborators: newCollaborators };
          },
          false,
          "updateCollaboratorCursor"
        ),

      updateCollaboratorPresence: (userId) =>
        set(
          (state) => {
            const collaborator = state.collaborators.get(userId);
            if (!collaborator) return state;

            const newCollaborators = new Map(state.collaborators);
            newCollaborators.set(userId, {
              ...collaborator,
              lastSeen: Date.now(),
            });
            return { collaborators: newCollaborators };
          },
          false,
          "updateCollaboratorPresence"
        ),

      // Local cursor
      setLocalCursor: (cursor) =>
        set({ localCursor: cursor }, false, "setLocalCursor"),

      // Operations queue
      queueOperation: (operation) =>
        set(
          (state) => ({
            pendingOperations: [...state.pendingOperations, operation],
            syncStatus: "pending",
          }),
          false,
          "queueOperation"
        ),

      acknowledgeOperation: (operationId) =>
        set(
          (state) => ({
            pendingOperations: state.pendingOperations.filter(
              (op) => op.id !== operationId
            ),
            lastSyncedOperationId: operationId,
            syncStatus:
              state.pendingOperations.length <= 1 ? "synced" : "pending",
          }),
          false,
          "acknowledgeOperation"
        ),

      clearPendingOperations: () =>
        set(
          { pendingOperations: [], syncStatus: "synced" },
          false,
          "clearPendingOperations"
        ),

      // Sync status
      setSyncStatus: (status) =>
        set({ syncStatus: status }, false, "setSyncStatus"),

      setConnected: (connected) =>
        set(
          {
            isConnected: connected,
            syncStatus: connected ? get().syncStatus : "offline",
          },
          false,
          "setConnected"
        ),

      // Version tracking
      incrementLocalVersion: () =>
        set(
          (state) => ({ localVersion: state.localVersion + 1 }),
          false,
          "incrementLocalVersion"
        ),

      setServerVersion: (version) =>
        set({ serverVersion: version }, false, "setServerVersion"),

      // Reset
      reset: () => set(initialState, false, "reset"),
    }),
    { name: "openboard-collab" }
  )
);

/**
 * Convenience hook for active collaborators list
 */
export const useActiveCollaborators = () => {
  const { collaborators } = useCollabStore();

  // Filter to only collaborators seen in last 30 seconds
  const cutoff = Date.now() - 30000;
  return Array.from(collaborators.values()).filter(
    (c) => c.lastSeen > cutoff
  );
};

/**
 * Convenience hook for sync status
 */
export const useSyncStatus = () => {
  const { syncStatus, isConnected, pendingOperations } = useCollabStore();
  return {
    syncStatus,
    isConnected,
    pendingCount: pendingOperations.length,
    isSynced: syncStatus === "synced" && pendingOperations.length === 0,
  };
};
