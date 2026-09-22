"use client";

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
import { RichTextEditor } from "@/components/blocks/rich-text-editor";
import { Sparkles } from "lucide-react";
import type { Dispatch } from "react";
import type { FormAction, FormState } from "./add-block-form-state";
import { AddBlockMediaFields } from "./add-block-media-fields";
import type { EmbedBlock, SocialLinksBlock, CalendarBlock } from "@/types";

type Props = {
  state: FormState;
  dispatch: Dispatch<FormAction>;
  setField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
  handleAddBlock: () => void | Promise<void>;
  handleAISuggestion: () => void | Promise<void>;
  isAILoading: boolean;
  uploading: boolean;
};

export function AddBlockFormFields({
  state,
  dispatch,
  setField,
  handleAddBlock,
  handleAISuggestion,
  isAILoading,
  uploading,
}: Props) {
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
      case "video":
      case "embed":
      case "social-links":
      case "calendar":
      case "form":
        return (
          <AddBlockMediaFields
            state={state}
            dispatch={dispatch}
            setField={setField}
            handleAddBlock={handleAddBlock}
            uploading={uploading}
          />
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
}
