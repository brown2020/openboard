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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  VideoBlock,
  EmbedBlock,
  SocialLinksBlock,
  CalendarBlock,
} from "@/types";
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
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [embedCustomUrl, setEmbedCustomUrl] = useState("");
  const [embedPlatform, setEmbedPlatform] =
    useState<EmbedBlock["settings"]["platform"]>("custom");
  const [socialLinks, setSocialLinks] = useState<
    SocialLinksBlock["settings"]["links"]
  >([
    { platform: "Instagram", url: "", icon: "📸" },
    { platform: "Twitter", url: "", icon: "🐦" },
  ]);
  const [socialLayout, setSocialLayout] =
    useState<SocialLinksBlock["settings"]["layout"]>("horizontal");
  const [calendarProvider, setCalendarProvider] =
    useState<CalendarBlock["settings"]["provider"]>("cal");
  const [calendarUrl, setCalendarUrl] = useState("");
  const [calendarTitle, setCalendarTitle] = useState("");

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
    setVideoUrl("");
    setVideoTitle("");
    setEmbedUrl("");
    setEmbedCustomUrl("");
    setEmbedPlatform("custom");
    setSocialLinks([
      { platform: "Instagram", url: "", icon: "📸" },
      { platform: "Twitter", url: "", icon: "🐦" },
    ]);
    setSocialLayout("horizontal");
    setCalendarProvider("cal");
    setCalendarUrl("");
    setCalendarTitle("");
  };

  const detectVideoPlatform = (
    url: string
  ): VideoBlock["settings"]["platform"] => {
    if (/youtu\.be|youtube\.com/.test(url)) {
      return "youtube";
    }
    if (/vimeo\.com/.test(url)) {
      return "vimeo";
    }
    return "custom";
  };

  const detectEmbedPlatform = (
    url: string
  ): EmbedBlock["settings"]["platform"] => {
    if (/spotify\.com/.test(url)) return "spotify";
    if (/twitter\.com|x\.com/.test(url)) return "twitter";
    if (/instagram\.com/.test(url)) return "instagram";
    return "custom";
  };

  const handleSocialLinkChange = (
    index: number,
    field: "platform" | "url" | "icon",
    value: string
  ) => {
    setSocialLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [field]: value } : link))
    );
  };

  const handleAddSocialLink = () => {
    setSocialLinks((prev) => [...prev, { platform: "", url: "", icon: "🔗" }]);
  };

  const handleRemoveSocialLink = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
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

      case "video":
        if (!videoUrl) return;
        newBlock = {
          ...newBlock,
          type: "video",
          settings: {
            url: videoUrl,
            platform: detectVideoPlatform(videoUrl),
            title: videoTitle || undefined,
          },
        } as VideoBlock;
        break;

      case "embed":
        if (!embedUrl && !embedCustomUrl) return;
        newBlock = {
          ...newBlock,
          type: "embed",
          settings: {
            url: embedUrl || embedCustomUrl,
            embedCode: embedCustomUrl || undefined,
            platform:
              embedPlatform !== "custom"
                ? embedPlatform
                : detectEmbedPlatform(embedUrl || embedCustomUrl),
          },
        } as EmbedBlock;
        break;

      case "social-links":
        const preparedLinks = socialLinks
          .map((link, index) => ({
            platform: link.platform?.trim() || `Link ${index + 1}`,
            url: link.url.trim(),
            icon: link.icon?.trim() || "🔗",
          }))
          .filter((link) => link.url);

        if (preparedLinks.length === 0) return;

        newBlock = {
          ...newBlock,
          type: "social-links",
          settings: {
            links: preparedLinks,
            layout: socialLayout,
          },
        } as SocialLinksBlock;
        break;

      case "calendar":
        if (!calendarUrl) return;
        newBlock = {
          ...newBlock,
          type: "calendar",
          settings: {
            provider: calendarProvider,
            url: calendarUrl,
            title: calendarTitle || undefined,
          },
        } as CalendarBlock;
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

      case "video":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-url">Video URL</Label>
              <Input
                id="video-url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Supports YouTube, Vimeo, or custom embed URLs.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-title">Title (optional)</Label>
              <Input
                id="video-title"
                placeholder="My latest video"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleAddBlock}
              disabled={!videoUrl}
            >
              Add Video
            </Button>
          </div>
        );

      case "embed":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select
                value={embedPlatform}
                onValueChange={(value) =>
                  setEmbedPlatform(
                    value as EmbedBlock["settings"]["platform"]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spotify">Spotify</SelectItem>
                  <SelectItem value="twitter">Twitter / X</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="embed-url">Content URL</Label>
              <Input
                id="embed-url"
                placeholder="https://open.spotify.com/track/..."
                value={embedUrl}
                onChange={(e) => setEmbedUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="embed-custom">Custom Embed URL (optional)</Label>
              <Input
                id="embed-custom"
                placeholder="https://open.spotify.com/embed/track/..."
                value={embedCustomUrl}
                onChange={(e) => setEmbedCustomUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use this if the default embed URL doesn&apos;t match what you
                need (e.g., custom iframe src).
              </p>
            </div>
            <Button
              className="w-full"
              onClick={handleAddBlock}
              disabled={!embedUrl && !embedCustomUrl}
            >
              Add Embed
            </Button>
          </div>
        );

      case "social-links":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Layout</Label>
              <Select
                value={socialLayout}
                onValueChange={(value) =>
                  setSocialLayout(value as SocialLinksBlock["settings"]["layout"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="horizontal">Horizontal</SelectItem>
                  <SelectItem value="grid">Grid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
              {socialLinks.map((link, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>Link {index + 1}</span>
                    {socialLinks.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSocialLink(index)}
                        className="h-6 px-2 text-muted-foreground"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Platform Label</Label>
                    <Input
                      placeholder="Instagram"
                      value={link.platform}
                      onChange={(e) =>
                        handleSocialLinkChange(index, "platform", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input
                      placeholder="https://instagram.com/username"
                      value={link.url}
                      onChange={(e) =>
                        handleSocialLinkChange(index, "url", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Icon (emoji or text)</Label>
                    <Input
                      placeholder="📸"
                      maxLength={4}
                      value={link.icon}
                      onChange={(e) =>
                        handleSocialLinkChange(index, "icon", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleAddSocialLink}
              className="w-full"
            >
              Add Another Link
            </Button>

            <Button
              className="w-full"
              onClick={handleAddBlock}
              disabled={socialLinks.every((link) => !link.url)}
            >
              Add Social Links
            </Button>
          </div>
        );

      case "calendar":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select
                value={calendarProvider}
                onValueChange={(value) =>
                  setCalendarProvider(
                    value as CalendarBlock["settings"]["provider"]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cal">Cal.com</SelectItem>
                  <SelectItem value="calendly">Calendly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="calendar-url">Booking URL</Label>
              <Input
                id="calendar-url"
                placeholder={
                  calendarProvider === "cal"
                    ? "https://cal.com/username"
                    : "https://calendly.com/username"
                }
                value={calendarUrl}
                onChange={(e) => setCalendarUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calendar-title">Title (optional)</Label>
              <Input
                id="calendar-title"
                placeholder="Book a call"
                value={calendarTitle}
                onChange={(e) => setCalendarTitle(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleAddBlock}
              disabled={!calendarUrl}
            >
              Add Calendar
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
