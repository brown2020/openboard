"use client";

import { useMemo } from "react";
import { Block } from "@/types";
import { BlockRenderer } from "./block-renderer";
import { buildBlockTree, BlockTreeNode } from "@/lib/block-tree";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown } from "lucide-react";

interface NestedBlockRendererProps {
  blocks: Block[];
  isEditing?: boolean;
  onBlockClick?: (blockId: string) => void;
  /** Custom render wrapper for each block (e.g., for drag-and-drop) */
  renderBlockWrapper?: (block: Block, children: React.ReactNode) => React.ReactNode;
  /** Collapsed block IDs */
  collapsedIds?: Set<string>;
  /** Toggle collapse handler */
  onToggleCollapse?: (blockId: string) => void;
  /** Indentation per level in pixels */
  indentSize?: number;
}

/**
 * Renders blocks in a nested tree structure.
 * Supports collapsible parent blocks and visual indentation.
 */
export function NestedBlockRenderer({
  blocks,
  isEditing = false,
  onBlockClick,
  renderBlockWrapper,
  collapsedIds = new Set(),
  onToggleCollapse,
  indentSize = 24,
}: NestedBlockRendererProps) {
  // Build tree from flat blocks
  const tree = useMemo(() => buildBlockTree(blocks), [blocks]);

  return (
    <div className="space-y-2" role="list">
      {tree.map((node) => (
        <NestedBlockNode
          key={node.block.id}
          node={node}
          isEditing={isEditing}
          onBlockClick={onBlockClick}
          renderBlockWrapper={renderBlockWrapper}
          collapsedIds={collapsedIds}
          onToggleCollapse={onToggleCollapse}
          indentSize={indentSize}
          depth={0}
        />
      ))}
    </div>
  );
}

interface NestedBlockNodeProps {
  node: BlockTreeNode;
  isEditing: boolean;
  onBlockClick?: (blockId: string) => void;
  renderBlockWrapper?: (block: Block, children: React.ReactNode) => React.ReactNode;
  collapsedIds: Set<string>;
  onToggleCollapse?: (blockId: string) => void;
  indentSize: number;
  depth: number;
}

function NestedBlockNode({
  node,
  isEditing,
  onBlockClick,
  renderBlockWrapper,
  collapsedIds,
  onToggleCollapse,
  indentSize,
  depth,
}: NestedBlockNodeProps) {
  const { block, children } = node;
  const hasChildren = children.length > 0;
  const isCollapsed = collapsedIds.has(block.id);

  const handleClick = () => {
    onBlockClick?.(block.id);
  };

  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleCollapse?.(block.id);
  };

  const blockContent = (
    <div
      className={cn(
        "relative group",
        !block.visible && isEditing && "opacity-50"
      )}
      style={{ marginLeft: depth * indentSize }}
    >
      {/* Collapse toggle for blocks with children */}
      {hasChildren && isEditing && (
        <button
          onClick={handleToggleCollapse}
          className={cn(
            "absolute -left-6 top-1/2 -translate-y-1/2",
            "w-5 h-5 flex items-center justify-center",
            "rounded hover:bg-muted transition-colors",
            "opacity-0 group-hover:opacity-100"
          )}
          aria-label={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      )}

      {/* Visual tree connector line */}
      {depth > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 w-px bg-border"
          style={{ left: -indentSize / 2 }}
        />
      )}

      <BlockRenderer
        block={block}
        isEditing={isEditing}
        onClick={handleClick}
        onBlockClick={onBlockClick}
      />
    </div>
  );

  const wrappedContent = renderBlockWrapper
    ? renderBlockWrapper(block, blockContent)
    : blockContent;

  return (
    <>
      {wrappedContent}

      {/* Render children if not collapsed */}
      {hasChildren && !isCollapsed && (
        <div className="space-y-2">
          {children.map((childNode) => (
            <NestedBlockNode
              key={childNode.block.id}
              node={childNode}
              isEditing={isEditing}
              onBlockClick={onBlockClick}
              renderBlockWrapper={renderBlockWrapper}
              collapsedIds={collapsedIds}
              onToggleCollapse={onToggleCollapse}
              indentSize={indentSize}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </>
  );
}

/**
 * Simple flat block renderer for backward compatibility
 */
export function FlatBlockRenderer({
  blocks,
  isEditing = false,
  onBlockClick,
  renderBlockWrapper,
}: Omit<NestedBlockRendererProps, "collapsedIds" | "onToggleCollapse" | "indentSize">) {
  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.order - b.order),
    [blocks]
  );

  return (
    <div className="space-y-4" role="list">
      {sortedBlocks.map((block) => {
        const content = (
          <BlockRenderer
            key={block.id}
            block={block}
            isEditing={isEditing}
            onClick={() => onBlockClick?.(block.id)}
            onBlockClick={onBlockClick}
          />
        );

        return renderBlockWrapper ? (
          <div key={block.id}>{renderBlockWrapper(block, content)}</div>
        ) : (
          <div key={block.id}>{content}</div>
        );
      })}
    </div>
  );
}
