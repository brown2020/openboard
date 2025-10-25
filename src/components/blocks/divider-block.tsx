"use client";

import { DividerBlock as DividerBlockType } from "@/types";
import { cn } from "@/lib/utils";

interface DividerBlockProps {
  block: DividerBlockType;
}

export function DividerBlock({ block }: DividerBlockProps) {
  const { style = "solid", width = "full" } = block.settings;

  const styleClasses = {
    solid: "border-solid",
    dashed: "border-dashed",
    dotted: "border-dotted",
  };

  const widthClasses = {
    full: "w-full",
    medium: "w-2/3 mx-auto",
    narrow: "w-1/3 mx-auto",
  };

  return (
    <hr
      className={cn(
        "border-t border-border",
        styleClasses[style],
        widthClasses[width]
      )}
    />
  );
}
