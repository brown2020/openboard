"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { BlockType, Block } from "@/types";
import { cn } from "@/lib/utils";
import {
  Link,
  Type,
  FileText,
  Image,
  Video,
  Code,
  MousePointer,
  Share2,
  Calendar,
  FileInput,
  Minus,
  Space,
} from "lucide-react";

interface BlockTypeOption {
  type: BlockType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
}

const BLOCK_OPTIONS: BlockTypeOption[] = [
  {
    type: "text",
    label: "Text",
    description: "Plain text content",
    icon: Type,
    keywords: ["text", "paragraph", "write"],
  },
  {
    type: "richtext",
    label: "Rich Text",
    description: "Formatted text with headings, lists, and more",
    icon: FileText,
    keywords: ["rich", "formatted", "heading", "list", "editor"],
  },
  {
    type: "link",
    label: "Link",
    description: "External link with preview",
    icon: Link,
    keywords: ["link", "url", "website", "external"],
  },
  {
    type: "button",
    label: "Button",
    description: "Call-to-action button",
    icon: MousePointer,
    keywords: ["button", "cta", "action", "click"],
  },
  {
    type: "image",
    label: "Image",
    description: "Image with optional caption",
    icon: Image,
    keywords: ["image", "photo", "picture", "media"],
  },
  {
    type: "video",
    label: "Video",
    description: "YouTube, Vimeo, or custom video",
    icon: Video,
    keywords: ["video", "youtube", "vimeo", "embed"],
  },
  {
    type: "embed",
    label: "Embed",
    description: "Spotify, Twitter, Instagram embed",
    icon: Code,
    keywords: ["embed", "spotify", "twitter", "instagram", "social"],
  },
  {
    type: "social-links",
    label: "Social Links",
    description: "Grid of social media links",
    icon: Share2,
    keywords: ["social", "links", "icons", "twitter", "instagram"],
  },
  {
    type: "calendar",
    label: "Calendar",
    description: "Cal.com or Calendly booking widget",
    icon: Calendar,
    keywords: ["calendar", "booking", "schedule", "cal", "calendly"],
  },
  {
    type: "form",
    label: "Form",
    description: "Contact or signup form",
    icon: FileInput,
    keywords: ["form", "contact", "signup", "input", "submit"],
  },
  {
    type: "divider",
    label: "Divider",
    description: "Horizontal line separator",
    icon: Minus,
    keywords: ["divider", "separator", "line", "hr"],
  },
  {
    type: "spacer",
    label: "Spacer",
    description: "Vertical spacing",
    icon: Space,
    keywords: ["spacer", "space", "padding", "margin"],
  },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlock: (type: BlockType) => void;
  position?: { top: number; left: number };
}

/**
 * Slash command palette for quickly adding new blocks.
 * Triggered by typing "/" in the editor.
 */
export function CommandPalette({
  isOpen,
  onClose,
  onSelectBlock,
  position,
}: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!search) return BLOCK_OPTIONS;

    const searchLower = search.toLowerCase();
    return BLOCK_OPTIONS.filter(
      (option) =>
        option.label.toLowerCase().includes(searchLower) ||
        option.description.toLowerCase().includes(searchLower) ||
        option.keywords.some((kw) => kw.includes(searchLower))
    );
  }, [search]);

  // Reset selected index when options change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredOptions]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;

        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;

        case "Enter":
          e.preventDefault();
          if (filteredOptions[selectedIndex]) {
            onSelectBlock(filteredOptions[selectedIndex].type);
            onClose();
          }
          break;

        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [filteredOptions, selectedIndex, onSelectBlock, onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed z-50 w-72 bg-popover border rounded-lg shadow-lg overflow-hidden",
        "animate-in fade-in-0 zoom-in-95"
      )}
      style={
        position
          ? { top: position.top, left: position.left }
          : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
      }
    >
      {/* Search Input */}
      <div className="p-2 border-b">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search blocks..."
          className="w-full px-3 py-2 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
          autoFocus
        />
      </div>

      {/* Options List */}
      <div className="max-h-64 overflow-y-auto p-1">
        {filteredOptions.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            No blocks found
          </div>
        ) : (
          filteredOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <button
                key={option.type}
                onClick={() => {
                  onSelectBlock(option.type);
                  onClose();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors",
                  index === selectedIndex
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                )}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {option.description}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t bg-muted/50 text-xs text-muted-foreground flex gap-3">
        <span>
          <kbd className="px-1 py-0.5 bg-background rounded text-[10px]">↑↓</kbd>{" "}
          Navigate
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-background rounded text-[10px]">↵</kbd>{" "}
          Select
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-background rounded text-[10px]">Esc</kbd>{" "}
          Close
        </span>
      </div>
    </div>
  );
}

/**
 * Default block settings for each block type
 */
export function getDefaultBlockSettings(type: BlockType): Block["settings"] {
  switch (type) {
    case "text":
      return { content: "", alignment: "left", fontSize: "md" };
    case "richtext":
      return { content: "", alignment: "left" };
    case "link":
      return { url: "", title: "New Link", description: "" };
    case "button":
      return { text: "Click me", url: "", style: "primary", size: "md" };
    case "image":
      return { url: "", alt: "", aspectRatio: "auto" };
    case "video":
      return { url: "", platform: "youtube" };
    case "embed":
      return { url: "", platform: "custom" };
    case "social-links":
      return { links: [], layout: "horizontal" };
    case "calendar":
      return { provider: "cal", url: "" };
    case "form":
      return { fields: [], submitText: "Submit" };
    case "divider":
      return { style: "solid", width: "full" };
    case "spacer":
      return { height: "md" };
    default: {
      // Exhaustive check - this should never be reached
      const _exhaustive: never = type;
      return { content: "" } as Block["settings"];
    }
  }
}
