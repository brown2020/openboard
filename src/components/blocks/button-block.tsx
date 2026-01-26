"use client";

import { ButtonBlock as ButtonBlockType } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBoardStore } from "@/stores/board-store";
import { useBlockEditor } from "@/hooks/use-block-editor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BlockControls } from "./block-controls";

interface ButtonBlockProps {
  block: ButtonBlockType;
  onClick?: () => void;
  isEditing?: boolean;
}

const SIZE_MAP = {
  sm: "default" as const,
  md: "lg" as const,
  lg: "lg" as const,
};

const VARIANT_MAP = {
  primary: "default" as const,
  secondary: "secondary" as const,
  outline: "outline" as const,
  ghost: "ghost" as const,
};

export function ButtonBlock({
  block,
  onClick,
  isEditing = false,
}: ButtonBlockProps) {
  const { updateBlock } = useBoardStore();
  const { text, url, style = "primary", size = "md" } = block.settings;

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
    initialSettings: { text, url, style, size },
    onSave: async (settings) => {
      updateBlock(block.id, { settings });
    },
    validate: (settings) => {
      if (!settings.text || !settings.url) {
        return "Button text and URL are required";
      }
      return true;
    },
  });

  if (isEditMode && isEditing) {
    return (
      <div className="p-4 border rounded-lg bg-card space-y-4">
        <div className="space-y-2">
          <Label>Button Text</Label>
          <Input
            value={editSettings.text}
            onChange={(e) => updateField("text", e.target.value)}
            placeholder="Click me"
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
          <Label>Style</Label>
          <Select 
            value={editSettings.style} 
            onValueChange={(v) => updateField("style", v as ButtonBlockType["settings"]["style"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">Primary</SelectItem>
              <SelectItem value="secondary">Secondary</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
              <SelectItem value="ghost">Ghost</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Size</Label>
          <Select 
            value={editSettings.size} 
            onValueChange={(v) => updateField("size", v as "sm" | "md" | "lg")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
            </SelectContent>
          </Select>
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

      {/* Button Content */}
      <div
        className={cn(
          "flex justify-center",
          !block.visible && isEditing && "opacity-50"
        )}
      >
        {isEditing ? (
          <Button
            variant={VARIANT_MAP[style]}
            size={SIZE_MAP[size]}
            className={cn(
              "min-w-[200px]",
              size === "lg" && "text-lg px-8 py-6"
            )}
          >
            {text}
          </Button>
        ) : (
          <Button
            variant={VARIANT_MAP[style]}
            size={SIZE_MAP[size]}
            className={cn(
              "min-w-[200px]",
              size === "lg" && "text-lg px-8 py-6"
            )}
            asChild
          >
            <a
              href={url}
              onClick={onClick}
              target="_blank"
              rel="noopener noreferrer"
            >
              {text}
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
