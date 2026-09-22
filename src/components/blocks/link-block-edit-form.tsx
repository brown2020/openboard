"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Settings = {
  title: string;
  url: string;
  description: string;
  icon: string;
};

type Props = {
  editSettings: Settings;
  updateField: <K extends keyof Settings>(field: K, value: Settings[K]) => void;
  handleSave: () => void;
  handleCancel: () => void;
  isValid: boolean;
  isSaving: boolean;
};

export function LinkBlockEditForm({
  editSettings,
  updateField,
  handleSave,
  handleCancel,
  isValid,
  isSaving,
}: Props) {
  return (
    <div className="p-4 border rounded-lg bg-card space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={editSettings.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="Link title"
        />
      </div>
      <div className="space-y-2">
        <Label>URL</Label>
        <Input
          value={editSettings.url}
          onChange={(e) => updateField("url", e.target.value)}
          placeholder="https://example.com"
        />
      </div>
      <div className="space-y-2">
        <Label>Description (optional)</Label>
        <Input
          value={editSettings.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Add a description"
        />
      </div>
      <div className="space-y-2">
        <Label>Icon (emoji, optional)</Label>
        <Input
          value={editSettings.icon}
          onChange={(e) => updateField("icon", e.target.value)}
          placeholder="🔗"
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={!isValid || isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
