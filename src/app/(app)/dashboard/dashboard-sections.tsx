"use client";

import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Eye,
  Link2,
  MousePointerClick,
  TrendingUp,
} from "lucide-react";
import type { Board } from "@/types";
import type { DashboardAnalyticsSummary } from "@/lib/dashboard-analytics";

export function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

export function DashboardMetrics({
  boardCount,
  summary,
}: {
  boardCount: number;
  summary: DashboardAnalyticsSummary | null;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <MetricCard
        label="Boards"
        value={boardCount.toLocaleString()}
        icon={<BarChart3 className="w-4 h-4" aria-hidden="true" />}
      />
      <MetricCard
        label="Views (7 days)"
        value={(summary?.last7Days.views ?? 0).toLocaleString()}
        icon={<Eye className="w-4 h-4" aria-hidden="true" />}
      />
      <MetricCard
        label="Clicks (7 days)"
        value={(summary?.last7Days.clicks ?? 0).toLocaleString()}
        icon={<MousePointerClick className="w-4 h-4" aria-hidden="true" />}
      />
      <MetricCard
        label="Views (30 days)"
        value={(summary?.last30Days.views ?? 0).toLocaleString()}
        icon={<TrendingUp className="w-4 h-4" aria-hidden="true" />}
      />
    </div>
  );
}

export function EngagementPanel({
  summary,
}: {
  summary: DashboardAnalyticsSummary | null;
}) {
  return (
    <section className="border rounded-lg bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <MousePointerClick className="w-5 h-5 text-primary" aria-hidden="true" />
        <h2 className="text-xl font-bold">30-Day Engagement</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-muted/40 p-4">
          <p className="text-sm text-muted-foreground mb-1">Total views</p>
          <p className="text-2xl font-bold">
            {(summary?.last30Days.views ?? 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-muted/40 p-4">
          <p className="text-sm text-muted-foreground mb-1">Total clicks</p>
          <p className="text-2xl font-bold">
            {(summary?.last30Days.clicks ?? 0).toLocaleString()}
          </p>
        </div>
      </div>
    </section>
  );
}

export function TopLinksPanel({
  summary,
  hasAnalyticsData,
}: {
  summary: DashboardAnalyticsSummary | null;
  hasAnalyticsData: boolean;
}) {
  return (
    <section className="border rounded-lg bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Link2 className="w-5 h-5 text-primary" aria-hidden="true" />
        <h2 className="text-xl font-bold">Top Links (30 days)</h2>
      </div>

      {!hasAnalyticsData || !summary?.topLinks.length ? (
        <div className="text-center py-10 text-muted-foreground">
          <BarChart3
            className="w-12 h-12 mx-auto mb-3 opacity-20"
            aria-hidden="true"
          />
          <p className="font-medium">No link clicks yet</p>
          <p className="text-sm mt-1">
            Share your boards to start collecting analytics.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {summary.topLinks.map((link) => {
            const maxClicks = summary.topLinks[0]?.clicks ?? 1;
            const width = Math.max(8, Math.round((link.clicks / maxClicks) * 100));
            return (
              <div key={`${link.boardId}:${link.blockId}`} className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{link.label}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {link.boardTitle}
                    </p>
                  </div>
                  <p className="text-sm font-semibold shrink-0">
                    {link.clicks.toLocaleString()} clicks
                  </p>
                </div>
                <div
                  className="h-2 rounded-full bg-muted overflow-hidden"
                  aria-hidden="true"
                >
                  <div
                    className="h-full rounded-full bg-primary transition-[width]"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function RecentBoardsPanel({
  boards,
  username,
}: {
  boards: Board[];
  username: string;
}) {
  return (
    <section>
      <h2 className="text-xl font-bold mb-4">Recent Boards</h2>
      {boards.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-card text-muted-foreground">
          <p className="font-medium">No boards yet</p>
          <p className="text-sm mt-1">
            Create your first board to see it listed here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {boards.slice(0, 5).map((board) => (
            <div
              key={board.id}
              className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{board.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    /{username}/{board.slug}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm text-muted-foreground">
                    {board.analytics?.views || 0} lifetime views
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function DashboardErrorBanner({
  error,
  reload,
}: {
  error: string;
  reload: () => void | Promise<void>;
}) {
  return (
    <div
      className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      role="alert"
    >
      <p className="text-sm text-destructive">{error}</p>
      <Button type="button" variant="outline" size="sm" onClick={() => void reload()}>
        Try again
      </Button>
    </div>
  );
}

