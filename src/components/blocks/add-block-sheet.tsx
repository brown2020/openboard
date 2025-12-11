"use client";

import { useReducer, useCallback } from "react";
import { useStorage } from "@/hooks/use-storage";
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
  FormBlock,
  Block,
} from "@/types";
import { RichTextEditor } from "./rich-text-editor";
import { useAI } from "@/hooks/use-ai";
import { Sparkles } from "lucide-react";
import { BlockTypeSelector } from "./block-type-selector";

// ============================================================================
// Types & Interfaces
// ============================================================================

interface AddBlockSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormFieldType = "text" | "email" | "textarea";

interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  required: boolean;
  placeholder?: string;
}

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

// Form state for all block types
interface FormState {
  selectedType: BlockType | null;
  // Link
  linkTitle: string;
  linkUrl: string;
  // Text
  textContent: string;
  // Rich Text
  richTextContent: string;
  // Button
  buttonText: string;
  buttonUrl: string;
  // Image
  imageUrl: string;
  imageAlt: string;
  selectedImageFile: File | null;
  // Video
  videoUrl: string;
  videoTitle: string;
  // Embed
  embedUrl: string;
  embedCustomUrl: string;
  embedPlatform: EmbedBlock["settings"]["platform"];
  // Social Links
  socialLinks: SocialLink[];
  socialLayout: SocialLinksBlock["settings"]["layout"];
  // Calendar
  calendarProvider: CalendarBlock["settings"]["provider"];
  calendarUrl: string;
  calendarTitle: string;
  // Form
  formFields: FormField[];
  formSubmitText: string;
  formSubmitUrl: string;
}

type FormAction =
  | { type: "SET_SELECTED_TYPE"; payload: BlockType | null }
  | { type: "SET_FIELD"; field: keyof FormState; value: unknown }
  | {
      type: "SET_SOCIAL_LINK";
      index: number;
      field: keyof SocialLink;
      value: string;
    }
  | { type: "ADD_SOCIAL_LINK" }
  | { type: "REMOVE_SOCIAL_LINK"; index: number }
  | {
      type: "SET_FORM_FIELD";
      index: number;
      field: keyof FormField;
      value: unknown;
    }
  | { type: "ADD_FORM_FIELD" }
  | { type: "REMOVE_FORM_FIELD"; index: number }
  | { type: "RESET" };

// ============================================================================
// Initial State & Reducer
// ============================================================================

