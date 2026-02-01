import { Block } from "@/types";

/**
 * Tree node representation of a block with its children
 */
export interface BlockTreeNode {
  block: Block;
  children: BlockTreeNode[];
}

/**
 * Build a tree structure from flat blocks array
 * Blocks with parentId are nested under their parent
 */
export function buildBlockTree(blocks: Block[]): BlockTreeNode[] {
  const blockMap = new Map<string, Block>();
  const childrenMap = new Map<string, string[]>();

  // Index all blocks
  blocks.forEach((block) => {
    blockMap.set(block.id, block);

    const parentId = block.parentId || "root";
    if (!childrenMap.has(parentId)) {
      childrenMap.set(parentId, []);
    }
    childrenMap.get(parentId)!.push(block.id);
  });

  // Build tree recursively
  function buildNode(blockId: string): BlockTreeNode | null {
    const block = blockMap.get(blockId);
    if (!block) return null;

    const childIds = childrenMap.get(blockId) || [];
    const children = childIds
      .map(buildNode)
      .filter((node): node is BlockTreeNode => node !== null)
      .sort((a, b) => a.block.order - b.block.order);

    return { block, children };
  }

  // Get root-level blocks (no parent or parentId is null/undefined)
  const rootIds = childrenMap.get("root") || [];
  return rootIds
    .map(buildNode)
    .filter((node): node is BlockTreeNode => node !== null)
    .sort((a, b) => a.block.order - b.block.order);
}

/**
 * Flatten a tree back to an array, preserving order
 */
export function flattenBlockTree(tree: BlockTreeNode[]): Block[] {
  const result: Block[] = [];

  function traverse(nodes: BlockTreeNode[], depth: number) {
    nodes.forEach((node) => {
      result.push({ ...node.block, depth });
      if (node.children.length > 0) {
        traverse(node.children, depth + 1);
      }
    });
  }

  traverse(tree, 0);
  return result;
}

/**
 * Get all blocks at a specific depth level
 */
export function getBlocksAtDepth(blocks: Block[], depth: number): Block[] {
  return blocks.filter((b) => (b.depth ?? 0) === depth);
}

/**
 * Get root blocks (depth 0 or no parent)
 */
export function getRootBlocks(blocks: Block[]): Block[] {
  return blocks.filter((b) => !b.parentId && (b.depth ?? 0) === 0);
}

/**
 * Get children of a specific block
 */
export function getChildBlocks(blocks: Block[], parentId: string): Block[] {
  return blocks
    .filter((b) => b.parentId === parentId)
    .sort((a, b) => a.order - b.order);
}

/**
 * Get the parent of a block
 */
export function getParentBlock(
  blocks: Block[],
  blockId: string
): Block | undefined {
  const block = blocks.find((b) => b.id === blockId);
  if (!block?.parentId) return undefined;
  return blocks.find((b) => b.id === block.parentId);
}

/**
 * Get all ancestors of a block (parent, grandparent, etc.)
 */
export function getAncestors(blocks: Block[], blockId: string): Block[] {
  const ancestors: Block[] = [];
  let currentBlock = blocks.find((b) => b.id === blockId);

  while (currentBlock?.parentId) {
    const parent = blocks.find((b) => b.id === currentBlock!.parentId);
    if (parent) {
      ancestors.push(parent);
      currentBlock = parent;
    } else {
      break;
    }
  }

  return ancestors;
}

/**
 * Get all descendants of a block (children, grandchildren, etc.)
 */
export function getDescendants(blocks: Block[], blockId: string): Block[] {
  const descendants: Block[] = [];
  const children = getChildBlocks(blocks, blockId);

  children.forEach((child) => {
    descendants.push(child);
    descendants.push(...getDescendants(blocks, child.id));
  });

  return descendants;
}

/**
 * Move a block to a new parent
 */
