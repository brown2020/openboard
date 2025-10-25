"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useBoards } from "@/hooks/use-boards";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Plus, ExternalLink, Settings, Copy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function BoardsPage() {
  const { user, isLoaded } = useAuth();
  const { boards, createBoard } = useBoards();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardSlug, setNewBoardSlug] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/");
    }
  }, [user, isLoaded, router]);

  const handleCreateBoard = async () => {
    if (!newBoardTitle || !newBoardSlug) return;

    setIsCreating(true);
    const board = await createBoard(newBoardTitle, newBoardSlug);
    setIsCreating(false);

    if (board) {
      setSheetOpen(false);
      setNewBoardTitle("");
      setNewBoardSlug("");
      router.push(`/board/${board.id}`);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (title: string) => {
    setNewBoardTitle(title);
    if (!newBoardSlug || newBoardSlug === generateSlug(newBoardTitle)) {
      setNewBoardSlug(generateSlug(title));
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-[200px]" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[200px]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Boards</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your shareable boards
          </p>
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              New Board
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Create New Board</SheetTitle>
              <SheetDescription>
                Give your board a title and choose a unique URL slug
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="title">Board Title</Label>
                <Input
                  id="title"
                  placeholder="My Awesome Board"
                  value={newBoardTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    /{user.username}/
                  </span>
                  <Input
                    id="slug"
                    placeholder="my-board"
                    value={newBoardSlug}
                    onChange={(e) => setNewBoardSlug(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Your board will be accessible at: openboard.com/u/
                  {user.username}/{newBoardSlug || "my-board"}
                </p>
              </div>
              <Button
                className="w-full"
                onClick={handleCreateBoard}
                disabled={!newBoardTitle || !newBoardSlug || isCreating}
              >
                {isCreating ? "Creating..." : "Create Board"}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {boards.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold mb-2">No boards yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first board to get started
          </p>
          <Button
            onClick={() => setSheetOpen(true)}
            size="lg"
            className="gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Your First Board
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <div
              key={board.id}
              className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Preview */}
              <div
                className="h-32 p-4"
                style={{
                  background:
                    board.theme.background.type === "gradient"
                      ? board.theme.background.value
                      : board.theme.background.value,
                }}
              >
                <h3
                  className="font-bold text-lg"
                  style={{ color: board.theme.textColor }}
                >
                  {board.title}
                </h3>
                {board.description && (
                  <p
                    className="text-sm mt-1 line-clamp-2"
                    style={{ color: board.theme.textColor, opacity: 0.8 }}
                  >
                    {board.description}
                  </p>
                )}
              </div>

              {/* Info */}
              <div className="p-4 bg-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">
                    {board.blocks.length} blocks
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted">
                    {board.privacy}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button asChild className="flex-1" size="sm">
                    <Link href={`/board/${board.id}`}>
                      <Settings className="w-4 h-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={`/u/${board.ownerUsername}/${board.slug}`}
                      target="_blank"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/u/${board.ownerUsername}/${board.slug}`
                      );
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
