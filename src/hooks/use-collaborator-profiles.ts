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

  const userIds = filterCollaboratorUserIds(collaboratorIds);
  const userIdsKey = userIds.join(",");

  useEffect(() => {
    if (userIds.length === 0) {
      setProfiles(new Map());
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    void fetchCollaboratorProfiles(userIds).then((next) => {
      if (!cancelled) {
        setProfiles(next);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [userIdsKey, userIds.length]);

  return { profiles, isLoading };
}
