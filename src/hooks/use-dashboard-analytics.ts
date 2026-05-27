"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAnalytics } from "@/hooks/use-analytics";
import {
  buildDashboardAnalyticsSummary,
  type DashboardAnalyticsSummary,
} from "@/lib/dashboard-analytics";
import type { Board } from "@/types";

interface UseDashboardAnalyticsResult {
  summary: DashboardAnalyticsSummary | null;
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

const EMPTY_SUMMARY: DashboardAnalyticsSummary = {
  last7Days: { views: 0, clicks: 0 },
  last30Days: { views: 0, clicks: 0 },
  topLinks: [],
};

export function useDashboardAnalytics(
  boards: Board[]
): UseDashboardAnalyticsResult {
  const { getAnalyticsForBoards } = useAnalytics();
  const [summary, setSummary] = useState<DashboardAnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const boardIds = useMemo(
    () => boards.map((board) => board.id).sort().join(","),
    [boards]
  );

  const reload = useCallback(async () => {
    if (boards.length === 0) {
      setSummary(EMPTY_SUMMARY);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const analytics = await getAnalyticsForBoards(
        boards.map((board) => board.id),
        30
      );
      setSummary(buildDashboardAnalyticsSummary(boards, analytics));
    } catch {
      setError("Unable to load analytics right now.");
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  }, [boards, getAnalyticsForBoards]);

  useEffect(() => {
    void reload();
  }, [boardIds, reload]);

  return {
    summary,
    isLoading,
    error,
    reload,
  };
}
