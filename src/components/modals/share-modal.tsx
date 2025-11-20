"use client";

import { useEffect, useState } from "react";
import { useBoardStore } from "@/stores/board-store";
import { useUIStore } from "@/stores/ui-store";
import { useBoards } from "@/hooks/use-boards";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Check, Globe, Lock, Eye, Key, UserPlus, X } from "lucide-react";
import { BoardPrivacy } from "@/types";

export function ShareModal() {
  const { currentBoard } = useBoardStore();
  const { showShareModal, closeModal } = useUIStore();
  const { updateBoard } = useBoards();
  const [privacy, setPrivacy] = useState<BoardPrivacy>(
    currentBoard?.privacy || "public"
  );
  const [copied, setCopied] = useState(false);
  const [password, setPassword] = useState(currentBoard?.password || "");
  const [collaborators, setCollaborators] = useState<string[]>(
    currentBoard?.collaborators || []
  );
  const [newCollaborator, setNewCollaborator] = useState("");

  useEffect(() => {
    if (currentBoard) {
      setPrivacy(currentBoard.privacy);
      setPassword(currentBoard.password || "");
      setCollaborators(currentBoard.collaborators || []);
    }
  }, [currentBoard]);

  if (!currentBoard) return null;

  const boardUrl = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/u/${currentBoard.ownerUsername}/${currentBoard.slug}`;
  const embedCode = `<iframe src="${boardUrl}" width="100%" height="600" frameborder="0"></iframe>`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrivacyChange = async (newPrivacy: BoardPrivacy) => {
    setPrivacy(newPrivacy);
    await updateBoard(currentBoard.id, {
      privacy: newPrivacy,
      password: newPrivacy === "password" ? password || undefined : undefined,
    });
  };

  const handlePasswordBlur = async () => {
    if (privacy !== "password") return;
    await updateBoard(currentBoard.id, {
      password: password || undefined,
    });
  };

  const handleAddCollaborator = async () => {
    const value = newCollaborator.trim();
    if (!value) return;
    if (collaborators.includes(value)) {
      setNewCollaborator("");
      return;
    }
    const next = [...collaborators, value];
    setCollaborators(next);
    setNewCollaborator("");
    await updateBoard(currentBoard.id, { collaborators: next });
  };

  const handleRemoveCollaborator = async (value: string) => {
    const next = collaborators.filter((collab) => collab !== value);
    setCollaborators(next);
    await updateBoard(currentBoard.id, { collaborators: next });
  };

  return (
    <Sheet
      open={showShareModal}
      onOpenChange={() => closeModal("showShareModal")}
    >
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Share Your Board</SheetTitle>
          <SheetDescription>
            Choose who can see your board and share it with others
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Privacy Settings */}
          <div className="space-y-3">
            <Label>Privacy Settings</Label>
            <Select value={privacy} onValueChange={handlePrivacyChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <div>
                      <p className="font-medium">Public</p>
                      <p className="text-xs text-muted-foreground">
                        Anyone can view
                      </p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="unlisted">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <div>
                      <p className="font-medium">Unlisted</p>
                      <p className="text-xs text-muted-foreground">
                        Only people with link
                      </p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="password">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    <div>
                      <p className="font-medium">Password Protected</p>
                      <p className="text-xs text-muted-foreground">
                        Requires password
                      </p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    <div>
                      <p className="font-medium">Private</p>
                      <p className="text-xs text-muted-foreground">
                        Only you can view
                      </p>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Share URL */}
          <div className="space-y-2">
            <Label>Share Link</Label>
            <div className="flex gap-2">
              <Input value={boardUrl} readOnly className="flex-1" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(boardUrl)}
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this link with anyone to let them view your board
            </p>
          </div>

          {/* Embed Code */}
          <div className="space-y-2">
            <Label>Embed Code</Label>
            <div className="relative">
              <textarea
                value={embedCode}
                readOnly
                className="w-full h-24 px-3 py-2 text-sm border rounded-md resize-none font-mono"
              />
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(embedCode)}
              >
                {copied ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Embed this board on your website
            </p>
          </div>

          {/* Collaborators */}
          <div className="space-y-3">
            <Label>Collaborators</Label>
            <div className="flex gap-2">
              <Input
                placeholder="teammate@email.com"
                value={newCollaborator}
                onChange={(e) => setNewCollaborator(e.target.value)}
              />
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleAddCollaborator}
              >
                <UserPlus className="w-4 h-4" />
                Invite
              </Button>
            </div>
            {collaborators.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No collaborators yet. Add teammates by email.
              </p>
            ) : (
              <div className="space-y-2">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <span>{collaborator}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCollaborator(collaborator)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Password */}
          {privacy === "password" && (
            <div className="space-y-2">
              <Label>Board Password</Label>
              <Input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={handlePasswordBlur}
                placeholder="Enter a password"
              />
              <p className="text-xs text-muted-foreground">
                Viewers must enter this password before accessing your board.
              </p>
            </div>
          )}

          {/* QR Code placeholder */}
          <div className="space-y-2">
            <Label>QR Code</Label>
            <div className="w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
              QR Code Coming Soon
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
