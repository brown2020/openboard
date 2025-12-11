"use client";

import { useEffect, useState } from "react";
import { useBoardStore } from "@/stores/board-store";
import { useModal } from "@/stores/ui-store";
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

export function ShareModal() {
  const { currentBoard } = useBoardStore();
  const { activeModal, closeModal } = useModal();
  const { updateBoard } = useBoards();
  const toast = useToast();

  const [privacy, setPrivacy] = useState<BoardPrivacy>("public");
  const [copied, setCopied] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [newCollaborator, setNewCollaborator] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isOpen = activeModal === "share";

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

  const embedCode = `<iframe src="${boardUrl}" width="100%" height="600" frameborder="0" style="border-radius: 12px; border: 1px solid #e5e5e5;"></iframe>`;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success("Copied!", `${type} copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  };

  const handlePrivacyChange = async (newPrivacy: BoardPrivacy) => {
    setIsSaving(true);
    setPrivacy(newPrivacy);
    await updateBoard(currentBoard.id, {
      privacy: newPrivacy,
      password: newPrivacy === "password" ? password || undefined : undefined,
    });
    setIsSaving(false);
    toast.success("Privacy updated", `Board is now ${newPrivacy}`);
  };

  const handlePasswordSave = async () => {
    if (privacy !== "password") return;
    setIsSaving(true);
    await updateBoard(currentBoard.id, { password: password || undefined });
    setIsSaving(false);
    toast.success("Password saved");
  };

  const handleAddCollaborator = async () => {
    const email = newCollaborator.trim().toLowerCase();
    if (!email || collaborators.includes(email)) {
      setNewCollaborator("");
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Invalid email", "Please enter a valid email address");
      return;
    }

    const next = [...collaborators, email];
    setCollaborators(next);
    setNewCollaborator("");
    await updateBoard(currentBoard.id, { collaborators: next });
    toast.success("Collaborator added", `${email} can now edit this board`);
  };

  const handleRemoveCollaborator = async (email: string) => {
    const next = collaborators.filter((c) => c !== email);
    setCollaborators(next);
    await updateBoard(currentBoard.id, { collaborators: next });
    toast.info("Collaborator removed");
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
                        Only with link
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
              <Button onClick={handleAddCollaborator}>Invite</Button>
            </div>

            {collaborators.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No collaborators yet. Add team members by email.
              </p>
            ) : (
              <div className="space-y-2 max-h-[150px] overflow-y-auto">
                {collaborators.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                        {email[0].toUpperCase()}
                      </div>
                      <span className="text-sm">{email}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRemoveCollaborator(email)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* QR Code */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              QR Code
            </Label>
            <div className="w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/30">
              <QrCode className="w-12 h-12 mb-2 opacity-30" />
              <p className="font-medium">QR Code</p>
              <p className="text-sm">Coming Soon</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
