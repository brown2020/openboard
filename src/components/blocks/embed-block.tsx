"use client";

import { useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Globe,
  Music2,
  MessageSquare,
} from "lucide-react";
import { EmbedBlock as EmbedBlockType } from "@/types";
import { useBoardStore } from "@/stores/board-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type EmbedPlatform = NonNullable<EmbedBlockType["settings"]["platform"]>;

const PLATFORM_LABEL: Record<EmbedPlatform, string> = {
  spotify: "Spotify",
  twitter: "Twitter/X",
  instagram: "Instagram",
  custom: "Custom",
};

interface EmbedBlockProps {
  block: EmbedBlockType;
  isEditing?: boolean;
  onClick?: () => void;
}

const getDefaultEmbedCode = (
  url: string,
  platform?: EmbedPlatform
): string => {
  if (!url) return "";

  switch (platform) {
    case "spotify": {
      if (url.includes("embed")) return url;
      return url.replace("open.spotify.com/", "open.spotify.com/embed/");
    }
    case "twitter": {
      return `https://platform.twitter.com/widgets/tweet.html?url=${encodeURIComponent(
        url
      )}`;
    }
    case "instagram": {
      return `${url}embed/`;
    }
    default:
      return url;
  }
};

export function EmbedBlock({
  block,
  isEditing = false,
  onClick,
}: EmbedBlockProps) {
  const { updateBlock, deleteBlock } = useBoardStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const { url, embedCode, platform = "custom" } = block.settings;

  const [editPlatform, setEditPlatform] = useState<EmbedPlatform>(platform);
  const [editUrl, setEditUrl] = useState(url);
  const [editEmbed, setEditEmbed] = useState(embedCode || "");

  const resolvedEmbed = useMemo(() => {
    if (editEmbed) return editEmbed;
    return getDefaultEmbedCode(editUrl, editPlatform);
  }, [editEmbed, editUrl, editPlatform]);

  const toggleVisibility = () => {
    updateBlock(block.id, { visible: !block.visible });
  };

  const handleDelete = () => {
    if (confirm("Delete this block?")) {
      deleteBlock(block.id);
    }
  };

  const handleSave = () => {
    updateBlock(block.id, {
      settings: {
        url: editUrl,
        embedCode: editEmbed || undefined,
        platform: editPlatform,
      },
    });
    setIsEditMode(false);
  };

  if (isEditMode && isEditing) {
    return (
      <div className="p-4 border rounded-lg bg-card space-y-4">
        <div className="space-y-2">
          <Label>Platform</Label>
          <Select
            value={editPlatform}
            onValueChange={(value: EmbedPlatform) => setEditPlatform(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PLATFORM_LABEL).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Content URL</Label>
          <Input
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <Label>Custom Embed URL (optional)</Label>
          <Input
            value={editEmbed}
            onChange={(e) => setEditEmbed(e.target.value)}
            placeholder="https://open.spotify.com/embed/track/..."
          />
          <p className="text-xs text-muted-foreground">
            Provide a custom embed iframe src if Spotify/Twitter defaults don’t
            match your content.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!editUrl && !editEmbed}>
            Save
          </Button>
          <Button variant="outline" onClick={() => setIsEditMode(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  const normalizedPlatform: EmbedPlatform = platform || "custom";

  const PlatformIcon =
    normalizedPlatform === "spotify"
      ? Music2
      : normalizedPlatform === "twitter"
      ? MessageSquare
      : Globe;

  return (
    <div className="group relative" onClick={onClick}>
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

      <div className="border rounded-lg overflow-hidden bg-card">
        <div className="px-4 py-2 border-b flex items-center gap-2 text-sm font-medium">
          <PlatformIcon className="w-4 h-4 text-primary" />
          {PLATFORM_LABEL[normalizedPlatform]}
        </div>
        {resolvedEmbed ? (
          <div className="aspect-video bg-muted">
            <iframe
              src={resolvedEmbed}
              className="w-full h-full"
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            />
          </div>
        ) : (
          <div className="p-6 text-sm text-muted-foreground text-center">
            Invalid embed configuration. Edit this block to provide a valid
            embed URL.
          </div>
        )}
      </div>
    </div>
  );
}

