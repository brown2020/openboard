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

import { ShareModalSections } from "./share-modal-sections";

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
          <ShareModalSections
            privacy={privacy}
            handlePrivacyChange={handlePrivacyChange}
            password={password}
            setPassword={setPassword}
            handlePasswordSave={handlePasswordSave}
            isSaving={isSaving}
            copied={copied}
            handleCopy={handleCopy}
            boardUrl={boardUrl}
            embedCode={embedCode}
            socialLinks={socialLinks}
            newCollaborator={newCollaborator}
            setNewCollaborator={setNewCollaborator}
            handleAddCollaborator={handleAddCollaborator}
            isInviting={isInviting}
            collaboratorIds={collaboratorIds}
            getCollaboratorLabel={getCollaboratorLabel}
            isLoadingProfiles={isLoadingProfiles}
            collaboratorProfiles={collaboratorProfiles}
            handleRemoveCollaborator={handleRemoveCollaborator}
            currentBoard={currentBoard}
            user={user}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
