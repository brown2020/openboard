"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/blocks/rich-text-editor";
import { Sparkles } from "lucide-react";
import type { FormState } from "./add-block-form-state";

type FieldProps = {
  state: FormState;
  setField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
  handleAddBlock: () => void | Promise<void>;
  handleAISuggestion: () => void | Promise<void>;
  isAILoading: boolean;
};

function AIButton({
  handleAISuggestion,
  isAILoading,
}: Pick<FieldProps, "handleAISuggestion" | "isAILoading">) {
  return (
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
}

export function RichTextAddFields(props: FieldProps) {
  const { state, setField, handleAddBlock } = props;
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Content</Label>
          <AIButton {...props} />
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
}

export function TextAddFields(props: FieldProps) {
  const { state, setField, handleAddBlock } = props;
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="text-content">Content</Label>
          <AIButton {...props} />
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
}

export function LinkAddFields(props: FieldProps) {
  const { state, setField, handleAddBlock } = props;
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="link-title">Title</Label>
          <AIButton {...props} />
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
}

export function ButtonAddFields(props: FieldProps) {
  const { state, setField, handleAddBlock } = props;
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
}

export function LayoutAddFields({
  selectedType,
  handleAddBlock,
}: {
  selectedType: "divider" | "spacer";
  handleAddBlock: () => void | Promise<void>;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        This block will be added with default settings. You can customize it
        after adding.
      </p>
      <Button className="w-full" onClick={handleAddBlock}>
        Add {selectedType === "divider" ? "Divider" : "Spacer"}
      </Button>
    </div>
  );
}
