"use client";

import { useEffect, useState } from "react";
import { fetchCollaboratorProfiles } from "@/lib/collaborators-client";
import { filterCollaboratorUserIds } from "@/lib/collaborators";
import type { UserProfile } from "@/types";

export function useCollaboratorProfiles(collaboratorIds: string[]) {
  const [profiles, setProfiles] = useState<Map<string, UserProfile>>(
    () => new Map()
  );
  const [isLoading, setIsLoading] = useState(false);

  const userIdsKey = filterCollaboratorUserIds(collaboratorIds).join(",");

  useEffect(() => {
    const userIds = userIdsKey ? userIdsKey.split(",") : [];
    let cancelled = false;

    if (userIds.length === 0) {
      setProfiles(new Map());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    void fetchCollaboratorProfiles(userIds)
      .then((next) => {
        if (!cancelled) {
          setProfiles(next);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userIdsKey]);

  return { profiles, isLoading };
}
