"use client";

import { Edit2, Eye, EyeOff, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBoardStore } from "@/stores/board-store";

interface BlockControlsProps {
  blockId: string;
  isVisible: boolean;
  onEdit: () => void;
  showDuplicate?: boolean;
}

/**
 * Block Controls Component
 * Reusable editor controls for block manipulation (edit, visibility, delete, duplicate)
 */
export function BlockControls({
  blockId,
  isVisible,
  onEdit,
  showDuplicate = false,
}: BlockControlsProps) {
  const { deleteBlock, toggleBlockVisibility, duplicateBlock } =
    useBoardStore();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this block?")) {
      deleteBlock(blockId);
    }
  };

  const handleToggleVisibility = () => {
    toggleBlockVisibility(blockId);
  };

  const handleDuplicate = () => {
    duplicateBlock(blockId);
  };

  return (
    <div className="absolute -top-2 -right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="secondary"
        size="sm"
        onClick={onEdit}
        className="h-7 w-7 p-0 shadow-md"
        title="Edit"
      >
        <Edit2 className="h-3 w-3" />
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleToggleVisibility}
        className="h-7 w-7 p-0 shadow-md"
        title={isVisible ? "Hide" : "Show"}
      >
        {isVisible ? (
          <Eye className="h-3 w-3" />
        ) : (
          <EyeOff className="h-3 w-3" />
        )}
      </Button>
      {showDuplicate && (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleDuplicate}
          className="h-7 w-7 p-0 shadow-md"
          title="Duplicate"
        >
          <Copy className="h-3 w-3" />
        </Button>
      )}
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        className="h-7 w-7 p-0 shadow-md"
        title="Delete"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
