"use client";

import { ImageBlock as ImageBlockType } from "@/types";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ImageBlockProps {
  block: ImageBlockType;
  onClick?: () => void;
  isEditing?: boolean;
}

export function ImageBlock({
  block,
  onClick,
  isEditing = false,
}: ImageBlockProps) {
  const { url, alt, caption, link, aspectRatio = "auto" } = block.settings;

  const aspectRatioClasses = {
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    landscape: "aspect-video",
    auto: "",
  };

  const content = (
    <div className="overflow-hidden rounded-lg">
      <div className={cn("relative w-full", aspectRatioClasses[aspectRatio])}>
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

  if (link && !isEditing) {
    return (
      <a
        href={link}
        onClick={onClick}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return content;
}
