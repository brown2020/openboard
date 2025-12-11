"use client";

import { BlockType } from "@/types";
import { cn } from "@/lib/utils";
import {
  Link as LinkIcon,
  Type,
  Image,
  RectangleHorizontal,
  Minus,
  Space,
  FileText,
  Video,
  Globe,
  Share2,
  Calendar,
  ClipboardList,
} from "lucide-react";

/**
 * Block type configuration
 */
export interface BlockTypeOption {
  type: BlockType;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: "content" | "media" | "interaction" | "layout";
}

/**
 * All available block types with their metadata
 */
export const BLOCK_TYPE_OPTIONS: BlockTypeOption[] = [
  {
    type: "richtext",
    label: "Rich Text",
    description: "Add formatted text with styling",
    icon: <FileText className="w-5 h-5" />,
    category: "content",
  },
  {
    type: "text",
    label: "Simple Text",
    description: "Plain text without formatting",
    icon: <Type className="w-5 h-5" />,
    category: "content",
  },
  {
    type: "link",
    label: "Link",
    description: "Clickable link button",
    icon: <LinkIcon className="w-5 h-5" />,
    category: "interaction",
  },
  {
    type: "button",
    label: "Button",
    description: "Call-to-action button",
    icon: <RectangleHorizontal className="w-5 h-5" />,
    category: "interaction",
  },
  {
    type: "image",
    label: "Image",
    description: "Add an image",
    icon: <Image className="w-5 h-5" />,
    category: "media",
  },
  {
    type: "video",
    label: "Video",
    description: "Embed a YouTube or Vimeo video",
    icon: <Video className="w-5 h-5" />,
    category: "media",
  },
  {
    type: "embed",
    label: "Embed",
    description: "Spotify, Twitter, Instagram content",
    icon: <Globe className="w-5 h-5" />,
    category: "media",
  },
  {
    type: "social-links",
    label: "Social Links",
    description: "Icon grid linking to your profiles",
    icon: <Share2 className="w-5 h-5" />,
    category: "interaction",
  },
  {
    type: "calendar",
    label: "Calendar",
    description: "Embed Cal.com or Calendly",
    icon: <Calendar className="w-5 h-5" />,
    category: "interaction",
  },
  {
    type: "form",
    label: "Form",
    description: "Collect leads with custom fields",
    icon: <ClipboardList className="w-5 h-5" />,
    category: "interaction",
  },
  {
    type: "divider",
    label: "Divider",
    description: "Horizontal line separator",
    icon: <Minus className="w-5 h-5" />,
    category: "layout",
  },
  {
    type: "spacer",
    label: "Spacer",
    description: "Add vertical space",
    icon: <Space className="w-5 h-5" />,
    category: "layout",
  },
];

/**
 * Category labels for display
 */
const CATEGORY_LABELS = {
  content: "Content",
  interaction: "Interactive",
  media: "Media",
  layout: "Layout",
} as const;

/**
 * Block Type Button Component
 */
interface BlockTypeButtonProps {
  blockType: BlockTypeOption;
  onClick: () => void;
}

function BlockTypeButton({ blockType, onClick }: BlockTypeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border bg-card text-left",
        "hover:bg-accent hover:border-accent-foreground/20 transition-colors"
      )}
    >
      <div className="text-muted-foreground mt-0.5">{blockType.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{blockType.label}</div>
        <div className="text-xs text-muted-foreground">
          {blockType.description}
        </div>
      </div>
    </button>
  );
}

/**
 * Block Category Component
 * Groups block types by category
 */
interface BlockCategoryProps {
  category: BlockTypeOption["category"];
  onSelect: (type: BlockType) => void;
}

function BlockCategory({ category, onSelect }: BlockCategoryProps) {
  const filteredTypes = BLOCK_TYPE_OPTIONS.filter(
    (b) => b.category === category
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        {CATEGORY_LABELS[category]}
      </h3>
      <div className="grid gap-2">
        {filteredTypes.map((blockType) => (
          <BlockTypeButton
            key={blockType.type}
            blockType={blockType}
            onClick={() => onSelect(blockType.type)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Block Type Selector Component
 * Displays all block types organized by category
 */
interface BlockTypeSelectorProps {
  onSelect: (type: BlockType) => void;
}

export function BlockTypeSelector({ onSelect }: BlockTypeSelectorProps) {
  return (
    <div className="space-y-6">
      <BlockCategory category="content" onSelect={onSelect} />
      <BlockCategory category="interaction" onSelect={onSelect} />
      <BlockCategory category="media" onSelect={onSelect} />
      <BlockCategory category="layout" onSelect={onSelect} />
    </div>
  );
}
