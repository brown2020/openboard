"use client";

import { LinkBlock as LinkBlockType } from "@/types";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface LinkBlockProps {
  block: LinkBlockType;
  onClick?: () => void;
  isEditing?: boolean;
}

export function LinkBlock({
  block,
  onClick,
  isEditing = false,
}: LinkBlockProps) {
  const { title, url, description, icon, thumbnail } = block.settings;

  return (
    <a
      href={isEditing ? undefined : url}
      onClick={isEditing ? undefined : onClick}
      className={cn(
        "group relative flex items-center gap-4 p-4 rounded-lg transition-all",
        "bg-card hover:bg-card/80 border border-border",
        "hover:scale-[1.02] active:scale-[0.98]",
        isEditing && "cursor-default"
      )}
    >
      {/* Icon/Thumbnail */}
      {(icon || thumbnail) && (
        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center relative">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover"
              sizes="48px"
              unoptimized={
                thumbnail.startsWith("http") && !thumbnail.includes("localhost")
              }
            />
          ) : icon ? (
            <span className="text-2xl">{icon}</span>
          ) : (
            <ExternalLink className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate group-hover:underline">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {/* Arrow Icon */}
      <ExternalLink className="flex-shrink-0 w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
    </a>
  );
}
