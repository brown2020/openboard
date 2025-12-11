"use client";

import { RichTextBlock as RichTextBlockType } from "@/types";
import { useBoardStore } from "@/stores/board-store";
import { RichTextEditor } from "./rich-text-editor";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BlockControls } from "./block-controls";

interface RichTextBlockProps {
  block: RichTextBlockType;
  isEditing?: boolean;
}

const ALIGNMENT_CLASSES = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

export function RichTextBlock({
  block,
  isEditing = false,
}: RichTextBlockProps) {
  const { updateBlock } = useBoardStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const { content, alignment = "left" } = block.settings;

  const handleContentChange = (newContent: string) => {
    updateBlock(block.id, {
      settings: { ...block.settings, content: newContent },
    });
  };

  if (!isEditing) {
    // View mode for public pages
    return (
      <div className={cn("w-full", ALIGNMENT_CLASSES[alignment])}>
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
        <BlockControls
          blockId={block.id}
          isVisible={block.visible}
          onEdit={() => setIsEditMode(!isEditMode)}
        />
      )}

      {/* Content */}
      <div
        className={cn(
          "w-full",
          !block.visible && isEditing && "opacity-50",
          ALIGNMENT_CLASSES[alignment]
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
