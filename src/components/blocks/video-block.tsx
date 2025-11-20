"use client";

import { useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Video as VideoIcon,
} from "lucide-react";
import { useBoardStore } from "@/stores/board-store";
import { VideoBlock as VideoBlockType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type VideoPlatform = VideoBlockType["settings"]["platform"];

interface VideoBlockProps {
  block: VideoBlockType;
  isEditing?: boolean;
  onClick?: () => void;
}

const SUPPORTED_PLATFORMS: VideoPlatform[] = ["youtube", "vimeo", "custom"];

const getEmbedUrl = (url: string, platform: VideoPlatform) => {
  if (!url) return "";

  if (platform === "youtube") {
    const videoIdMatch = url.match(
      /(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/
    );
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  }

  if (platform === "vimeo") {
    const videoIdMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    return videoId ? `https://player.vimeo.com/video/${videoId}` : "";
  }

  return url;
};

export function VideoBlock({
  block,
  isEditing = false,
  onClick,
}: VideoBlockProps) {
  const { updateBlock, deleteBlock } = useBoardStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const { url, platform, title } = block.settings;

  const [editUrl, setEditUrl] = useState(url);
  const [editPlatform, setEditPlatform] = useState<VideoPlatform>(platform);
  const [editTitle, setEditTitle] = useState(title || "");

  const embedUrl = useMemo(
    () => getEmbedUrl(url, platform),
    [url, platform]
  );

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
        url: editUrl,
        platform: editPlatform,
        title: editTitle || undefined,
      },
    });
    setIsEditMode(false);
  };

  if (isEditMode && isEditing) {
    return (
      <div className="p-4 border rounded-lg bg-card space-y-4">
        <div className="space-y-2">
          <Label>Video Platform</Label>
          <Select
            value={editPlatform}
            onValueChange={(value: VideoPlatform) => setEditPlatform(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_PLATFORMS.map((value) => (
                <SelectItem key={value} value={value}>
                  {value === "custom"
                    ? "Custom iframe/embed URL"
                    : value === "youtube"
                    ? "YouTube"
                    : "Vimeo"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Video URL</Label>
          <Input
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>

        <div className="space-y-2">
          <Label>Title (optional)</Label>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="My latest video"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!editUrl}>
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

      <div
        className="border rounded-lg bg-card overflow-hidden"
        aria-label={title || "Embedded video"}
      >
        {title && (
          <div className="px-4 py-2 border-b flex items-center gap-2 text-sm font-medium">
            <VideoIcon className="w-4 h-4 text-primary" />
            {title}
          </div>
        )}

        {embedUrl ? (
          <div className="aspect-video bg-muted">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              loading="lazy"
            />
          </div>
        ) : (
          <div className="p-6 text-sm text-muted-foreground text-center">
            Invalid video URL. Edit this block to provide a valid embed link.
          </div>
        )}
      </div>
    </div>
  );
}