export function moveBlock(
  blocks: Block[],
  blockId: string,
  newParentId: string | undefined,
  newOrder: number
): Block[] {
  const blockToMove = blocks.find((b) => b.id === blockId);
  if (!blockToMove) return blocks;

  // Calculate new depth
  const newDepth = newParentId
    ? (blocks.find((b) => b.id === newParentId)?.depth ?? 0) + 1
    : 0;

  // Update depths of all descendants
  const descendantIds = new Set(getDescendants(blocks, blockId).map((b) => b.id));
  const depthDelta = newDepth - (blockToMove.depth ?? 0);

  return blocks.map((block) => {
    if (block.id === blockId) {
      return {
        ...block,
        parentId: newParentId,
        depth: newDepth,
        order: newOrder,
      };
    }
    if (descendantIds.has(block.id)) {
      return {
        ...block,
        depth: (block.depth ?? 0) + depthDelta,
      };
    }
    return block;
  });
}

/**
 * Indent a block (make it a child of the previous sibling)
 */
export function indentBlock(blocks: Block[], blockId: string): Block[] {
  const block = blocks.find((b) => b.id === blockId);
  if (!block) return blocks;

  // Find siblings at same level
  const siblings = blocks
    .filter((b) => b.parentId === block.parentId && (b.depth ?? 0) === (block.depth ?? 0))
    .sort((a, b) => a.order - b.order);

  const currentIndex = siblings.findIndex((b) => b.id === blockId);
  if (currentIndex <= 0) return blocks; // Can't indent first sibling

  // New parent is the previous sibling
  const newParentId = siblings[currentIndex - 1].id;
  const existingChildren = getChildBlocks(blocks, newParentId);
  const newOrder = existingChildren.length;

  return moveBlock(blocks, blockId, newParentId, newOrder);
}

/**
 * Dedent a block (move it up to parent's level)
 */
export function dedentBlock(blocks: Block[], blockId: string): Block[] {
  const block = blocks.find((b) => b.id === blockId);
  if (!block?.parentId) return blocks; // Can't dedent root blocks

  const parent = blocks.find((b) => b.id === block.parentId);
  if (!parent) return blocks;

  // New parent is grandparent (or root if parent is root-level)
  const newParentId = parent.parentId;

  // New order is right after the current parent
  const parentSiblings = blocks
    .filter((b) => b.parentId === parent.parentId && (b.depth ?? 0) === (parent.depth ?? 0))
    .sort((a, b) => a.order - b.order);

  const parentIndex = parentSiblings.findIndex((b) => b.id === parent.id);
  const newOrder = parentIndex + 1;

  // Need to reorder siblings after the insertion point
  let result = moveBlock(blocks, blockId, newParentId, newOrder);

  // Adjust order of blocks that come after
  result = result.map((b) => {
    if (
      b.parentId === newParentId &&
      (b.depth ?? 0) === (block.depth ?? 0) - 1 &&
      b.order >= newOrder &&
      b.id !== blockId
    ) {
      return { ...b, order: b.order + 1 };
    }
    return b;
  });

  return result;
}

/**
 * Check if a block can be indented
 */
export function canIndent(blocks: Block[], blockId: string): boolean {
  const block = blocks.find((b) => b.id === blockId);
  if (!block) return false;

  // Find siblings at same level
  const siblings = blocks
    .filter((b) => b.parentId === block.parentId && (b.depth ?? 0) === (block.depth ?? 0))
    .sort((a, b) => a.order - b.order);

  const currentIndex = siblings.findIndex((b) => b.id === blockId);
  return currentIndex > 0; // Can indent if not first sibling
}

/**
 * Check if a block can be dedented
 */
export function canDedent(blocks: Block[], blockId: string): boolean {
  const block = blocks.find((b) => b.id === blockId);
  return !!block?.parentId; // Can dedent if has a parent
}

/**
 * Normalize block orders within their respective parent groups
 */
export function normalizeBlockOrders(blocks: Block[]): Block[] {
  // Group blocks by parentId
  const groups = new Map<string, Block[]>();

  blocks.forEach((block) => {
    const key = block.parentId || "root";
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(block);
  });

  // Normalize order within each group
  const result: Block[] = [];
  groups.forEach((groupBlocks) => {
    const sorted = [...groupBlocks].sort((a, b) => a.order - b.order);
    sorted.forEach((block, index) => {
      result.push({ ...block, order: index });
    });
  });

  return result;
}
