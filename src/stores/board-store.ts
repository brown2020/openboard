import { create } from "zustand";
import { Board, Block } from "@/types";

interface BoardState {
  // Current boards
  boards: Board[];
  currentBoard: Board | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setBoards: (boards: Board[]) => void;
  setCurrentBoard: (board: Board | null) => void;
  addBoard: (board: Board) => void;
  updateBoard: (boardId: string, updates: Partial<Board>) => void;
  deleteBoard: (boardId: string) => void;

  // Block actions
  addBlock: (block: Block) => void;
  updateBlock: (blockId: string, updates: Partial<Block>) => void;
  deleteBlock: (blockId: string) => void;
  reorderBlocks: (blocks: Block[]) => void;

  // UI state
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  boards: [],
  currentBoard: null,
  isLoading: false,
  error: null,

  setBoards: (boards) => set({ boards }),

  setCurrentBoard: (board) => set({ currentBoard: board }),

  addBoard: (board) =>
    set((state) => ({
      boards: [...state.boards, board],
    })),

  updateBoard: (boardId, updates) =>
    set((state) => ({
      boards: state.boards.map((board) =>
        board.id === boardId ? { ...board, ...updates } : board
      ),
      currentBoard:
        state.currentBoard?.id === boardId
          ? { ...state.currentBoard, ...updates }
          : state.currentBoard,
    })),

  deleteBoard: (boardId) =>
    set((state) => ({
      boards: state.boards.filter((board) => board.id !== boardId),
      currentBoard:
        state.currentBoard?.id === boardId ? null : state.currentBoard,
    })),

  addBlock: (block) =>
    set((state) => {
      if (!state.currentBoard) return state;
      return {
        currentBoard: {
          ...state.currentBoard,
          blocks: [...state.currentBoard.blocks, block],
        },
      };
    }),

  updateBlock: (blockId, updates) =>
    set((state) => {
      if (!state.currentBoard) return state;
      const updatedBoard = {
        ...state.currentBoard,
        blocks: state.currentBoard.blocks.map((block) =>
          block.id === blockId ? ({ ...block, ...updates } as Block) : block
        ),
      };
      return {
        ...state,
        currentBoard: updatedBoard,
      };
    }),

  deleteBlock: (blockId) =>
    set((state) => {
      if (!state.currentBoard) return state;
      return {
        currentBoard: {
          ...state.currentBoard,
          blocks: state.currentBoard.blocks.filter(
            (block) => block.id !== blockId
          ),
        },
      };
    }),

  reorderBlocks: (blocks) =>
    set((state) => {
      if (!state.currentBoard) return state;
      return {
        currentBoard: {
          ...state.currentBoard,
          blocks,
        },
      };
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),
}));
