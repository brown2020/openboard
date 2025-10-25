"use client";

import { SpacerBlock as SpacerBlockType } from "@/types";
import { cn } from "@/lib/utils";

interface SpacerBlockProps {
  block: SpacerBlockType;
}

export function SpacerBlock({ block }: SpacerBlockProps) {
  const { height = "md" } = block.settings;

  const heightClasses = {
    sm: "h-4",
    md: "h-8",
    lg: "h-16",
    xl: "h-24",
  };

  return <div className={cn(heightClasses[height])} aria-hidden="true" />;
}
