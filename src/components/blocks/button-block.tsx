"use client";

import { ButtonBlock as ButtonBlockType } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ButtonBlockProps {
  block: ButtonBlockType;
  onClick?: () => void;
  isEditing?: boolean;
}

export function ButtonBlock({
  block,
  onClick,
  isEditing = false,
}: ButtonBlockProps) {
  const { text, url, style = "primary", size = "md" } = block.settings;

  const sizeMap = {
    sm: "default" as const,
    md: "lg" as const,
    lg: "lg" as const,
  };

  const variantMap = {
    primary: "default" as const,
    secondary: "secondary" as const,
    outline: "outline" as const,
    ghost: "ghost" as const,
  };

  if (isEditing) {
    return (
      <div className="flex justify-center">
        <Button
          variant={variantMap[style]}
          size={sizeMap[size]}
          className={cn("min-w-[200px]", size === "lg" && "text-lg px-8 py-6")}
        >
          {text}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <Button
        variant={variantMap[style]}
        size={sizeMap[size]}
        className={cn("min-w-[200px]", size === "lg" && "text-lg px-8 py-6")}
        asChild
      >
        <a
          href={url}
          onClick={onClick}
          target="_blank"
          rel="noopener noreferrer"
        >
          {text}
        </a>
      </Button>
    </div>
  );
}
