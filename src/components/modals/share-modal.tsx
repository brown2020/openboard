"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useBoardStore } from "@/stores/board-store";
import { useModal } from "@/stores/ui-store";
import { useBoards } from "@/hooks/use-boards";
import { useAuth } from "@/hooks/use-auth";
import { useCollaboratorProfiles } from "@/hooks/use-collaborator-profiles";
import { resolveUserIdByEmail } from "@/lib/collaborators-client";
import {
  filterCollaboratorUserIds,
  isValidCollaboratorEmail,
} from "@/lib/collaborators";
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
import {
  Copy,
  Check,
  Globe,
  Lock,
  Eye,
  Key,
  UserPlus,
  X,
  Share2,
  Code,
  QrCode,
  ExternalLink,
  Twitter,
  Facebook,
  Linkedin,
} from "lucide-react";
import { BoardPrivacy } from "@/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/stores/ui-store";
import { BoardQrCode } from "@/components/modals/board-qr-code";

export function ShareModal() {
  const { currentBoard } = useBoardStore();
  const { activeModal, closeModal } = useModal();
  const { updateBoard } = useBoards();
  const { user } = useAuth();
  const toast = useToast();

  const [privacy, setPrivacy] = useState<BoardPrivacy>("public");
  const [copied, setCopied] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [newCollaborator, setNewCollaborator] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isOpen = activeModal === "share";
  const collaboratorIds = filterCollaboratorUserIds(collaborators);
  const { profiles: collaboratorProfiles, isLoading: isLoadingProfiles } =
    useCollaboratorProfiles(isOpen ? collaboratorIds : []);

  // Cleanup copy timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentBoard) {
      setPrivacy(currentBoard.privacy);
      setPassword("");
      setCollaborators(filterCollaboratorUserIds(currentBoard.collaborators || []));
    }
  }, [currentBoard]);

  const handleCopy = useCallback((text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success("Copied!", `${type} copied to clipboard`);

    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = setTimeout(() => setCopied(null), 2000);
  }, [toast]);

  if (!currentBoard) return null;

  const boardUrl = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/u/${currentBoard.ownerUsername}/${currentBoard.slug}`;

  const embedCode = `<iframe src="${boardUrl}" width="100%" height="600" frameborder="0" style="border-radius: 12px; border: 1px solid #e5e5e5;"></iframe>`;

  const handlePrivacyChange = async (newPrivacy: BoardPrivacy) => {
    if (!currentBoard) return;

    setIsSaving(true);
    setPrivacy(newPrivacy);

    try {
      if (newPrivacy === "password") {
        // Require explicit password save via the secure endpoint.
        toast.info("Set a password", "Enter a password below and click Save");
      } else {
        const res = await fetch("/api/boards/privacy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ boardId: currentBoard.id, privacy: newPrivacy }),
        });

        if (!res.ok) {
          const payload = (await res.json().catch(() => null)) as { error?: string } | null;
          toast.error("Save failed", payload?.error || "Failed to update privacy");
          setIsSaving(false);
          return;
        }

        await updateBoard(currentBoard.id, { privacy: newPrivacy });
        toast.success("Privacy updated", `Board is now ${newPrivacy}`);
      }
    } catch (error) {
      toast.error("Save failed", "An error occurred while updating privacy");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    if (privacy !== "password") return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/boards/privacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boardId: currentBoard.id,
          privacy: "password",
          password,
        }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        toast.error("Save failed", payload?.error || "Failed to save password");
        return;
      }
      await updateBoard(currentBoard.id, { privacy: "password" });
      toast.success("Password saved");
    } catch {
      toast.error("Save failed", "An error occurred while saving the password");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCollaborator = async () => {
    if (!currentBoard) return;

    const email = newCollaborator.trim();
    if (!email) return;

    if (!isValidCollaboratorEmail(email)) {
      toast.error("Invalid email", "Please enter a valid email address");
      return;
    }

    setIsInviting(true);
    try {
      const userId = await resolveUserIdByEmail(email);
      if (!userId) {
        toast.error(
          "User not found",
          "No OpenBoard account exists for that email address"
        );
        return;
      }

      if (userId === currentBoard.ownerId) {
        toast.error("Already has access", "The board owner can already edit this board");
        return;
      }

      if (userId === user?.id) {
        toast.error("Already has access", "You already own this board");
        return;
      }

      if (collaborators.includes(userId)) {
        toast.info("Already invited", "This collaborator already has access");
        setNewCollaborator("");
        return;
      }

      const next = [...collaborators, userId];
      const success = await updateBoard(currentBoard.id, { collaborators: next });
      if (!success) {
        toast.error("Invite failed", "Could not add collaborator. Please try again.");
        return;
      }

      setCollaborators(next);
      setNewCollaborator("");
      toast.success("Collaborator added", `${email} can now edit this board`);
    } catch {
      toast.error("Invite failed", "An error occurred while inviting the collaborator");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    if (!currentBoard) return;

    const next = collaborators.filter((id) => id !== userId);
    const success = await updateBoard(currentBoard.id, { collaborators: next });
    if (!success) {
      toast.error("Remove failed", "Could not remove collaborator. Please try again.");
      return;
    }

    setCollaborators(next);
    toast.info("Collaborator removed");
  };

  const getCollaboratorLabel = (userId: string) => {
    const profile = collaboratorProfiles.get(userId);
    if (profile?.email) return profile.email;
    if (profile?.displayName) return profile.displayName;
    return userId;
  };

  const handleClose = () => closeModal();

  // Social share URLs
  const socialLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      boardUrl
    )}&text=${encodeURIComponent(`Check out my board: ${currentBoard.title}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      boardUrl
    )}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      boardUrl
    )}`,
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Your Board
          </SheetTitle>
          <SheetDescription>
            Control access and share your board with others
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Privacy Settings */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Privacy Settings
            </Label>
            <Select
              value={privacy}
              onValueChange={handlePrivacyChange}
              disabled={isSaving}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-3 py-1">
                    <Globe className="w-4 h-4 text-emerald-500" />
                    <div className="text-left">
                      <p className="font-medium">Public</p>
                      <p className="text-xs text-muted-foreground">
                        Anyone can view
                      </p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="unlisted">
                  <div className="flex items-center gap-3 py-1">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <div className="text-left">
                      <p className="font-medium">Unlisted</p>
                      <p className="text-xs text-muted-foreground">
                        Direct link only, hidden from search
                      </p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="password">
                  <div className="flex items-center gap-3 py-1">
                    <Key className="w-4 h-4 text-amber-500" />
                    <div className="text-left">
                      <p className="font-medium">Password Protected</p>
                      <p className="text-xs text-muted-foreground">
                        Requires password
                      </p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-3 py-1">
                    <Lock className="w-4 h-4 text-red-500" />
                    <div className="text-left">
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

          {/* Password Field */}
          {privacy === "password" && (
            <div className="space-y-2 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Board Password
              </Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a password"
                  className="flex-1"
                />
                <Button onClick={handlePasswordSave} disabled={isSaving}>
                  Save
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Visitors must enter this password to view your board
              </p>
            </div>
          )}

          {/* Share Link */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Share Link
            </Label>
            <div className="flex gap-2">
              <Input
                value={boardUrl}
                readOnly
                className="flex-1 font-mono text-sm bg-muted"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(boardUrl, "Link")}
              >
                {copied === "Link" ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Quick Share Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </a>
            </Button>
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </a>
            </Button>
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </a>
            </Button>
          </div>

          {/* Embed Code */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Embed Code
            </Label>
            <div className="relative">
              <textarea
                value={embedCode}
                readOnly
                className="w-full h-24 px-3 py-2 text-sm border rounded-lg resize-none font-mono bg-muted"
              />
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(embedCode, "Embed code")}
              >
                {copied === "Embed code" ? (
                  <Check className="w-4 h-4 mr-2 text-emerald-500" />
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
            <Label className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Collaborators
            </Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="collaborator@email.com"
                value={newCollaborator}
                onChange={(e) => setNewCollaborator(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCollaborator()}
              />
              <Button onClick={handleAddCollaborator} disabled={isInviting}>
                {isInviting ? "Inviting..." : "Invite"}
              </Button>
            </div>

            {collaboratorIds.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No collaborators yet. Invite team members by their OpenBoard email.
              </p>
            ) : (
              <div className="space-y-2 max-h-[150px] overflow-y-auto">
                {collaboratorIds.map((userId) => {
                  const label = getCollaboratorLabel(userId);
                  return (
                  <div
                    key={userId}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 bg-muted/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium shrink-0">
                        {label[0]?.toUpperCase() ?? "?"}
                      </div>
                      <span className="text-sm truncate">
                        {isLoadingProfiles && !collaboratorProfiles.has(userId)
                          ? "Loading…"
                          : label}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => handleRemoveCollaborator(userId)}
                      aria-label={`Remove ${label}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* QR Code */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              QR Code
            </Label>
            <BoardQrCode url={boardUrl} boardSlug={currentBoard.slug} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
