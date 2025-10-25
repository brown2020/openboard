"use client";

import { TextBlock as TextBlockType } from "@/types";
import { cn } from "@/lib/utils";

interface TextBlockProps {
  block: TextBlockType;
}

export function TextBlock({ block }: TextBlockProps) {
  const { content, alignment = "left", fontSize = "md" } = block.settings;

  const fontSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div
      className={cn(
        "prose prose-neutral dark:prose-invert max-w-none",
        fontSizeClasses[fontSize],
        alignmentClasses[alignment],
        "text-foreground"
      )}
    >
      <p className="whitespace-pre-wrap">{content}</p>
    </div>
  );
}
