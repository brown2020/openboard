"use client";

import { RichTextBlock as RichTextBlockType } from "@/types";
import { useBoardStore } from "@/stores/board-store";
import { RichTextEditor } from "./rich-text-editor";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface RichTextBlockProps {
  block: RichTextBlockType;
  isEditing?: boolean;
}

export function RichTextBlock({
  block,
  isEditing = false,
}: RichTextBlockProps) {
  const { updateBlock, deleteBlock } = useBoardStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const { content, alignment = "left" } = block.settings;

  const handleContentChange = (newContent: string) => {
    updateBlock(block.id, {
      settings: { ...block.settings, content: newContent },
    });
  };

  const toggleVisibility = () => {
    updateBlock(block.id, { visible: !block.visible });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this block?")) {
      deleteBlock(block.id);
    }
  };

  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  if (!isEditing) {
    // View mode for public pages
    return (
      <div className={cn("w-full", alignmentClasses[alignment])}>
        <div
          className="prose prose-neutral dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    );
  }

  return (
    <div className="group relative w-full">
      {/* Editor Controls */}
      {isEditing && (
        <div className="absolute -top-2 -right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
            className="h-7 w-7 p-0 shadow-md"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleVisibility}
            className="h-7 w-7 p-0 shadow-md"
          >
            {block.visible ? (
              <Eye className="h-3 w-3" />
            ) : (
              <EyeOff className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="h-7 w-7 p-0 shadow-md"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          "w-full",
          !block.visible && isEditing && "opacity-50",
          alignmentClasses[alignment]
        )}
      >
        {isEditMode ? (
          <div className="space-y-2">
            <RichTextEditor
              content={content}
              onChange={handleContentChange}
              editable={true}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditMode(false)}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="prose prose-neutral dark:prose-invert max-w-none min-h-[40px] px-4 py-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
            onClick={() => setIsEditMode(true)}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>
    </div>
  );
}
