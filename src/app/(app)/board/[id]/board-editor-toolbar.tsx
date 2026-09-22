"use client";

import type { ModalType } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Save,
  Eye,
  Palette,
  BarChart3,
  Share2,
  ArrowLeft,
  Undo2,
  Redo2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  boardTitle: string;
  username?: string;
  slug: string;
  ownerUsername: string;
  saveStatus: string;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  openModal: (name: ModalType) => void;
  handleSave: () => void;
  isAutoSaving: boolean;
  isSaving: boolean;
};

export function BoardEditorToolbar({
  boardTitle,
  username,
  slug,
  ownerUsername,
  saveStatus,
  canUndo,
  canRedo,
  undo,
  redo,
  openModal,
  handleSave,
  isAutoSaving,
  isSaving,
}: Props) {
  return (
    <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/boards">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h2 className="font-semibold text-sm">{boardTitle}</h2>
            <p className="text-xs text-muted-foreground">
              /{username}/{slug}
            </p>
          </div>
          {saveStatus === "pending" ? (
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              • Unsaved changes
            </span>
          ) : null}
          {saveStatus === "saving" ? (
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
              Saving…
            </span>
          ) : null}
          {saveStatus === "error" ? (
            <span className="text-xs text-destructive font-medium">
              • Save failed — retry with Save or ⌘S
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (⌘Z)"
              aria-label="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (⌘⇧Z)"
              aria-label="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/u/${ownerUsername}/${slug}`} target="_blank">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => openModal("theme")}>
            <Palette className="w-4 h-4 mr-2" />
            Theme
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openModal("analytics")}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button variant="outline" size="sm" onClick={() => openModal("share")}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isAutoSaving || isSaving}
            className={cn(
              (saveStatus === "pending" || saveStatus === "error") &&
                "bg-emerald-600 hover:bg-emerald-700"
            )}
          >
            {isAutoSaving || isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isAutoSaving || isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
