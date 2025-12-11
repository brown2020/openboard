"use client";

import { useMemo, useState } from "react";
import { Video as VideoIcon } from "lucide-react";
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
import { BlockControls } from "./block-controls";

type VideoPlatform = VideoBlockType["settings"]["platform"];

interface VideoBlockProps {
  block: VideoBlockType;
  isEditing?: boolean;
  onClick?: () => void;
}

const SUPPORTED_PLATFORMS: VideoPlatform[] = ["youtube", "vimeo", "custom"];

function getEmbedUrl(url: string, platform: VideoPlatform): string {
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
}

export function VideoBlock({
  block,
  isEditing = false,
  onClick,
}: VideoBlockProps) {
  const { updateBlock } = useBoardStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const { url, platform, title } = block.settings;

  const [editUrl, setEditUrl] = useState(url);
  const [editPlatform, setEditPlatform] = useState<VideoPlatform>(platform);
  const [editTitle, setEditTitle] = useState(title || "");

  const embedUrl = useMemo(() => getEmbedUrl(url, platform), [url, platform]);

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
        <BlockControls
          blockId={block.id}
          isVisible={block.visible}
          onEdit={() => setIsEditMode(true)}
        />
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
