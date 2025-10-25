"use client";

import { Block } from "@/types";
import { LinkBlock } from "./link-block";
import { TextBlock } from "./text-block";
import { ImageBlock } from "./image-block";
import { ButtonBlock } from "./button-block";
import { DividerBlock } from "./divider-block";
import { SpacerBlock } from "./spacer-block";

interface BlockRendererProps {
  block: Block;
  isEditing?: boolean;
  onClick?: () => void;
  onBlockClick?: (blockId: string) => void;
}

export function BlockRenderer({
  block,
  isEditing = false,
  onClick,
  onBlockClick,
}: BlockRendererProps) {
  if (!block.visible && !isEditing) {
    return null;
  }

  const handleClick = () => {
    if (onBlockClick) {
      onBlockClick(block.id);
    }
    if (onClick) {
      onClick();
    }
  };

  switch (block.type) {
    case "link":
      return (
        <LinkBlock block={block} onClick={handleClick} isEditing={isEditing} />
      );
    case "text":
      return <TextBlock block={block} />;
    case "image":
      return (
        <ImageBlock block={block} onClick={handleClick} isEditing={isEditing} />
      );
    case "button":
      return (
        <ButtonBlock
          block={block}
          onClick={handleClick}
          isEditing={isEditing}
        />
      );
    case "divider":
      return <DividerBlock block={block} />;
    case "spacer":
      return <SpacerBlock block={block} />;
    case "video":
    case "embed":
    case "social-links":
    case "calendar":
    case "form":
      return (
        <div className="p-4 bg-muted rounded-lg text-center text-muted-foreground">
          {block.type} block (coming soon)
        </div>
      );
    default:
      return null;
  }
}
