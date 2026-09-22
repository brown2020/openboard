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

type Aspect = "square" | "portrait" | "landscape" | "auto";

type Props = {
  editUrl: string;
  setEditUrl: (v: string) => void;
  selectedFile: File | null;
  setSelectedFile: (f: File | null) => void;
  editAlt: string;
  setEditAlt: (v: string) => void;
  editCaption: string;
  setEditCaption: (v: string) => void;
  editLink: string;
  setEditLink: (v: string) => void;
  editAspectRatio: Aspect;
  setEditAspectRatio: (v: Aspect) => void;
  uploading: boolean;
  onSave: () => void;
  onCancel: () => void;
};

export function ImageBlockEditForm({
  editUrl,
  setEditUrl,
  selectedFile,
  setSelectedFile,
  editAlt,
  setEditAlt,
  editCaption,
  setEditCaption,
  editLink,
  setEditLink,
  editAspectRatio,
  setEditAspectRatio,
  uploading,
  onSave,
  onCancel,
}: Props) {
  return (
    <div className="p-4 border rounded-lg bg-card space-y-4">
      <div className="space-y-2">
        <Label>Image Source</Label>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="edit-picture">Upload New Image</Label>
          <Input
            id="edit-picture"
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setSelectedFile(e.target.files[0]);
                setEditUrl("");
              }
            }}
          />
        </div>
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>
        <Label>Image URL</Label>
        <Input
          value={editUrl}
          onChange={(e) => {
            setEditUrl(e.target.value);
            setSelectedFile(null);
          }}
          placeholder="https://example.com/image.jpg"
        />
      </div>
      <div className="space-y-2">
        <Label>Alt Text</Label>
        <Input
          value={editAlt}
          onChange={(e) => setEditAlt(e.target.value)}
          placeholder="Description of image"
        />
      </div>
      <div className="space-y-2">
        <Label>Caption (optional)</Label>
        <Input
          value={editCaption}
          onChange={(e) => setEditCaption(e.target.value)}
          placeholder="Add a caption"
        />
      </div>
      <div className="space-y-2">
        <Label>Link (optional)</Label>
        <Input
          value={editLink}
          onChange={(e) => setEditLink(e.target.value)}
          placeholder="https://example.com"
        />
      </div>
      <div className="space-y-2">
        <Label>Aspect Ratio</Label>
        <Select
          value={editAspectRatio}
          onValueChange={(v) => setEditAspectRatio(v as Aspect)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto</SelectItem>
            <SelectItem value="square">Square</SelectItem>
            <SelectItem value="portrait">Portrait</SelectItem>
            <SelectItem value="landscape">Landscape</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={onSave}
          disabled={(!editUrl && !selectedFile) || !editAlt || uploading}
        >
          {uploading ? "Uploading..." : "Save"}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
