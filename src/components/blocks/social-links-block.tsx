"use client";

import { useState } from "react";
import { SocialLinksBlock as SocialLinksBlockType } from "@/types";
import { useBoardStore } from "@/stores/board-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, LayoutGrid, Rows, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { BlockControls } from "./block-controls";

type Layout = SocialLinksBlockType["settings"]["layout"];

interface SocialLinksBlockProps {
  block: SocialLinksBlockType;
  isEditing?: boolean;
  onClick?: () => void;
}

const DEFAULT_LINK = {
  platform: "custom",
  url: "",
  icon: "🔗",
};

export function SocialLinksBlock({
  block,
  isEditing = false,
  onClick,
}: SocialLinksBlockProps) {
  const { updateBlock } = useBoardStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const [links, setLinks] = useState(block.settings.links);
  const [layout, setLayout] = useState<Layout>(block.settings.layout);

  const handleSave = () => {
    const sanitized = links
      .filter((link) => link.url.trim())
      .map((link, index) => ({
        ...link,
        icon: link.icon?.trim() || "🔗",
        platform: link.platform || `link-${index + 1}`,
      }));

    if (sanitized.length === 0) {
      alert("Add at least one social link.");
      return;
    }

    updateBlock(block.id, {
      settings: {
        links: sanitized,
        layout,
      },
    });
    setIsEditMode(false);
  };

  const handleLinkChange = (
    index: number,
    field: "platform" | "url" | "icon",
    value: string
  ) => {
    setLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [field]: value } : link))
    );
  };

  const handleAddLink = () => {
    setLinks((prev) => [...prev, { ...DEFAULT_LINK }]);
  };

  const handleRemoveLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  if (isEditMode && isEditing) {
    return (
      <div className="p-4 border rounded-lg bg-card space-y-4">
        <div className="flex items-center justify-between">
          <Label>Layout</Label>
          <Select
            value={layout}
            onValueChange={(value: Layout) => setLayout(value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="horizontal">Horizontal</SelectItem>
              <SelectItem value="grid">Grid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
          {links.map((link, index) => (
            <div
              key={`${link.platform}-${index}`}
              className="rounded-lg border p-3 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Link {index + 1}</span>
                {links.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveLink(index)}
                    className="h-6 px-2 text-muted-foreground"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Label>Platform Label</Label>
                <Input
                  value={link.platform}
                  onChange={(e) =>
                    handleLinkChange(index, "platform", e.target.value)
                  }
                  placeholder="Instagram"
                />
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={link.url}
                  onChange={(e) =>
                    handleLinkChange(index, "url", e.target.value)
                  }
                  placeholder="https://instagram.com/username"
                />
              </div>
              <div className="space-y-2">
                <Label>Icon (emoji or text)</Label>
                <Input
                  value={link.icon || ""}
                  onChange={(e) =>
                    handleLinkChange(index, "icon", e.target.value)
                  }
                  maxLength={4}
                  placeholder="📸"
                />
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleAddLink}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Link
        </Button>

        <div className="flex gap-2">
          <Button onClick={handleSave}>Save</Button>
          <Button variant="outline" onClick={() => setIsEditMode(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative" onClick={onClick}>
      {isEditing && (
        <BlockControls
          blockId={block.id}
          isVisible={block.visible}
          onEdit={() => setIsEditMode(true)}
        />
      )}

      <div
        className={cn(
          "border rounded-lg bg-card p-4",
          !block.visible && isEditing && "opacity-50"
        )}
      >
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <span>Social Links</span>
          <span className="flex items-center gap-1">
            {layout === "grid" ? (
              <>
                <LayoutGrid className="w-4 h-4" /> Grid
              </>
            ) : (
              <>
                <Rows className="w-4 h-4" /> Horizontal
              </>
            )}
          </span>
        </div>

        <div
          className={cn(
            "gap-3",
            layout === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3"
              : "flex flex-wrap"
          )}
        >
          {block.settings.links.map((link, index) => (
            <a
              key={`${link.platform}-${index}`}
              href={isEditing ? undefined : link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-colors",
                !isEditing && "hover:bg-accent"
              )}
            >
              <span className="text-lg">{link.icon || "🔗"}</span>
              <span className="truncate">{link.platform}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
