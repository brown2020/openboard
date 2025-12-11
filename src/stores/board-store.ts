import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { Board, Block, BlockType, BoardTheme } from "@/types";
import { DEFAULT_THEME } from "@/lib/constants";

/**
 * Board operation status for tracking async operations
 */
export type OperationStatus = "idle" | "loading" | "success" | "error";

/**
 * Undo/Redo history entry
 */
interface HistoryEntry {
  blocks: Block[];
  timestamp: number;
  description: string;
}

/**
 * Board State Interface
 */
interface BoardState {
  // Board data
  boards: Board[];
  currentBoard: Board | null;

  // Operation status
  status: OperationStatus;
  error: string | null;

  // History for undo/redo
  history: HistoryEntry[];
  historyIndex: number;
  maxHistorySize: number;
}

/**
 * Board Actions Interface
 */
interface BoardActions {
  // Board CRUD
  setBoards: (boards: Board[]) => void;
  setCurrentBoard: (board: Board | null) => void;
  addBoard: (board: Board) => void;
  updateBoard: (boardId: string, updates: Partial<Board>) => void;
  deleteBoard: (boardId: string) => void;

  // Block CRUD with proper typing
  addBlock: (block: Block) => void;
  updateBlock: <T extends Block>(blockId: string, updates: Partial<T>) => void;
  deleteBlock: (blockId: string) => void;
  reorderBlocks: (blocks: Block[]) => void;
  toggleBlockVisibility: (blockId: string) => void;
  duplicateBlock: (blockId: string) => void;

  // Batch operations
  deleteMultipleBlocks: (blockIds: string[]) => void;
  updateMultipleBlocks: (
    updates: Array<{ id: string; updates: Partial<Block> }>
  ) => void;

  // Theme operations
  updateTheme: (theme: Partial<BoardTheme>) => void;
  resetTheme: () => void;

  // History operations
  undo: () => void;
  redo: () => void;
  saveToHistory: (description: string) => void;
  clearHistory: () => void;

  // Status operations
  setStatus: (status: OperationStatus) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Computed / helpers
  getBlockById: (blockId: string) => Block | undefined;
  getBlocksByType: (type: BlockType) => Block[];

  // Reset
  reset: () => void;
}

type BoardStore = BoardState & BoardActions;

const initialState: BoardState = {
  boards: [],
  currentBoard: null,
  status: "idle",
  error: null,
  history: [],
  historyIndex: -1,
  maxHistorySize: 50,
};

/**
 * Board Store - Manages all board and block-related state
 *
 * Features:
 * - Full CRUD for boards and blocks
 * - Undo/redo support
 * - Batch operations
 * - Type-safe block updates
 */
