"use client";

import { ImageBlock as ImageBlockType } from "@/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useStorage } from "@/hooks/use-storage";
import { useState } from "react";
import { useBoardStore } from "@/stores/board-store";
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

interface ImageBlockProps {
  block: ImageBlockType;
  onClick?: () => void;
  isEditing?: boolean;
}

const ASPECT_RATIO_CLASSES = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-video",
  auto: "",
} as const;

export function ImageBlock({
  block,
  onClick,
  isEditing = false,
}: ImageBlockProps) {
  const { updateBlock } = useBoardStore();
  const { uploadFile, uploading } = useStorage();
  const [isEditMode, setIsEditMode] = useState(false);
  const { url, alt, caption, link, aspectRatio = "auto" } = block.settings;

  const [editUrl, setEditUrl] = useState(url);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editAlt, setEditAlt] = useState(alt);
  const [editCaption, setEditCaption] = useState(caption || "");
  const [editLink, setEditLink] = useState(link || "");
  const [editAspectRatio, setEditAspectRatio] = useState(aspectRatio);

  const handleSave = async () => {
    let finalUrl = editUrl;

    if (selectedFile) {
      const uploadedUrl = await uploadFile(selectedFile);
      if (uploadedUrl) {
        finalUrl = uploadedUrl;
      }
    }

    updateBlock(block.id, {
      settings: {
        url: finalUrl,
        alt: editAlt,
        caption: editCaption || undefined,
        link: editLink || undefined,
        aspectRatio: editAspectRatio,
      },
    });
    setIsEditMode(false);
  };

  if (isEditMode && isEditing) {
    return (
      <div className="p-4 border rounded-lg bg-card space-y-4">
        <div className="space-y-2">
          <Label>Image Source</Label>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="edit-picture">Upload New Image</Label>
            <Input
              id="edit-picture"
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setSelectedFile(e.target.files[0]);
                  setEditUrl(""); // Clear URL to indicate file selection
                }
              }}
            />
          </div>
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>
          <Label>Image URL</Label>
          <Input
            value={editUrl}
            onChange={(e) => {
              setEditUrl(e.target.value);
              setSelectedFile(null);
            }}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        <div className="space-y-2">
          <Label>Alt Text</Label>
          <Input
            value={editAlt}
            onChange={(e) => setEditAlt(e.target.value)}
            placeholder="Description of image"
          />
        </div>
        <div className="space-y-2">
          <Label>Caption (optional)</Label>
          <Input
            value={editCaption}
            onChange={(e) => setEditCaption(e.target.value)}
            placeholder="Add a caption"
          />
        </div>
        <div className="space-y-2">
          <Label>Link (optional)</Label>
          <Input
            value={editLink}
            onChange={(e) => setEditLink(e.target.value)}
            placeholder="https://example.com"
          />
        </div>
        <div className="space-y-2">
          <Label>Aspect Ratio</Label>
          <Select
            value={editAspectRatio}
            onValueChange={(v: any) => setEditAspectRatio(v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="square">Square</SelectItem>
              <SelectItem value="portrait">Portrait</SelectItem>
              <SelectItem value="landscape">Landscape</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={(!editUrl && !selectedFile) || !editAlt || uploading}
          >
            {uploading ? "Uploading..." : "Save"}
          </Button>
          <Button variant="outline" onClick={() => setIsEditMode(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  const content = (
    <div
      className={cn(
        "overflow-hidden rounded-lg",
        !block.visible && isEditing && "opacity-50"
      )}
    >
      <div className={cn("relative w-full", ASPECT_RATIO_CLASSES[aspectRatio])}>
        <Image
          src={url}
          alt={alt}
          fill
          className={cn(
            "object-cover",
            link &&
              !isEditing &&
              "hover:scale-105 transition-transform duration-300"
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized={url.startsWith("http") && !url.includes("localhost")}
        />
      </div>
      {caption && (
        <p className="mt-2 text-sm text-muted-foreground text-center">
          {caption}
        </p>
      )}
    </div>
  );

  return (
    <div className="group relative">
      {/* Editor Controls */}
      {isEditing && (
        <BlockControls
          blockId={block.id}
          isVisible={block.visible}
          onEdit={() => setIsEditMode(true)}
        />
      )}

      {/* Image Content */}
      {link && !isEditing ? (
        <a
          href={link}
          onClick={onClick}
          target="_blank"
          rel="noopener noreferrer"
        >
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}
