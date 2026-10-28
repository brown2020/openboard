"use client";

import { useState } from "react";
import { TextBlock as TextBlockType } from "@/types";
import { cn } from "@/lib/utils";
import { useBoardStore } from "@/stores/board-store";
import { BlockControls } from "./block-controls";
import { BlockEditWrapper } from "./block-edit-wrapper";
import { InputField, SelectField } from "./form-fields";

interface TextBlockProps {
  block: TextBlockType;
  isEditing?: boolean;
}

const FONT_SIZE_CLASSES = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
} as const;

const ALIGNMENT_CLASSES = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

export function TextBlock({ block, isEditing = false }: TextBlockProps) {
  const { updateBlock } = useBoardStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const { content, alignment = "left", fontSize = "md" } = block.settings;
  const [editContent, setEditContent] = useState(content);
  const [editAlignment, setEditAlignment] = useState(alignment);
  const [editFontSize, setEditFontSize] = useState(fontSize);

  const handleSave = () => {
    updateBlock(block.id, {
      settings: {
        content: editContent,
        alignment: editAlignment,
        fontSize: editFontSize,
      },
    });
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setEditContent(content);
    setEditAlignment(alignment);
    setEditFontSize(fontSize);
    setIsEditMode(false);
  };

  if (isEditMode && isEditing) {
    return (
      <BlockEditWrapper
        isEditMode={isEditMode}
        isEditing={isEditing}
        onSave={handleSave}
        onCancel={handleCancel}
        isValid={editContent.trim().length > 0}
      >
        <InputField
          label="Text"
          value={editContent}
          onChange={setEditContent}
          placeholder="Write something"
        />
        <SelectField
          label="Alignment"
          value={editAlignment}
          options={[
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
            { value: "right", label: "Right" },
          ]}
          onChange={(value) => setEditAlignment(value as typeof editAlignment)}
        />
        <SelectField
          label="Size"
          value={editFontSize}
          options={[
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
            { value: "lg", label: "Large" },
            { value: "xl", label: "Extra large" },
          ]}
          onChange={(value) => setEditFontSize(value as typeof editFontSize)}
        />
      </BlockEditWrapper>
    );
  }

  return (
    <div className="group relative">
      {isEditing && (
        <BlockControls
          blockId={block.id}
          isVisible={block.visible}
          onEdit={() => {
            setEditContent(content);
            setEditAlignment(alignment);
            setEditFontSize(fontSize);
            setIsEditMode(true);
          }}
        />
      )}
      <div
        className={cn(
          "prose prose-neutral dark:prose-invert max-w-none",
          FONT_SIZE_CLASSES[fontSize],
          ALIGNMENT_CLASSES[alignment],
          "text-foreground",
          !block.visible && isEditing && "opacity-50"
        )}
      >
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
