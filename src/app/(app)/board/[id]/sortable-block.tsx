"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditor } from "@/stores/ui-store";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import type { Block } from "@/types";

interface SortableBlockProps {
  block: Block;
}

export function SortableBlock({ block }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });
  const { selectedBlockId } = useEditor();
  const isSelected = selectedBlockId === block.id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-block-id={block.id}
      className={cn(
        "relative group",
        isDragging && "opacity-50 z-50 scale-[1.02]",
        // Selection indicator - blue left border like Notion
        isSelected &&
          "before:absolute before:-left-3 before:top-0 before:bottom-0 before:w-0.5 before:bg-blue-500 before:rounded-full"
      )}
    >
      {/* Drag Handle - Always slightly visible, fully visible on hover */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute -left-10 top-1/2 -translate-y-1/2",
          "opacity-30 group-hover:opacity-100 transition-all duration-200",
          "cursor-grab active:cursor-grabbing",
          "p-1.5 rounded-md hover:bg-muted",
          isSelected && "opacity-60"
        )}
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </div>

      <BlockRenderer block={block} isEditing={true} />
    </div>
  );
}

