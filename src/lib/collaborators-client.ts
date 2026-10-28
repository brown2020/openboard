"use client";

import { normalizeCollaboratorEmail } from "@/lib/collaborators";
import type { UserProfile } from "@/types";

type PublicProfile = Pick<UserProfile, "id" | "username" | "displayName" | "avatar">;

export async function resolveUserIdByEmail(
  email: string
): Promise<string | null> {
  const normalized = normalizeCollaboratorEmail(email);
  const response = await fetch("/api/users/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: normalized }),
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error("Failed to look up collaborator");
  }

  const body = (await response.json()) as { id?: string };
  return body.id ?? null;
}

export async function fetchCollaboratorProfiles(
  userIds: string[]
): Promise<Map<string, UserProfile>> {
  const uniqueIds = [...new Set(userIds)].slice(0, 20);
  const profiles = new Map<string, UserProfile>();
  if (uniqueIds.length === 0) return profiles;

  const response = await fetch("/api/users/profiles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids: uniqueIds }),
  });
  if (!response.ok) return profiles;

  const body = (await response.json()) as { profiles?: PublicProfile[] };
  for (const profile of body.profiles ?? []) {
    profiles.set(profile.id, {
      id: profile.id,
      username: profile.username,
      email: "",
      displayName: profile.displayName,
      avatar: profile.avatar,
    } as UserProfile);
  }

  return profiles;
}
