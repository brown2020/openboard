"use client";

import { ButtonBlock as ButtonBlockType } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useBoardStore } from "@/stores/board-store";
import { Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ButtonBlockProps {
  block: ButtonBlockType;
  onClick?: () => void;
  isEditing?: boolean;
}

export function ButtonBlock({
  block,
  onClick,
  isEditing = false,
}: ButtonBlockProps) {
  const { updateBlock, deleteBlock } = useBoardStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const { text, url, style = "primary", size = "md" } = block.settings;

  const [editText, setEditText] = useState(text);
  const [editUrl, setEditUrl] = useState(url);
  const [editStyle, setEditStyle] = useState(style);
  const [editSize, setEditSize] = useState(size);

  const sizeMap = {
    sm: "default" as const,
    md: "lg" as const,
    lg: "lg" as const,
  };

  const variantMap = {
    primary: "default" as const,
    secondary: "secondary" as const,
    outline: "outline" as const,
    ghost: "ghost" as const,
  };

  const toggleVisibility = () => {
    updateBlock(block.id, { visible: !block.visible });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this block?")) {
      deleteBlock(block.id);
    }
  };

  const handleSave = () => {
    updateBlock(block.id, {
      settings: {
        text: editText,
        url: editUrl,
        style: editStyle,
        size: editSize,
      },
    });
    setIsEditMode(false);
  };

  if (isEditMode && isEditing) {
    return (
      <div className="p-4 border rounded-lg bg-card space-y-4">
        <div className="space-y-2">
          <Label>Button Text</Label>
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            placeholder="Click me"
          />
        </div>
        <div className="space-y-2">
          <Label>URL</Label>
          <Input
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </div>
        <div className="space-y-2">
          <Label>Style</Label>
          <Select value={editStyle} onValueChange={(v: any) => setEditStyle(v)}>
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
          <Select value={editSize} onValueChange={(v: any) => setEditSize(v)}>
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
          <Button onClick={handleSave} disabled={!editText || !editUrl}>
            Save
          </Button>
          <Button variant="outline" onClick={() => setIsEditMode(false)}>
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
        <div className="absolute -top-2 -right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditMode(true)}
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

      {/* Button Content */}
      <div
        className={cn(
          "flex justify-center",
          !block.visible && isEditing && "opacity-50"
        )}
      >
        {isEditing ? (
          <Button
            variant={variantMap[style]}
            size={sizeMap[size]}
            className={cn(
              "min-w-[200px]",
              size === "lg" && "text-lg px-8 py-6"
            )}
          >
            {text}
          </Button>
        ) : (
          <Button
            variant={variantMap[style]}
            size={sizeMap[size]}
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
