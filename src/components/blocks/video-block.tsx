"use client";

import { useMemo, useState } from "react";
import { Video as VideoIcon } from "lucide-react";
import { useBoardStore } from "@/stores/board-store";
import { VideoBlock as VideoBlockType } from "@/types";
import { BlockControls } from "./block-controls";
import { BlockEditWrapper } from "./block-edit-wrapper";
import { InputField, SelectField } from "./form-fields";
import { normalizeVideoUrl } from "@/lib/block-utils";

type VideoPlatform = VideoBlockType["settings"]["platform"];

interface VideoBlockProps {
  block: VideoBlockType;
  isEditing?: boolean;
  onClick?: () => void;
}

const PLATFORM_OPTIONS = [
  { value: "youtube", label: "YouTube" },
  { value: "vimeo", label: "Vimeo" },
  { value: "custom", label: "Custom iframe/embed URL" },
];

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

  // Use shared utility for URL normalization
  const embedUrl = useMemo(() => {
    if (!url) return "";
    if (platform === "custom") return url;
    return normalizeVideoUrl(url);
  }, [url, platform]);

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

  const handleCancel = () => setIsEditMode(false);

  if (isEditMode && isEditing) {
    return (
      <BlockEditWrapper
        isEditMode={isEditMode}
        isEditing={isEditing}
        onSave={handleSave}
        onCancel={handleCancel}
        isValid={!!editUrl}
      >
        <SelectField
          label="Video Platform"
          value={editPlatform}
          options={PLATFORM_OPTIONS}
          onChange={(v) => setEditPlatform(v as VideoPlatform)}
          placeholder="Select platform"
        />
        <InputField
          label="Video URL"
          value={editUrl}
          onChange={setEditUrl}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <InputField
          label="Title (optional)"
          value={editTitle}
          onChange={setEditTitle}
          placeholder="My latest video"
        />
      </BlockEditWrapper>
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
              title={title || "Embedded video"}
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
