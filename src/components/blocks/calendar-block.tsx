"use client";

import { useMemo, useState } from "react";
import { CalendarBlock as CalendarBlockType } from "@/types";
import { useBoardStore } from "@/stores/board-store";
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
import { Calendar as CalendarIcon } from "lucide-react";
import { BlockControls } from "./block-controls";

type Provider = CalendarBlockType["settings"]["provider"];

interface CalendarBlockProps {
  block: CalendarBlockType;
  isEditing?: boolean;
  onClick?: () => void;
}

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

  if (isEditMode && isEditing) {
    return (
      <div className="p-4 border rounded-lg bg-card space-y-4">
        <div className="space-y-2">
          <Label>Provider</Label>
          <Select
            value={editProvider}
            onValueChange={(value: Provider) => setEditProvider(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cal">Cal.com</SelectItem>
              <SelectItem value="calendly">Calendly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Booking URL</Label>
          <Input
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
            placeholder={
              editProvider === "cal"
                ? "https://cal.com/username"
                : "https://calendly.com/username"
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Title (optional)</Label>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Book a call"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!editUrl}>
            Save
          </Button>
          <Button variant="outline" onClick={() => setIsEditMode(false)}>
            Cancel
          </Button>
        </div>
      </div>
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
