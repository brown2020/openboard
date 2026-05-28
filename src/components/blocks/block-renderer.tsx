"use client";

import { ComponentType } from "react";
import { Block, BlockType } from "@/types";
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
import { BlockErrorBoundary } from "@/components/error-boundary";

/**
 * Standard props interface for all block components
 */
export interface BlockComponentProps<T extends Block = Block> {
  block: T;
  isEditing?: boolean;
  onClick?: () => void;
  boardId?: string;
}

/**
 * Block component registry - maps block types to their components
 * Makes it easy to add new block types without modifying the renderer
 */
 
const BLOCK_REGISTRY: Record<BlockType, ComponentType<BlockComponentProps<any>>> = {
  link: LinkBlock,
  text: TextBlock,
  richtext: RichTextBlock,
  image: ImageBlock,
  button: ButtonBlock,
  divider: DividerBlock,
  spacer: SpacerBlock,
  video: VideoBlock,
  embed: EmbedBlock,
  "social-links": SocialLinksBlock,
  calendar: CalendarBlock,
  form: FormBlock,
};

interface BlockRendererProps {
  block: Block;
  isEditing?: boolean;
  onClick?: () => void;
  onBlockClick?: (blockId: string) => void;
  boardId?: string;
}

export function BlockRenderer({
  block,
  isEditing = false,
  onClick,
  onBlockClick,
  boardId,
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

  const Component = BLOCK_REGISTRY[block.type];

  if (!Component) {
    return null;
  }

  return (
    <BlockErrorBoundary>
      <Component
        block={block}
        isEditing={isEditing}
        onClick={handleClick}
        boardId={boardId}
      />
    </BlockErrorBoundary>
  );
}
