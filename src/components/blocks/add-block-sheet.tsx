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
import { useBoardStore } from "@/stores/board-store";
import {
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
import { useAI } from "@/hooks/use-ai";
import { BlockTypeSelector } from "./block-type-selector";
import { AddBlockFormFields } from "./add-block-form-fields";
import {
  formReducer,
  initialState,
  generateBlockId,
  detectVideoPlatform,
  detectEmbedPlatform,
  type FormState,
} from "./add-block-form-state";

interface AddBlockSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
              <AddBlockFormFields
                state={state}
                dispatch={dispatch}
                setField={setField}
                handleAddBlock={handleAddBlock}
                handleAISuggestion={handleAISuggestion}
                isAILoading={isAILoading}
                uploading={uploading}
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
