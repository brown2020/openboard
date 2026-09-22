"use client";

import { useAuth } from "@/hooks/use-auth";
import { useBoards } from "@/hooks/use-boards";
import { useDashboardAnalytics } from "@/hooks/use-dashboard-analytics";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DashboardMetrics,
  EngagementPanel,
  TopLinksPanel,
  RecentBoardsPanel,
  DashboardErrorBanner,
} from "./dashboard-sections";

function DashboardSkeleton() {
  return (
    <div className="p-4 space-y-8">
      <Skeleton className="h-10 w-[220px]" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <Skeleton key={item} className="h-28 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-lg" />
      <Skeleton className="h-48 rounded-lg" />
    </div>
  );
}

export default function DashboardPage() {
  const { user, isLoaded } = useAuth();
  const { boards } = useBoards();
  const { summary, isLoading, error, reload } = useDashboardAnalytics(boards);

  if (!isLoaded || !user || isLoading) {
    return <DashboardSkeleton />;
  }

  const hasAnalyticsData =
    !!summary &&
    (summary.last30Days.views > 0 ||
      summary.last30Days.clicks > 0 ||
      summary.topLinks.length > 0);

  return (
    <div className="p-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Track views, clicks, and top-performing links across your boards.
        </p>
      </div>

      {error ? <DashboardErrorBanner error={error} reload={reload} /> : null}

      <DashboardMetrics boardCount={boards.length} summary={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EngagementPanel summary={summary} />
        <TopLinksPanel summary={summary} hasAnalyticsData={hasAnalyticsData} />
      </div>

      <RecentBoardsPanel boards={boards} username={user.username} />
    </div>
  );
}
