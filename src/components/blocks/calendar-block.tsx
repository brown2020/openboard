"use client";

import { useMemo, useState } from "react";
import { CalendarBlock as CalendarBlockType } from "@/types";
import { useBoardStore } from "@/stores/board-store";
import { Calendar as CalendarIcon } from "lucide-react";
import { BlockControls } from "./block-controls";
import { BlockEditWrapper } from "./block-edit-wrapper";
import { InputField, SelectField } from "./form-fields";

type Provider = CalendarBlockType["settings"]["provider"];

interface CalendarBlockProps {
  block: CalendarBlockType;
  isEditing?: boolean;
  onClick?: () => void;
}

const PROVIDER_OPTIONS = [
  { value: "cal", label: "Cal.com" },
  { value: "calendly", label: "Calendly" },
];

const PROVIDER_LABEL: Record<Provider, string> = {
  cal: "Cal.com",
  calendly: "Calendly",
};

function normalizeCalendarUrl(url: string, provider: Provider): string {
  if (!url) return "";
  if (provider === "cal") {
    if (url.includes("/embed")) return url;
    return `${url}${url.endsWith("/") ? "" : "/"}embed`;
  }
  if (provider === "calendly") {
    if (url.includes("embed")) return url;
    const hostname =
      typeof window !== "undefined" ? window.location.hostname : "example.com";
    return `https://calendly.com/${url
      .replace("https://calendly.com/", "")
      .replace(/^\/+/, "")}?embed_domain=${hostname}&embed_type=Inline`;
  }
  return url;
}

export function CalendarBlock({
  block,
  isEditing = false,
  onClick,
}: CalendarBlockProps) {
  const { updateBlock } = useBoardStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const { provider, url, title } = block.settings;

  const [editProvider, setEditProvider] = useState<Provider>(provider);
  const [editUrl, setEditUrl] = useState(url);
  const [editTitle, setEditTitle] = useState(title || "");

  const embedUrl = useMemo(
    () => normalizeCalendarUrl(url, provider),
    [url, provider]
  );

  const handleSave = () => {
    updateBlock(block.id, {
      settings: {
        provider: editProvider,
        url: editUrl,
        title: editTitle || undefined,
      },
    });
    setIsEditMode(false);
  };

  const handleCancel = () => setIsEditMode(false);

  if (isEditMode && isEditing) {
    return (
      <BlockEditWrapper
        isEditMode={isEditMode}
        isEditing={isEditing}
        onSave={handleSave}
        onCancel={handleCancel}
        isValid={!!editUrl}
      >
        <SelectField
          label="Provider"
          value={editProvider}
          options={PROVIDER_OPTIONS}
          onChange={(v) => setEditProvider(v as Provider)}
          placeholder="Select provider"
        />
        <InputField
          label="Booking URL"
          value={editUrl}
          onChange={setEditUrl}
          placeholder={
            editProvider === "cal"
              ? "https://cal.com/username"
              : "https://calendly.com/username"
          }
        />
        <InputField
          label="Title (optional)"
          value={editTitle}
          onChange={setEditTitle}
          placeholder="Book a call"
        />
      </BlockEditWrapper>
    );
  }

  return (
    <div className="group relative" onClick={onClick}>
      {isEditing && (
        <BlockControls
          blockId={block.id}
          isVisible={block.visible}
          onEdit={() => setIsEditMode(true)}
        />
      )}

      <div className="border rounded-lg bg-card overflow-hidden">
        <div className="px-4 py-2 border-b flex items-center gap-2 text-sm font-medium">
          <CalendarIcon className="w-4 h-4 text-primary" />
          {title || PROVIDER_LABEL[provider]}
        </div>
        {embedUrl ? (
          <div className="min-h-[450px] bg-muted">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              loading="lazy"
              allow="fullscreen"
            />
          </div>
        ) : (
          <div className="p-6 text-sm text-muted-foreground text-center">
            Invalid calendar configuration. Edit this block to provide a valid
            booking URL.
          </div>
        )}
      </div>
    </div>
  );
}
