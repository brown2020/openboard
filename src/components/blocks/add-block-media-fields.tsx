"use client";

import { AddBlockAdvancedFields } from "./add-block-advanced-fields";
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
import type { Dispatch } from "react";
import type { FormAction, FormState } from "./add-block-form-state";
import type { EmbedBlock, SocialLinksBlock, CalendarBlock } from "@/types";

type Props = {
  state: FormState;
  dispatch: Dispatch<FormAction>;
  setField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
  handleAddBlock: () => void | Promise<void>;
  uploading: boolean;
};

export function AddBlockMediaFields({
  state,
  dispatch,
  setField,
  handleAddBlock,
  uploading,
}: Props) {
  switch (state.selectedType) {
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
      case "calendar":
      case "form":
        return (
          <AddBlockAdvancedFields
            state={state}
            dispatch={dispatch}
            setField={setField}
            handleAddBlock={handleAddBlock}
          />
        );

    default:
      return null;
  }
}
