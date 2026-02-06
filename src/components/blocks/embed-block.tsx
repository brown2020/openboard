"use client";

import { useMemo, useState } from "react";
import { Globe, Music2, MessageSquare } from "lucide-react";
import { EmbedBlock as EmbedBlockType } from "@/types";
import { useBoardStore } from "@/stores/board-store";
import { BlockControls } from "./block-controls";
import { BlockEditWrapper } from "./block-edit-wrapper";
import { InputField, SelectField } from "./form-fields";
import { normalizeEmbedUrl } from "@/lib/block-utils";

type EmbedPlatform = NonNullable<EmbedBlockType["settings"]["platform"]>;

const PLATFORM_OPTIONS = [
  { value: "spotify", label: "Spotify" },
  { value: "twitter", label: "Twitter/X" },
  { value: "instagram", label: "Instagram" },
  { value: "custom", label: "Custom" },
];

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

function getDefaultEmbedCode(url: string, platform?: EmbedPlatform): string {
  if (!url) return "";

  switch (platform) {
    case "spotify":
      if (url.includes("embed")) return url;
      return url.replace("open.spotify.com/", "open.spotify.com/embed/");
    case "twitter":
      return `https://platform.twitter.com/widgets/tweet.html?url=${encodeURIComponent(
        url
      )}`;
    case "instagram":
      return `${url}embed/`;
    default:
      return normalizeEmbedUrl(url);
  }
}

export function EmbedBlock({
  block,
  isEditing = false,
  onClick,
}: EmbedBlockProps) {
  const { updateBlock } = useBoardStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const { url, embedCode, platform = "custom" } = block.settings;

  const [editPlatform, setEditPlatform] = useState<EmbedPlatform>(platform);
  const [editUrl, setEditUrl] = useState(url);
  const [editEmbed, setEditEmbed] = useState(embedCode || "");

  const resolvedEmbed = useMemo(() => {
    if (editEmbed) return editEmbed;
    return getDefaultEmbedCode(editUrl, editPlatform);
  }, [editEmbed, editUrl, editPlatform]);

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

  const handleCancel = () => setIsEditMode(false);

  if (isEditMode && isEditing) {
    return (
      <BlockEditWrapper
        isEditMode={isEditMode}
        isEditing={isEditing}
        onSave={handleSave}
        onCancel={handleCancel}
        isValid={!!editUrl || !!editEmbed}
      >
        <SelectField
          label="Platform"
          value={editPlatform}
          options={PLATFORM_OPTIONS}
          onChange={(v) => setEditPlatform(v as EmbedPlatform)}
          placeholder="Select platform"
        />
        <InputField
          label="Content URL"
          value={editUrl}
          onChange={setEditUrl}
          placeholder="https://..."
        />
        <div className="space-y-2">
          <InputField
            label="Custom Embed URL (optional)"
            value={editEmbed}
            onChange={setEditEmbed}
            placeholder="https://open.spotify.com/embed/track/..."
          />
          <p className="text-xs text-muted-foreground">
            Provide a custom embed iframe src if Spotify/Twitter defaults don't
            match your content.
          </p>
        </div>
      </BlockEditWrapper>
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
        <BlockControls
          blockId={block.id}
          isVisible={block.visible}
          onEdit={() => setIsEditMode(true)}
        />
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
              title={`Embedded ${normalizedPlatform} content`}
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
