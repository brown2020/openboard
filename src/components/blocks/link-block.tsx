"use client";

import { LinkBlock as LinkBlockType } from "@/types";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useBoardStore } from "@/stores/board-store";
import { useBlockEditor } from "@/hooks/use-block-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BlockControls } from "./block-controls";

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
      <div className="p-4 border rounded-lg bg-card space-y-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={editSettings.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Link title"
          />
        </div>
        <div className="space-y-2">
          <Label>URL</Label>
          <Input
            value={editSettings.url}
            onChange={(e) => updateField("url", e.target.value)}
            placeholder="https://example.com"
          />
        </div>
        <div className="space-y-2">
          <Label>Description (optional)</Label>
          <Input
            value={editSettings.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Add a description"
          />
        </div>
        <div className="space-y-2">
          <Label>Icon (emoji, optional)</Label>
          <Input
            value={editSettings.icon}
            onChange={(e) => updateField("icon", e.target.value)}
            placeholder="🔗"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!isValid || isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      {/* Editor Controls */}
      {isEditing && (
        <BlockControls
          blockId={block.id}
          isVisible={block.visible}
          onEdit={startEdit}
        />
      )}

      {/* Link Content */}
      <a
        href={isEditing ? undefined : url}
        onClick={isEditing ? undefined : onClick}
        className={cn(
          "group/link relative flex items-center gap-4 p-4 rounded-lg transition-all",
          "bg-card hover:bg-card/80 border border-border",
          !isEditing && "hover:scale-[1.02] active:scale-[0.98]",
          isEditing && "cursor-default",
          !block.visible && isEditing && "opacity-50"
        )}
      >
        {/* Icon/Thumbnail */}
        {(icon || thumbnail) && (
          <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center relative">
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt={title}
                fill
                className="object-cover"
                sizes="48px"
                unoptimized={
                  thumbnail.startsWith("http") &&
                  !thumbnail.includes("localhost")
                }
              />
            ) : icon ? (
              <span className="text-2xl">{icon}</span>
            ) : (
              <ExternalLink className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate group-hover/link:underline">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {/* Arrow Icon */}
        <ExternalLink className="flex-shrink-0 w-5 h-5 text-muted-foreground group-hover/link:text-foreground transition-colors" />
      </a>
    </div>
  );
}
