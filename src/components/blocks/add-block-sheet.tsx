"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBoardStore } from "@/stores/board-store";
import {
  BlockType,
  LinkBlock,
  RichTextBlock,
  ButtonBlock,
  ImageBlock,
  DividerBlock,
  SpacerBlock,
  TextBlock,
} from "@/types";
import {
  Link as LinkIcon,
  Type,
  Image,
  RectangleHorizontal,
  Minus,
  Space,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "./rich-text-editor";

interface AddBlockSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BlockTypeOption {
  type: BlockType;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: "content" | "media" | "interaction" | "layout";
}

const blockTypes: BlockTypeOption[] = [
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

export function AddBlockSheet({ open, onOpenChange }: AddBlockSheetProps) {
  const { addBlock, currentBoard } = useBoardStore();
  const [selectedType, setSelectedType] = useState<BlockType | null>(null);

  // Form states for different block types
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [textContent, setTextContent] = useState("");
  const [richTextContent, setRichTextContent] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");

  const resetForm = () => {
    setSelectedType(null);
    setLinkTitle("");
    setLinkUrl("");
    setTextContent("");
    setRichTextContent("");
    setButtonText("");
    setButtonUrl("");
    setImageUrl("");
    setImageAlt("");
  };

  const handleAddBlock = () => {
    if (!selectedType || !currentBoard) return;

    const order = currentBoard.blocks.length;
    const id = `block_${Date.now()}`;

    let newBlock: any = {
      id,
      order,
      visible: true,
    };

    switch (selectedType) {
      case "richtext":
        if (!richTextContent) return;
        newBlock = {
          ...newBlock,
          type: "richtext",
          settings: { content: richTextContent, alignment: "left" },
        } as RichTextBlock;
        break;

      case "text":
        if (!textContent) return;
        newBlock = {
          ...newBlock,
          type: "text",
          settings: { content: textContent, alignment: "left", fontSize: "md" },
        } as TextBlock;
        break;

      case "link":
        if (!linkTitle || !linkUrl) return;
        newBlock = {
          ...newBlock,
          type: "link",
          settings: { url: linkUrl, title: linkTitle },
        } as LinkBlock;
        break;

      case "button":
        if (!buttonText || !buttonUrl) return;
        newBlock = {
          ...newBlock,
          type: "button",
          settings: {
            text: buttonText,
            url: buttonUrl,
            style: "primary",
            size: "md",
          },
        } as ButtonBlock;
        break;

      case "image":
        if (!imageUrl || !imageAlt) return;
        newBlock = {
          ...newBlock,
          type: "image",
          settings: { url: imageUrl, alt: imageAlt, aspectRatio: "auto" },
        } as ImageBlock;
        break;

      case "divider":
        newBlock = {
          ...newBlock,
          type: "divider",
          settings: { style: "solid", width: "full" },
        } as DividerBlock;
        break;

      case "spacer":
        newBlock = {
          ...newBlock,
          type: "spacer",
          settings: { height: "md" },
        } as SpacerBlock;
        break;

      default:
        return;
    }

    addBlock(newBlock);
    resetForm();
    onOpenChange(false);
  };

  const renderBlockForm = () => {
    if (!selectedType) return null;

    switch (selectedType) {
      case "richtext":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Content</Label>
              <RichTextEditor
                content={richTextContent}
                onChange={setRichTextContent}
                placeholder="Start writing your rich text content..."
              />
            </div>
            <Button
              className="w-full"
              onClick={handleAddBlock}
              disabled={!richTextContent}
            >
              Add Rich Text
            </Button>
          </div>
        );

      case "text":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-content">Content</Label>
              <Input
                id="text-content"
                placeholder="Enter your text..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleAddBlock}
              disabled={!textContent}
            >
              Add Text
            </Button>
          </div>
        );

      case "link":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="link-title">Title</Label>
              <Input
                id="link-title"
                placeholder="My Website"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleAddBlock}
              disabled={!linkTitle || !linkUrl}
            >
              Add Link
            </Button>
          </div>
        );

      case "button":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="button-text">Button Text</Label>
              <Input
                id="button-text"
                placeholder="Click me"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="button-url">URL</Label>
              <Input
                id="button-url"
                placeholder="https://example.com"
                value={buttonUrl}
                onChange={(e) => setButtonUrl(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleAddBlock}
              disabled={!buttonText || !buttonUrl}
            >
              Add Button
            </Button>
          </div>
        );

      case "image":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-alt">Alt Text</Label>
              <Input
                id="image-alt"
                placeholder="Description of image"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleAddBlock}
              disabled={!imageUrl || !imageAlt}
            >
              Add Image
            </Button>
          </div>
        );

      case "divider":
      case "spacer":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This block will be added with default settings. You can customize
              it after adding.
            </p>
            <Button className="w-full" onClick={handleAddBlock}>
              Add {selectedType === "divider" ? "Divider" : "Spacer"}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {selectedType ? "Configure Block" : "Add Block"}
          </SheetTitle>
          <SheetDescription>
            {selectedType
              ? "Fill in the details for your block"
              : "Choose a block type to add to your board"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {!selectedType ? (
            <div className="space-y-6">
              {/* Content Blocks */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Content
                </h3>
                <div className="grid gap-2">
                  {blockTypes
                    .filter((b) => b.category === "content")
                    .map((blockType) => (
                      <button
                        key={blockType.type}
                        onClick={() => setSelectedType(blockType.type)}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg border bg-card text-left hover:bg-accent hover:border-accent-foreground/20 transition-colors"
                        )}
                      >
                        <div className="text-muted-foreground mt-0.5">
                          {blockType.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            {blockType.label}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {blockType.description}
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              {/* Interaction Blocks */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Interactive
                </h3>
                <div className="grid gap-2">
                  {blockTypes
                    .filter((b) => b.category === "interaction")
                    .map((blockType) => (
                      <button
                        key={blockType.type}
                        onClick={() => setSelectedType(blockType.type)}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg border bg-card text-left hover:bg-accent hover:border-accent-foreground/20 transition-colors"
                        )}
                      >
                        <div className="text-muted-foreground mt-0.5">
                          {blockType.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            {blockType.label}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {blockType.description}
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              {/* Media Blocks */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Media
                </h3>
                <div className="grid gap-2">
                  {blockTypes
                    .filter((b) => b.category === "media")
                    .map((blockType) => (
                      <button
                        key={blockType.type}
                        onClick={() => setSelectedType(blockType.type)}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg border bg-card text-left hover:bg-accent hover:border-accent-foreground/20 transition-colors"
                        )}
                      >
                        <div className="text-muted-foreground mt-0.5">
                          {blockType.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            {blockType.label}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {blockType.description}
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              {/* Layout Blocks */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Layout
                </h3>
                <div className="grid gap-2">
                  {blockTypes
                    .filter((b) => b.category === "layout")
                    .map((blockType) => (
                      <button
                        key={blockType.type}
                        onClick={() => setSelectedType(blockType.type)}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg border bg-card text-left hover:bg-accent hover:border-accent-foreground/20 transition-colors"
                        )}
                      >
                        <div className="text-muted-foreground mt-0.5">
                          {blockType.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            {blockType.label}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {blockType.description}
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedType(null)}
              >
                ← Back to block types
              </Button>
              {renderBlockForm()}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
