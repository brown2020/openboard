"use client";

import { useEffect, useState, useMemo } from "react";
import { useBoardStore } from "@/stores/board-store";
import { useModal } from "@/stores/ui-store";
import { useAnalytics } from "@/hooks/use-analytics";
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
import { BoardAnalytics } from "@/types";
import {
  BarChart3,
  Eye,
  MousePointerClick,
  TrendingUp,
  Smartphone,
  Monitor,
  Tablet,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type TimeRange = "7" | "14" | "30" | "90";

export function AnalyticsModal() {
  const { currentBoard } = useBoardStore();
  const { activeModal, closeModal } = useModal();
  const { getAnalytics } = useAnalytics();
  const [analytics, setAnalytics] = useState<BoardAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("30");

  const isOpen = activeModal === "analytics";

  useEffect(() => {
    if (isOpen && currentBoard) {
      loadAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentBoard, timeRange]);

  const loadAnalytics = async () => {
    if (!currentBoard) return;

    setIsLoading(true);
    const data = await getAnalytics(currentBoard.id, parseInt(timeRange));
    setAnalytics(data);
    setIsLoading(false);
  };

  // Computed stats
  const stats = useMemo(() => {
    const totalViews = analytics.reduce((sum, day) => sum + (day.views || 0), 0);
    const totalClicks = analytics.reduce((sum, day) => {
      return sum + Object.values(day.clicks || {}).reduce((a, b) => a + b, 0);
    }, 0);
    const avgViews = analytics.length > 0 ? Math.round(totalViews / analytics.length) : 0;
    const clickRate = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;

    // Calculate trend (compare last 7 days to previous 7)
    const midpoint = Math.floor(analytics.length / 2);
    const recentViews = analytics.slice(0, midpoint).reduce((sum, d) => sum + (d.views || 0), 0);
    const previousViews = analytics.slice(midpoint).reduce((sum, d) => sum + (d.views || 0), 0);
    const trend = previousViews > 0 ? Math.round(((recentViews - previousViews) / previousViews) * 100) : 0;

    // Device breakdown
    const devices = analytics.reduce(
      (acc, day) => {
        if (day.devices) {
          acc.mobile += day.devices.mobile || 0;
          acc.desktop += day.devices.desktop || 0;
          acc.tablet += day.devices.tablet || 0;
        }
        return acc;
      },
      { mobile: 0, desktop: 0, tablet: 0 }
    );

    const totalDevices = devices.mobile + devices.desktop + devices.tablet;

    return {
      totalViews,
      totalClicks,
      avgViews,
      clickRate,
      trend,
      devices,
      totalDevices,
    };
  }, [analytics]);

  if (!currentBoard) return null;

  const handleClose = () => closeModal();

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Board Analytics
          </SheetTitle>
          <SheetDescription>
            View insights and performance metrics for your board
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Time Range Selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Time Range</span>
            </div>
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-[200px] rounded-xl" />
            </div>
          ) : (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  icon={<Eye className="w-5 h-5" />}
                  label="Total Views"
                  value={stats.totalViews.toLocaleString()}
                  trend={stats.trend}
                  color="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                />
                <StatCard
                  icon={<MousePointerClick className="w-5 h-5" />}
                  label="Total Clicks"
                  value={stats.totalClicks.toLocaleString()}
                  color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                />
                <StatCard
                  icon={<TrendingUp className="w-5 h-5" />}
                  label="Avg Daily Views"
                  value={stats.avgViews.toLocaleString()}
                  color="bg-purple-500/10 text-purple-600 dark:text-purple-400"
                />
                <StatCard
                  icon={<BarChart3 className="w-5 h-5" />}
                  label="Click Rate"
                  value={`${stats.clickRate}%`}
                  color="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                />
              </div>

              {/* Device Breakdown */}
              {stats.totalDevices > 0 && (
                <div className="p-4 rounded-xl border bg-card">
                  <h4 className="font-semibold mb-4">Device Breakdown</h4>
                  <div className="flex gap-4">
                    <DeviceStat
                      icon={<Monitor className="w-5 h-5" />}
                      label="Desktop"
                      count={stats.devices.desktop}
                      total={stats.totalDevices}
                    />
                    <DeviceStat
                      icon={<Smartphone className="w-5 h-5" />}
                      label="Mobile"
                      count={stats.devices.mobile}
                      total={stats.totalDevices}
                    />
                    <DeviceStat
                      icon={<Tablet className="w-5 h-5" />}
                      label="Tablet"
                      count={stats.devices.tablet}
                      total={stats.totalDevices}
                    />
                  </div>
                </div>
              )}

              {/* Daily Activity */}
              <div>
                <h4 className="font-semibold mb-4">Daily Activity</h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {analytics.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p>No analytics data yet</p>
                      <p className="text-sm">Share your board to start collecting data</p>
                    </div>
                  ) : (
                    analytics.map((day) => {
                      const dayClicks = Object.values(day.clicks || {}).reduce(
                        (a, b) => a + b,
                        0
                      );
                      return (
                        <div
                          key={day.date}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <span className="text-sm font-medium">
                            {formatDate(day.date)}
                          </span>
                          <div className="flex items-center gap-6 text-sm">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <Eye className="w-4 h-4" />
                              <span className="font-medium text-foreground">
                                {day.views || 0}
                              </span>
                            </span>
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <MousePointerClick className="w-4 h-4" />
                              <span className="font-medium text-foreground">
                                {dayClicks}
                              </span>
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Top Blocks */}
              {currentBoard.blocks.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-4">Most Clicked Blocks</h4>
                  <div className="space-y-2">
                    {currentBoard.blocks
                      .map((block) => ({
                        block,
                        clicks: analytics.reduce(
                          (sum, day) => sum + (day.clicks?.[block.id] || 0),
                          0
                        ),
                      }))
                      .sort((a, b) => b.clicks - a.clicks)
                      .slice(0, 5)
                      .map(({ block, clicks }) => (
                        <div
                          key={block.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                              <MousePointerClick className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium truncate max-w-[200px]">
                              {block.type === "link"
                                ? block.settings.title
                                : block.type === "button"
                                  ? block.settings.text
                                  : `${block.type} block`}
                            </span>
                          </div>
                          <span className="text-sm font-semibold">
                            {clicks} clicks
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Stat Card Component
 */
function StatCard({
  icon,
  label,
  value,
  trend,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: number;
  color: string;
}) {
  return (
    <div className="p-4 rounded-xl border bg-card">
      <div className={cn("inline-flex p-2 rounded-lg mb-3", color)}>{icon}</div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
        {trend !== undefined && trend !== 0 && (
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-medium",
              trend > 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {trend > 0 ? (
              <ArrowUp className="w-4 h-4" />
            ) : trend < 0 ? (
              <ArrowDown className="w-4 h-4" />
            ) : (
              <Minus className="w-4 h-4" />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Device Stat Component
 */
function DeviceStat({
  icon,
  label,
  count,
  total,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  total: number;
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {count.toLocaleString()} ({percentage}%)
      </p>
    </div>
  );
}

/**
 * Format date for display
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === today.toISOString().split("T")[0]) {
    return "Today";
  }
  if (dateStr === yesterday.toISOString().split("T")[0]) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