export const useBoardStore = create<BoardStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      // Board CRUD
      setBoards: (boards) =>
        set({ boards, status: "success" }, false, "setBoards"),

      setCurrentBoard: (board) => {
        set({ currentBoard: board }, false, "setCurrentBoard");
        // Clear history when switching boards
        if (board) {
          get().saveToHistory("Initial state");
        }
      },

      addBoard: (board) =>
        set(
          (state) => ({ boards: [...state.boards, board] }),
          false,
          "addBoard"
        ),

      updateBoard: (boardId, updates) =>
        set(
          (state) => ({
            boards: state.boards.map((board) =>
              board.id === boardId ? { ...board, ...updates } : board
            ),
            currentBoard:
              state.currentBoard?.id === boardId
                ? { ...state.currentBoard, ...updates }
                : state.currentBoard,
          }),
          false,
          "updateBoard"
        ),

      deleteBoard: (boardId) =>
        set(
          (state) => ({
            boards: state.boards.filter((board) => board.id !== boardId),
            currentBoard:
              state.currentBoard?.id === boardId ? null : state.currentBoard,
          }),
          false,
          "deleteBoard"
        ),

      // Block CRUD
      addBlock: (block) => {
        const state = get();
        if (!state.currentBoard) return;

        set(
          {
            currentBoard: {
              ...state.currentBoard,
              blocks: [...state.currentBoard.blocks, block],
            },
          },
          false,
          "addBlock"
        );
        get().saveToHistory(`Added ${block.type} block`);
      },

      updateBlock: (blockId, updates) => {
        const state = get();
        if (!state.currentBoard) return;

        set(
          {
            currentBoard: {
              ...state.currentBoard,
              blocks: state.currentBoard.blocks.map((block) =>
                block.id === blockId
                  ? ({ ...block, ...updates } as Block)
                  : block
              ),
            },
          },
          false,
          "updateBlock"
        );
      },

      deleteBlock: (blockId) => {
        const state = get();
        if (!state.currentBoard) return;

        const block = state.currentBoard.blocks.find((b) => b.id === blockId);
        set(
          {
            currentBoard: {
              ...state.currentBoard,
              blocks: state.currentBoard.blocks.filter((b) => b.id !== blockId),
            },
          },
          false,
          "deleteBlock"
        );
        if (block) {
          get().saveToHistory(`Deleted ${block.type} block`);
        }
      },

      reorderBlocks: (blocks) => {
        const state = get();
        if (!state.currentBoard) return;

        const updatedBlocks = blocks.map((block, index) => ({
          ...block,
          order: index,
        }));

        set(
          {
            currentBoard: {
              ...state.currentBoard,
              blocks: updatedBlocks,
            },
          },
          false,
          "reorderBlocks"
        );
        get().saveToHistory("Reordered blocks");
      },

      toggleBlockVisibility: (blockId) => {
        const state = get();
        if (!state.currentBoard) return;

        set(
          {
            currentBoard: {
              ...state.currentBoard,
              blocks: state.currentBoard.blocks.map((block) =>
                block.id === blockId
                  ? { ...block, visible: !block.visible }
                  : block
              ),
            },
          },
          false,
          "toggleBlockVisibility"
        );
      },

      duplicateBlock: (blockId) => {
        const state = get();
        if (!state.currentBoard) return;

        const block = state.currentBoard.blocks.find((b) => b.id === blockId);
        if (!block) return;

        const newBlock: Block = {
          ...block,
          id: `block_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          order: state.currentBoard.blocks.length,
        };

        set(
          {
            currentBoard: {
              ...state.currentBoard,
              blocks: [...state.currentBoard.blocks, newBlock],
            },
          },
          false,
          "duplicateBlock"
        );
        get().saveToHistory(`Duplicated ${block.type} block`);
      },

      // Batch operations
      deleteMultipleBlocks: (blockIds) => {
        const state = get();
        if (!state.currentBoard) return;

        set(
          {
            currentBoard: {
              ...state.currentBoard,
              blocks: state.currentBoard.blocks.filter(
                (b) => !blockIds.includes(b.id)
              ),
            },
          },
          false,
          "deleteMultipleBlocks"
        );
        get().saveToHistory(`Deleted ${blockIds.length} blocks`);
      },

      updateMultipleBlocks: (updates) => {
        const state = get();
        if (!state.currentBoard) return;

        set(
          {
            currentBoard: {
              ...state.currentBoard,
              blocks: state.currentBoard.blocks.map((block) => {
                const update = updates.find((u) => u.id === block.id);
                return update
                  ? ({ ...block, ...update.updates } as Block)
                  : block;
              }),
            },
          },
          false,
          "updateMultipleBlocks"
        );
      },

      // Theme operations
      updateTheme: (theme) => {
        const state = get();
        if (!state.currentBoard) return;

        set(
          {
            currentBoard: {
              ...state.currentBoard,
              theme: { ...state.currentBoard.theme, ...theme },
            },
          },
          false,
          "updateTheme"
        );
      },

      resetTheme: () => {
        const state = get();
        if (!state.currentBoard) return;

        set(
          {
            currentBoard: {
              ...state.currentBoard,
              theme: DEFAULT_THEME,
            },
          },
          false,
          "resetTheme"
        );
      },

      // History operations
      undo: () => {
        const state = get();
        if (state.historyIndex <= 0 || !state.currentBoard) return;

        const newIndex = state.historyIndex - 1;
        const entry = state.history[newIndex];

        set(
          {
            historyIndex: newIndex,
            currentBoard: {
              ...state.currentBoard,
              blocks: entry.blocks,
            },
          },
          false,
          "undo"
        );
      },

      redo: () => {
        const state = get();
        if (
          state.historyIndex >= state.history.length - 1 ||
          !state.currentBoard
        )
          return;

        const newIndex = state.historyIndex + 1;
        const entry = state.history[newIndex];

        set(
          {
            historyIndex: newIndex,
            currentBoard: {
              ...state.currentBoard,
              blocks: entry.blocks,
            },
          },
          false,
          "redo"
        );
      },

      saveToHistory: (description) => {
        const state = get();
        if (!state.currentBoard) return;

        const entry: HistoryEntry = {
          blocks: JSON.parse(JSON.stringify(state.currentBoard.blocks)),
          timestamp: Date.now(),
          description,
        };

        // Remove any future history if we're not at the end
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(entry);

        // Limit history size
        if (newHistory.length > state.maxHistorySize) {
          newHistory.shift();
        }

        set(
          {
            history: newHistory,
            historyIndex: newHistory.length - 1,
          },
          false,
          "saveToHistory"
        );
      },

      clearHistory: () =>
        set({ history: [], historyIndex: -1 }, false, "clearHistory"),

      // Status operations
      setStatus: (status) => set({ status }, false, "setStatus"),
      setError: (error) => set({ error, status: "error" }, false, "setError"),
      clearError: () =>
        set({ error: null, status: "idle" }, false, "clearError"),

      // Computed / helpers
      getBlockById: (blockId) => {
        const state = get();
        return state.currentBoard?.blocks.find((b) => b.id === blockId);
      },

      getBlocksByType: (type) => {
        const state = get();
        return state.currentBoard?.blocks.filter((b) => b.type === type) ?? [];
      },

      // Reset
      reset: () => set(initialState, false, "reset"),
    })),
    { name: "openboard-board" }
  )
);

/**
 * Convenience hooks
 */
export const useCurrentBoard = () => {
  const { currentBoard, status, error } = useBoardStore();
  return { board: currentBoard, status, error };
};

export const useBlocks = () => {
  const { currentBoard, addBlock, updateBlock, deleteBlock, reorderBlocks } =
    useBoardStore();
  return {
    blocks: currentBoard?.blocks ?? [],
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
  };
};

export const useHistory = () => {
  const { history, historyIndex, undo, redo, clearHistory } = useBoardStore();
  return {
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    undo,
    redo,
    clear: clearHistory,
  };
};
