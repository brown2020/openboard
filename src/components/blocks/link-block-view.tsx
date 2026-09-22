"use client";

import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Props = {
  title: string;
  url: string;
  description?: string;
  icon?: string;
  thumbnail?: string;
  isEditing: boolean;
  isVisible: boolean;
  onClick?: () => void;
};

export function LinkBlockView({
  title,
  url,
  description,
  icon,
  thumbnail,
  isEditing,
  isVisible,
  onClick,
}: Props) {
  return (
    <a
      href={isEditing ? undefined : url}
      onClick={isEditing ? undefined : onClick}
      className={cn(
        "group/link relative flex items-center gap-4 p-4 rounded-lg transition-all",
        "bg-card hover:bg-card/80 border border-border",
        !isEditing && "hover:scale-[1.02] active:scale-[0.98]",
        isEditing && "cursor-default",
        !isVisible && isEditing && "opacity-50"
      )}
    >
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
          ) : (
            <span className="text-2xl">{icon}</span>
          )}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate group-hover/link:underline">
          {title}
        </h3>
        {description ? (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        ) : null}
      </div>

      <ExternalLink className="flex-shrink-0 w-5 h-5 text-muted-foreground group-hover/link:text-foreground transition-colors" />
    </a>
  );
}
