"use client";

import { useCallback } from "react";
import { BoardAnalytics } from "@/types";

async function readError(response: Response, fallback: string) {
  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? fallback;
}

export function useAnalytics() {
  const trackView = useCallback(async (boardId: string) => {
    try {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardId, event: "view" }),
      });
    } catch {
      // Analytics tracking is best-effort.
    }
  }, []);

  const trackClick = useCallback(async (boardId: string, blockId: string) => {
    try {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardId, blockId, event: "click" }),
      });
    } catch {
      // Click tracking is best-effort.
    }
  }, []);

  const getAnalytics = useCallback(
    async (boardId: string, days: number = 30): Promise<BoardAnalytics[]> => {
      const rows = await queryAnalytics([boardId], days);
      return rows;
    },
    []
  );

  const getAnalyticsForBoards = useCallback(
    async (boardIds: string[], days: number = 30): Promise<BoardAnalytics[]> => {
      return queryAnalytics(boardIds, days);
    },
    []
  );

  return {
    trackView,
    trackClick,
    getAnalytics,
    getAnalyticsForBoards,
  };
}

async function queryAnalytics(
  boardIds: string[],
  days: number
): Promise<BoardAnalytics[]> {
  if (boardIds.length === 0) return [];

  try {
    const response = await fetch("/api/analytics/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardIds, days }),
    });
    if (!response.ok) {
      throw new Error(await readError(response, "Failed to load analytics"));
    }
    const body = (await response.json()) as { analytics?: BoardAnalytics[] };
    return body.analytics ?? [];
  } catch {
    return [];
  }
}
