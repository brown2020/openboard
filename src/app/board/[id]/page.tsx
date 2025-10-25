"use client";

import { use, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useBoards } from "@/hooks/use-boards";
import { useBoardStore } from "@/stores/board-store";
import { useUIStore } from "@/stores/ui-store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// Mark this route as dynamic for Next.js 16
export const dynamic = "force-dynamic";
export const dynamicParams = true;
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Save,
  Eye,
  Plus,
  Palette,
  BarChart3,
  Share2,
  ArrowLeft,
} from "lucide-react";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { LinkBlock } from "@/types";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeModal } from "@/components/modals/theme-modal";
import { AnalyticsModal } from "@/components/modals/analytics-modal";
import { ShareModal } from "@/components/modals/share-modal";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BoardEditorPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { user, isLoaded } = useAuth();
  const { getBoard, updateBoard } = useBoards();
  const { currentBoard, setCurrentBoard, addBlock } = useBoardStore();
  const { setEditorMode, openModal } = useUIStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddBlock, setShowAddBlock] = useState(false);

  // Block creation state
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  useEffect(() => {
    setEditorMode(true);
    return () => setEditorMode(false);
  }, [setEditorMode]);

  useEffect(() => {
    const loadBoard = async () => {
      if (!isLoaded) return;
      if (!user) {
        router.push("/");
        return;
      }

      const board = await getBoard(resolvedParams.id);
      if (board) {
        if (board.ownerId !== user.id) {
          router.push("/boards");
          return;
        }
        setCurrentBoard(board);
      } else {
        router.push("/boards");
      }
      setIsLoading(false);
    };

    loadBoard();
  }, [resolvedParams.id, user, isLoaded, getBoard, setCurrentBoard, router]);

  const handleSave = async () => {
    if (!currentBoard) return;

    setIsSaving(true);
    await updateBoard(currentBoard.id, {
      blocks: currentBoard.blocks,
      title: currentBoard.title,
      description: currentBoard.description,
    });
    setIsSaving(false);
  };

  const handleAddLinkBlock = () => {
    if (!newLinkTitle || !newLinkUrl) return;

    const newBlock: LinkBlock = {
      id: `block_${Date.now()}`,
      type: "link",
      order: currentBoard?.blocks.length || 0,
      visible: true,
      settings: {
        url: newLinkUrl,
        title: newLinkTitle,
      },
    };

    addBlock(newBlock);
    setNewLinkTitle("");
    setNewLinkUrl("");
    setShowAddBlock(false);
  };

  if (isLoading || !currentBoard) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <>
      <ThemeModal />
      <AnalyticsModal />
      <ShareModal />

      <div className="min-h-screen bg-background">
        {/* Editor Toolbar */}
        <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/boards">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Link>
              </Button>
              <div>
                <h2 className="font-semibold">{currentBoard.title}</h2>
                <p className="text-xs text-muted-foreground">
                  /{user?.username}/{currentBoard.slug}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`/u/${currentBoard.ownerUsername}/${currentBoard.slug}`}
                  target="_blank"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openModal("showThemeModal")}
              >
                <Palette className="w-4 h-4 mr-2" />
                Theme
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openModal("showAnalyticsModal")}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openModal("showShareModal")}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>

        {/* Editor Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Board Preview */}
            <div
              className="rounded-lg p-8 min-h-[600px]"
              style={{
                background:
                  currentBoard.theme.background.type === "gradient"
                    ? currentBoard.theme.background.value
                    : currentBoard.theme.background.value,
              }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <h1
                  className="text-3xl font-bold mb-2"
                  style={{ color: currentBoard.theme.textColor }}
                >
                  {currentBoard.title}
                </h1>
                {currentBoard.description && (
                  <p
                    className="text-lg"
                    style={{
                      color: currentBoard.theme.textColor,
                      opacity: 0.8,
                    }}
                  >
                    {currentBoard.description}
                  </p>
                )}
              </div>

              {/* Blocks */}
              <div className="space-y-4">
                {currentBoard.blocks.map((block) => (
                  <div key={block.id} className="relative group">
                    <BlockRenderer block={block} isEditing={true} />
                  </div>
                ))}

                {/* Add Block Button */}
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={() => setShowAddBlock(true)}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Block
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Add Block Sheet */}
        <Sheet open={showAddBlock} onOpenChange={setShowAddBlock}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add Link Block</SheetTitle>
              <SheetDescription>Create a new clickable link</SheetDescription>
            </SheetHeader>
            <div className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="link-title">Title</Label>
                <Input
                  id="link-title"
                  placeholder="My Website"
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  placeholder="https://example.com"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleAddLinkBlock}
                disabled={!newLinkTitle || !newLinkUrl}
              >
                Add Link
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
