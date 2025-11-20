"use client";

import { Block } from "@/types";
import { LinkBlock } from "./link-block";
import { TextBlock } from "./text-block";
import { RichTextBlock } from "./richtext-block";
import { ImageBlock } from "./image-block";
import { ButtonBlock } from "./button-block";
import { DividerBlock } from "./divider-block";
import { SpacerBlock } from "./spacer-block";
import { VideoBlock } from "./video-block";
import { EmbedBlock } from "./embed-block";
import { SocialLinksBlock } from "./social-links-block";
import { CalendarBlock } from "./calendar-block";
import { FormBlock } from "./form-block";

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
    case "richtext":
      return <RichTextBlock block={block} isEditing={isEditing} />;
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
      return (
        <VideoBlock
          block={block}
          isEditing={isEditing}
          onClick={handleClick}
        />
      );
    case "embed":
      return (
        <EmbedBlock
          block={block}
          isEditing={isEditing}
          onClick={handleClick}
        />
      );
    case "social-links":
      return (
        <SocialLinksBlock
          block={block}
          isEditing={isEditing}
          onClick={handleClick}
        />
      );
    case "calendar":
      return (
        <CalendarBlock
          block={block}
          isEditing={isEditing}
          onClick={handleClick}
        />
      );
    case "form":
      return (
        <FormBlock block={block} isEditing={isEditing} onClick={handleClick} />
      );
    default:
      return null;
  }
}
