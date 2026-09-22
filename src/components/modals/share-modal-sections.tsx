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


type ShareModalSectionsProps = {
  privacy: any; handlePrivacyChange: any; password: any; setPassword: any; handlePasswordSave: any; isSaving: any; copied: any; handleCopy: any; boardUrl: any; embedCode: any; socialLinks: any; newCollaborator: any; setNewCollaborator: any; handleAddCollaborator: any; isInviting: any; collaboratorIds: any; getCollaboratorLabel: any; isLoadingProfiles: any; collaboratorProfiles: any; handleRemoveCollaborator: any; currentBoard: any; user: any;
};

export function ShareModalSections({
  privacy, handlePrivacyChange, password, setPassword, handlePasswordSave, isSaving, copied, handleCopy, boardUrl, embedCode, socialLinks, newCollaborator, setNewCollaborator, handleAddCollaborator, isInviting, collaboratorIds, getCollaboratorLabel, isLoadingProfiles, collaboratorProfiles, handleRemoveCollaborator, currentBoard, user
}: ShareModalSectionsProps) {
  return (
    <>
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
                aria-label={copied === "Link" ? "Link copied" : "Copy link"}
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
                aria-label="Embed code"
                value={embedCode}
                readOnly
                className="w-full h-24 px-3 py-2 text-sm border rounded-lg resize-none font-mono bg-muted"
              />
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                aria-label="Copy embed code"
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
                {collaboratorIds.map((userId: string) => {
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
    </>
  );
}
