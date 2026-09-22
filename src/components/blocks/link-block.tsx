"use client";

import { LinkBlock as LinkBlockType } from "@/types";
import { useBoardStore } from "@/stores/board-store";
import { useBlockEditor } from "@/hooks/use-block-editor";
import { BlockControls } from "./block-controls";
import { LinkBlockEditForm } from "./link-block-edit-form";
import { LinkBlockView } from "./link-block-view";

interface LinkBlockProps {
  block: LinkBlockType;
  onClick?: () => void;
  isEditing?: boolean;
}

export function LinkBlock({
  block,
  onClick,
  isEditing = false,
}: LinkBlockProps) {
  const { updateBlock } = useBoardStore();
  const { title, url, description, icon, thumbnail } = block.settings;

  const {
    isEditMode,
    editSettings,
    updateField,
    handleSave,
    handleCancel,
    startEdit,
    isValid,
    isSaving,
  } = useBlockEditor({
    block,
    isEditing,
    initialSettings: {
      title,
      url,
      description: description || "",
      icon: icon || "",
    },
    onSave: async (settings) => {
      updateBlock(block.id, {
        settings: {
          ...block.settings,
          title: settings.title,
          url: settings.url,
          description: settings.description || undefined,
          icon: settings.icon || undefined,
        },
      });
    },
    validate: (settings) => {
      if (!settings.title || !settings.url) {
        return "Title and URL are required";
      }
      return true;
    },
  });

  if (isEditMode && isEditing) {
    return (
      <LinkBlockEditForm
        editSettings={editSettings}
        updateField={updateField}
        handleSave={() => void handleSave()}
        handleCancel={handleCancel}
        isValid={isValid}
        isSaving={isSaving}
      />
    );
  }

  return (
    <div className="group relative">
      {isEditing ? (
        <BlockControls
          blockId={block.id}
          isVisible={block.visible}
          onEdit={startEdit}
        />
      ) : null}

      <LinkBlockView
        title={title}
        url={url}
        description={description}
        icon={icon}
        thumbnail={thumbnail}
        isEditing={isEditing}
        isVisible={block.visible}
        onClick={onClick}
      />
    </div>
  );
}
