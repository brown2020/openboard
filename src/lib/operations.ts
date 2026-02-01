import { Block, BoardTheme } from "@/types";

/**
 * Operation types for tracking changes
 */
export type OperationType =
  | "block:create"
  | "block:update"
  | "block:delete"
  | "block:move"
  | "block:reorder"
  | "blocks:batch"
  | "theme:update"
  | "board:update";

/**
 * Base operation interface
 */
export interface BaseOperation {
  id: string;
  type: OperationType;
  timestamp: number;
  description: string;
}

/**
 * Block create operation
 */
export interface BlockCreateOperation extends BaseOperation {
  type: "block:create";
  blockId: string;
  block: Block;
}

/**
 * Block update operation
 */
export interface BlockUpdateOperation extends BaseOperation {
  type: "block:update";
  blockId: string;
  oldValue: Partial<Block>;
  newValue: Partial<Block>;
}

/**
 * Block delete operation
 */
export interface BlockDeleteOperation extends BaseOperation {
  type: "block:delete";
  blockId: string;
  block: Block; // Store full block for undo
}

/**
 * Block move operation (change parent/order)
 */
export interface BlockMoveOperation extends BaseOperation {
  type: "block:move";
  blockId: string;
  oldParentId?: string;
  newParentId?: string;
  oldOrder: number;
  newOrder: number;
}

/**
 * Block reorder operation
 */
export interface BlockReorderOperation extends BaseOperation {
  type: "block:reorder";
  oldOrder: Array<{ id: string; order: number }>;
  newOrder: Array<{ id: string; order: number }>;
}

/**
 * Batch blocks operation
 */
export interface BlocksBatchOperation extends BaseOperation {
  type: "blocks:batch";
  operations: Operation[];
}

/**
 * Theme update operation
 */
export interface ThemeUpdateOperation extends BaseOperation {
  type: "theme:update";
  oldTheme: Partial<BoardTheme>;
  newTheme: Partial<BoardTheme>;
}

/**
 * Board update operation
 */
export interface BoardUpdateOperation extends BaseOperation {
  type: "board:update";
  oldValue: Record<string, unknown>;
  newValue: Record<string, unknown>;
}

/**
 * Union type of all operations
 */
export type Operation =
  | BlockCreateOperation
  | BlockUpdateOperation
  | BlockDeleteOperation
  | BlockMoveOperation
  | BlockReorderOperation
  | BlocksBatchOperation
  | ThemeUpdateOperation
  | BoardUpdateOperation;

/**
 * Generate a unique operation ID
 */
export function generateOperationId(): string {
  return `op_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Create a new operation with base fields
 */
export function createOperation<T extends Operation>(
  type: T["type"],
  description: string,
  data: Omit<T, "id" | "type" | "timestamp" | "description">
): T {
  return {
    id: generateOperationId(),
    type,
    timestamp: Date.now(),
    description,
    ...data,
  } as T;
}

/**
 * Apply an operation to blocks array (for redo)
 */
export function applyOperation(blocks: Block[], operation: Operation): Block[] {
  switch (operation.type) {
    case "block:create": {
      const op = operation as BlockCreateOperation;
      return [...blocks, op.block];
    }

    case "block:update": {
      const op = operation as BlockUpdateOperation;
      return blocks.map((block) =>
        block.id === op.blockId ? ({ ...block, ...op.newValue } as Block) : block
      );
    }

    case "block:delete": {
      const op = operation as BlockDeleteOperation;
      return blocks.filter((block) => block.id !== op.blockId);
    }

    case "block:move": {
      const op = operation as BlockMoveOperation;
      return blocks.map((block) =>
        block.id === op.blockId
          ? ({ ...block, parentId: op.newParentId, order: op.newOrder } as Block)
          : block
      );
    }

    case "block:reorder": {
      const op = operation as BlockReorderOperation;
      const orderMap = new Map(op.newOrder.map((item) => [item.id, item.order]));
      return blocks.map((block) => ({
        ...block,
        order: orderMap.get(block.id) ?? block.order,
      } as Block));
    }

    case "blocks:batch": {
      const op = operation as BlocksBatchOperation;
      let result = blocks;
      op.operations.forEach((subOp) => {
        result = applyOperation(result, subOp);
      });
      return result;
    }

    default:
      return blocks;
  }
}

/**
 * Reverse an operation to blocks array (for undo)
 */
export function reverseOperation(blocks: Block[], operation: Operation): Block[] {
  switch (operation.type) {
    case "block:create": {
      const op = operation as BlockCreateOperation;
      return blocks.filter((block) => block.id !== op.blockId);
    }

    case "block:update": {
      const op = operation as BlockUpdateOperation;
      return blocks.map((block) =>
        block.id === op.blockId ? ({ ...block, ...op.oldValue } as Block) : block
      );
    }

    case "block:delete": {
      const op = operation as BlockDeleteOperation;
      return [...blocks, op.block];
    }

    case "block:move": {
      const op = operation as BlockMoveOperation;
      return blocks.map((block) =>
        block.id === op.blockId
          ? ({ ...block, parentId: op.oldParentId, order: op.oldOrder } as Block)
          : block
      );
    }

    case "block:reorder": {
      const op = operation as BlockReorderOperation;
      const orderMap = new Map(op.oldOrder.map((item) => [item.id, item.order]));
      return blocks.map((block) => ({
        ...block,
        order: orderMap.get(block.id) ?? block.order,
      } as Block));
    }

    case "blocks:batch": {
      const op = operation as BlocksBatchOperation;
      let result = blocks;
      // Apply in reverse order for undo
      [...op.operations].reverse().forEach((subOp) => {
        result = reverseOperation(result, subOp);
      });
      return result;
    }

    default:
      return blocks;
  }
}
