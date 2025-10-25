"use client";

import { useEffect, useState } from "react";
import { useBoardStore } from "@/stores/board-store";
import { useUIStore } from "@/stores/ui-store";
import { useAnalytics } from "@/hooks/use-analytics";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BoardAnalytics } from "@/types";
import { BarChart3, Eye, MousePointerClick, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsModal() {
  const { currentBoard } = useBoardStore();
  const { showAnalyticsModal, closeModal } = useUIStore();
  const { getAnalytics } = useAnalytics();
  const [analytics, setAnalytics] = useState<BoardAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (showAnalyticsModal && currentBoard) {
      loadAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAnalyticsModal, currentBoard]);

  const loadAnalytics = async () => {
    if (!currentBoard) return;

    setIsLoading(true);
    const data = await getAnalytics(currentBoard.id, 30);
    setAnalytics(data);
    setIsLoading(false);
  };

  if (!currentBoard) return null;

  const totalViews = analytics.reduce((sum, day) => sum + (day.views || 0), 0);
  const totalClicks = analytics.reduce((sum, day) => {
    return sum + Object.values(day.clicks || {}).reduce((a, b) => a + b, 0);
  }, 0);
  const avgViews =
    analytics.length > 0 ? Math.round(totalViews / analytics.length) : 0;

  return (
    <Sheet
      open={showAnalyticsModal}
      onOpenChange={() => closeModal("showAnalyticsModal")}
    >
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Board Analytics</SheetTitle>
          <SheetDescription>
            View insights and performance metrics for your board
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {isLoading ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  icon={<Eye className="w-5 h-5" />}
                  label="Total Views"
                  value={totalViews.toLocaleString()}
                  color="text-blue-500"
                />
                <StatCard
                  icon={<MousePointerClick className="w-5 h-5" />}
                  label="Total Clicks"
                  value={totalClicks.toLocaleString()}
                  color="text-green-500"
                />
                <StatCard
                  icon={<TrendingUp className="w-5 h-5" />}
                  label="Avg Daily Views"
                  value={avgViews.toLocaleString()}
                  color="text-purple-500"
                />
                <StatCard
                  icon={<BarChart3 className="w-5 h-5" />}
                  label="Click Rate"
                  value={
                    totalViews > 0
                      ? `${Math.round((totalClicks / totalViews) * 100)}%`
                      : "0%"
                  }
                  color="text-orange-500"
                />
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="font-semibold mb-4">Last 7 Days</h3>
                <div className="space-y-2">
                  {analytics.slice(0, 7).map((day) => (
                    <div
                      key={day.date}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <span className="text-sm font-medium">{day.date}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          {day.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MousePointerClick className="w-4 h-4 text-muted-foreground" />
                          {Object.values(day.clicks || {}).reduce(
                            (a, b) => a + b,
                            0
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Blocks */}
              {currentBoard.blocks.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4">Most Clicked Blocks</h3>
                  <div className="space-y-2">
                    {currentBoard.blocks.slice(0, 5).map((block) => {
                      const clicks = analytics.reduce((sum, day) => {
                        return sum + (day.clicks?.[block.id] || 0);
                      }, 0);

                      return (
                        <div
                          key={block.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <span className="text-sm font-medium truncate flex-1">
                            {block.type === "link"
                              ? block.settings.title
                              : `${block.type} block`}
                          </span>
                          <span className="text-sm text-muted-foreground ml-4">
                            {clicks} clicks
                          </span>
                        </div>
                      );
                    })}
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

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className={`mb-2 ${color}`}>{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