const initialState: FormState = {
  selectedType: null,
  linkTitle: "",
  linkUrl: "",
  textContent: "",
  richTextContent: "",
  buttonText: "",
  buttonUrl: "",
  imageUrl: "",
  imageAlt: "",
  selectedImageFile: null,
  videoUrl: "",
  videoTitle: "",
  embedUrl: "",
  embedCustomUrl: "",
  embedPlatform: "custom",
  socialLinks: [
    { platform: "Instagram", url: "", icon: "📸" },
    { platform: "Twitter", url: "", icon: "🐦" },
  ],
  socialLayout: "horizontal",
  calendarProvider: "cal",
  calendarUrl: "",
  calendarTitle: "",
  formFields: [
    { id: "field_name", type: "text", label: "Name", required: true },
    { id: "field_email", type: "email", label: "Email", required: true },
  ],
  formSubmitText: "Send",
  formSubmitUrl: "",
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_SELECTED_TYPE":
      return { ...state, selectedType: action.payload };

    case "SET_FIELD":
      return { ...state, [action.field]: action.value };

    case "SET_SOCIAL_LINK":
      return {
        ...state,
        socialLinks: state.socialLinks.map((link, i) =>
          i === action.index ? { ...link, [action.field]: action.value } : link
        ),
      };

    case "ADD_SOCIAL_LINK":
      return {
        ...state,
        socialLinks: [
          ...state.socialLinks,
          { platform: "", url: "", icon: "🔗" },
        ],
      };

    case "REMOVE_SOCIAL_LINK":
      return {
        ...state,
        socialLinks: state.socialLinks.filter((_, i) => i !== action.index),
      };

    case "SET_FORM_FIELD":
      return {
        ...state,
        formFields: state.formFields.map((field, i) =>
          i === action.index
            ? { ...field, [action.field]: action.value }
            : field
        ),
      };

    case "ADD_FORM_FIELD":
      return {
        ...state,
        formFields: [
          ...state.formFields,
          {
            id: `field_${Date.now()}`,
            type: "text",
            label: "Untitled field",
            required: false,
          },
        ],
      };

    case "REMOVE_FORM_FIELD":
      if (state.formFields.length === 1) return state;
      return {
        ...state,
        formFields: state.formFields.filter((_, i) => i !== action.index),
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function detectVideoPlatform(url: string): VideoBlock["settings"]["platform"] {
  if (/youtu\.be|youtube\.com/.test(url)) return "youtube";
  if (/vimeo\.com/.test(url)) return "vimeo";
  return "custom";
}

function detectEmbedPlatform(url: string): EmbedBlock["settings"]["platform"] {
  if (/spotify\.com/.test(url)) return "spotify";
  if (/twitter\.com|x\.com/.test(url)) return "twitter";
  if (/instagram\.com/.test(url)) return "instagram";
  return "custom";
}

function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

// ============================================================================
// Component
// ============================================================================

export function AddBlockSheet({ open, onOpenChange }: AddBlockSheetProps) {
  const { addBlock, currentBoard } = useBoardStore();
  const { uploadFile, uploading } = useStorage();
  const { generate, isLoading: isAILoading } = useAI();
  const [state, dispatch] = useReducer(formReducer, initialState);

  const setField = useCallback(
    <K extends keyof FormState>(field: K, value: FormState[K]) => {
      dispatch({ type: "SET_FIELD", field, value });
    },
    []
  );

  const handleAISuggestion = async () => {
    if (!state.selectedType) return;

    let prompt = "";
    let type: "content-suggestions" | "link-title" = "content-suggestions";

    switch (state.selectedType) {
      case "richtext":
      case "text":
        prompt =
          "Write a short, engaging paragraph for a personal board about: ";
        const topic = window.prompt("What should this text be about?");
        if (!topic) return;
        prompt += topic;
        break;
      case "link":
        prompt = "Generate a catchy title for a link to: ";
        const url = state.linkUrl || window.prompt("What is the link URL?");
        if (!url) return;
        setField("linkUrl", url);
        prompt += url;
        type = "link-title";
        break;
      default:
        return;
    }

    await generate(prompt, type, (data) => {
      if (state.selectedType === "link") {
        setField("linkTitle", data.replace(/^"|"$/g, ""));
      } else if (state.selectedType === "text") {
        setField("textContent", data);
      } else if (state.selectedType === "richtext") {
        setField("richTextContent", `<p>${data}</p>`);
      }
    });
  };

  const handleAddBlock = async () => {
    if (!state.selectedType || !currentBoard) return;

    const order = currentBoard.blocks.length;
    const id = generateBlockId();
    const baseBlock = { id, order, visible: true };

    let newBlock: Block | null = null;

    switch (state.selectedType) {
      case "richtext":
        if (!state.richTextContent) return;
        newBlock = {
          ...baseBlock,
          type: "richtext",
          settings: { content: state.richTextContent, alignment: "left" },
        } as RichTextBlock;
        break;

      case "text":
        if (!state.textContent) return;
        newBlock = {
          ...baseBlock,
          type: "text",
          settings: {
            content: state.textContent,
            alignment: "left",
            fontSize: "md",
          },
        } as TextBlock;
        break;

      case "link":
        if (!state.linkTitle || !state.linkUrl) return;
        newBlock = {
          ...baseBlock,
          type: "link",
          settings: { url: state.linkUrl, title: state.linkTitle },
        } as LinkBlock;
        break;

      case "button":
        if (!state.buttonText || !state.buttonUrl) return;
        newBlock = {
          ...baseBlock,
          type: "button",
          settings: {
            text: state.buttonText,
            url: state.buttonUrl,
            style: "primary",
            size: "md",
          },
        } as ButtonBlock;
        break;

      case "image":
        let finalImageUrl = state.imageUrl;
        if (state.selectedImageFile) {
          const uploadedUrl = await uploadFile(state.selectedImageFile);
          if (uploadedUrl) finalImageUrl = uploadedUrl;
        }
        if (!finalImageUrl || !state.imageAlt) return;
        newBlock = {
          ...baseBlock,
          type: "image",
          settings: {
            url: finalImageUrl,
            alt: state.imageAlt,
            aspectRatio: "auto",
          },
        } as ImageBlock;
        break;

      case "video":
        if (!state.videoUrl) return;
        newBlock = {
          ...baseBlock,
          type: "video",
          settings: {
            url: state.videoUrl,
            platform: detectVideoPlatform(state.videoUrl),
            title: state.videoTitle || undefined,
          },
        } as VideoBlock;
        break;

      case "embed":
        if (!state.embedUrl && !state.embedCustomUrl) return;
        newBlock = {
          ...baseBlock,
          type: "embed",
          settings: {
            url: state.embedUrl || state.embedCustomUrl,
            embedCode: state.embedCustomUrl || undefined,
            platform:
              state.embedPlatform !== "custom"
                ? state.embedPlatform
                : detectEmbedPlatform(state.embedUrl || state.embedCustomUrl),
          },
        } as EmbedBlock;
        break;

      case "social-links":
        const preparedLinks = state.socialLinks
          .map((link, index) => ({
            platform: link.platform?.trim() || `Link ${index + 1}`,
            url: link.url.trim(),
            icon: link.icon?.trim() || "🔗",
          }))
          .filter((link) => link.url);
        if (preparedLinks.length === 0) return;
        newBlock = {
          ...baseBlock,
          type: "social-links",
          settings: { links: preparedLinks, layout: state.socialLayout },
        } as SocialLinksBlock;
        break;

      case "calendar":
        if (!state.calendarUrl) return;
        newBlock = {
          ...baseBlock,
          type: "calendar",
          settings: {
            provider: state.calendarProvider,
            url: state.calendarUrl,
            title: state.calendarTitle || undefined,
          },
        } as CalendarBlock;
        break;

      case "form":
        const preparedFields = state.formFields.map((field, index) => ({
          ...field,
          id: field.id || `field_${index}`,
          label: field.label || `Field ${index + 1}`,
        }));
        if (preparedFields.length === 0) return;
        newBlock = {
          ...baseBlock,
          type: "form",
          settings: {
            fields: preparedFields,
            submitText: state.formSubmitText || "Submit",
            submitUrl: state.formSubmitUrl || undefined,
          },
        } as FormBlock;
        break;

      case "divider":
        newBlock = {
          ...baseBlock,
          type: "divider",
          settings: { style: "solid", width: "full" },
        } as DividerBlock;
        break;

      case "spacer":
        newBlock = {
          ...baseBlock,
          type: "spacer",
          settings: { height: "md" },
        } as SpacerBlock;
        break;
    }

    if (newBlock) {
      addBlock(newBlock);
      dispatch({ type: "RESET" });
      onOpenChange(false);
    }
  };

  const renderBlockForm = () => {
    if (!state.selectedType) return null;

    const AIButton = (
      <Button
        variant="ghost"
        size="sm"
        className="h-6 text-xs text-muted-foreground"
        onClick={handleAISuggestion}
        disabled={isAILoading}
      >
        <Sparkles className="w-3 h-3 mr-1" />
        {isAILoading ? "Generating..." : "AI Suggestion"}
      </Button>
    );

    switch (state.selectedType) {
      case "richtext":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Content</Label>
                {AIButton}
              </div>
              <RichTextEditor
                content={state.richTextContent}
                onChange={(v) => setField("richTextContent", v)}
                placeholder="Start writing your rich text content..."
              />
            </div>
            <Button
              className="w-full"
              onClick={handleAddBlock}
              disabled={!state.richTextContent}
            >
              Add Rich Text
            </Button>
          </div>
        );

      case "text":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="text-content">Content</Label>
                {AIButton}
              </div>
              <Input
                id="text-content"
                placeholder="Enter your text..."
                value={state.textContent}
                onChange={(e) => setField("textContent", e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleAddBlock}
              disabled={!state.textContent}
            >
              Add Text
            </Button>
          </div>
        );

      case "link":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="link-title">Title</Label>
                {AIButton}
              </div>
              <Input
                id="link-title"
                placeholder="My Website"
                value={state.linkTitle}
                onChange={(e) => setField("linkTitle", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                placeholder="https://example.com"
                value={state.linkUrl}
                onChange={(e) => setField("linkUrl", e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleAddBlock}
              disabled={!state.linkTitle || !state.linkUrl}
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
                value={state.buttonText}
                onChange={(e) => setField("buttonText", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="button-url">URL</Label>
              <Input
                id="button-url"
                placeholder="https://example.com"
                value={state.buttonUrl}
                onChange={(e) => setField("buttonUrl", e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleAddBlock}
              disabled={!state.buttonText || !state.buttonUrl}
            >
              Add Button
            </Button>
          </div>
        );

      case "image":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Image Source</Label>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="picture">Upload Image</Label>
                <Input
                  id="picture"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setField("selectedImageFile", e.target.files[0]);
                      setField("imageUrl", "");
                    }
                  }}
                />
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                placeholder="https://example.com/image.jpg"
                value={state.imageUrl}
                onChange={(e) => {
                  setField("imageUrl", e.target.value);
                  setField("selectedImageFile", null);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-alt">Alt Text</Label>
              <Input
                id="image-alt"
                placeholder="Description of image"
                value={state.imageAlt}
                onChange={(e) => setField("imageAlt", e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleAddBlock}
              disabled={
                (!state.imageUrl && !state.selectedImageFile) ||
                !state.imageAlt ||
                uploading
              }
            >
              {uploading ? "Uploading..." : "Add Image"}
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
                value={state.videoUrl}
                onChange={(e) => setField("videoUrl", e.target.value)}
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
                value={state.videoTitle}
                onChange={(e) => setField("videoTitle", e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleAddBlock}
              disabled={!state.videoUrl}
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
                value={state.embedPlatform}
                onValueChange={(v) =>
                  setField(
                    "embedPlatform",
                    v as EmbedBlock["settings"]["platform"]
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
                value={state.embedUrl}
                onChange={(e) => setField("embedUrl", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="embed-custom">Custom Embed URL (optional)</Label>
              <Input
                id="embed-custom"
                placeholder="https://open.spotify.com/embed/track/..."
                value={state.embedCustomUrl}
                onChange={(e) => setField("embedCustomUrl", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use this if the default embed URL doesn&apos;t match what you
                need.
              </p>
            </div>
            <Button
              className="w-full"
              onClick={handleAddBlock}
              disabled={!state.embedUrl && !state.embedCustomUrl}
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
                value={state.socialLayout}
                onValueChange={(v) =>
                  setField(
                    "socialLayout",
                    v as SocialLinksBlock["settings"]["layout"]
                  )
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
              {state.socialLinks.map((link, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>Link {index + 1}</span>
                    {state.socialLinks.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          dispatch({ type: "REMOVE_SOCIAL_LINK", index })
                        }
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
                        dispatch({
                          type: "SET_SOCIAL_LINK",
                          index,
                          field: "platform",
                          value: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input
                      placeholder="https://instagram.com/username"
                      value={link.url}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_SOCIAL_LINK",
                          index,
                          field: "url",
                          value: e.target.value,
                        })
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
                        dispatch({
                          type: "SET_SOCIAL_LINK",
                          index,
                          field: "icon",
                          value: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: "ADD_SOCIAL_LINK" })}
              className="w-full"
            >
              Add Another Link
            </Button>
            <Button
              className="w-full"
              onClick={handleAddBlock}
              disabled={state.socialLinks.every((link) => !link.url)}
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
                value={state.calendarProvider}
                onValueChange={(v) =>
                  setField(
                    "calendarProvider",
                    v as CalendarBlock["settings"]["provider"]
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
                  state.calendarProvider === "cal"
                    ? "https://cal.com/username"
                    : "https://calendly.com/username"
                }
                value={state.calendarUrl}
                onChange={(e) => setField("calendarUrl", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calendar-title">Title (optional)</Label>
              <Input
                id="calendar-title"
                placeholder="Book a call"
                value={state.calendarTitle}
                onChange={(e) => setField("calendarTitle", e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleAddBlock}
              disabled={!state.calendarUrl}
            >
              Add Calendar
            </Button>
          </div>
        );

      case "form":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Submit Button Text</Label>
              <Input
                value={state.formSubmitText}
                onChange={(e) => setField("formSubmitText", e.target.value)}
                placeholder="Send"
              />
            </div>
            <div className="space-y-2">
              <Label>Submit URL (optional)</Label>
              <Input
                value={state.formSubmitUrl}
                onChange={(e) => setField("formSubmitUrl", e.target.value)}
                placeholder="https://example.com/forms"
              />
              <p className="text-xs text-muted-foreground">
                When provided, submissions will POST JSON to this endpoint.
              </p>
            </div>
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
              {state.formFields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>Field {index + 1}</span>
                    {state.formFields.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          dispatch({ type: "REMOVE_FORM_FIELD", index })
                        }
                        className="h-6 px-2 text-muted-foreground"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select
                      className="w-full rounded-md border px-2 py-1 text-sm"
                      value={field.type}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_FORM_FIELD",
                          index,
                          field: "type",
                          value: e.target.value,
                        })
                      }
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="textarea">Textarea</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Label</Label>
                    <Input
                      value={field.label}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_FORM_FIELD",
                          index,
                          field: "label",
                          value: e.target.value,
                        })
                      }
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Placeholder (optional)</Label>
                    <Input
                      value={field.placeholder || ""}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_FORM_FIELD",
                          index,
                          field: "placeholder",
                          value: e.target.value,
                        })
                      }
                      placeholder="Enter name..."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`form-required-${field.id}`}
                      checked={field.required}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_FORM_FIELD",
                          index,
                          field: "required",
                          value: e.target.checked,
                        })
                      }
                    />
                    <Label
                      htmlFor={`form-required-${field.id}`}
                      className="text-sm"
                    >
                      Required
                    </Label>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: "ADD_FORM_FIELD" })}
              className="w-full"
            >
              Add Field
            </Button>
            <Button className="w-full" onClick={handleAddBlock}>
              Add Form
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
              Add {state.selectedType === "divider" ? "Divider" : "Spacer"}
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
            {state.selectedType ? "Configure Block" : "Add Block"}
          </SheetTitle>
          <SheetDescription>
            {state.selectedType
              ? "Fill in the details for your block"
              : "Choose a block type to add to your board"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {!state.selectedType ? (
            <BlockTypeSelector
              onSelect={(type) =>
                dispatch({ type: "SET_SELECTED_TYPE", payload: type })
              }
            />
          ) : (
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  dispatch({ type: "SET_SELECTED_TYPE", payload: null })
                }
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
