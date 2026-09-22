"use client";

import { ImageBlock as ImageBlockType } from "@/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useStorage } from "@/hooks/use-storage";
import { useState } from "react";
import { useBoardStore } from "@/stores/board-store";
import { BlockControls } from "./block-controls";
import { ImageBlockEditForm } from "./image-block-edit-form";

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
  const [editAspectRatio, setEditAspectRatio] = useState<"square" | "portrait" | "landscape" | "auto">(aspectRatio);

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
      <ImageBlockEditForm
        editUrl={editUrl}
        setEditUrl={setEditUrl}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        editAlt={editAlt}
        setEditAlt={setEditAlt}
        editCaption={editCaption}
        setEditCaption={setEditCaption}
        editLink={editLink}
        setEditLink={setEditLink}
        editAspectRatio={editAspectRatio}
        setEditAspectRatio={setEditAspectRatio}
        uploading={uploading}
        onSave={() => void handleSave()}
        onCancel={() => setIsEditMode(false)}
      />
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
