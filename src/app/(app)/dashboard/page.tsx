"use client";

import { useAuth } from "@/hooks/use-auth";
import { useBoards } from "@/hooks/use-boards";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user, isLoaded } = useAuth();
  const { boards } = useBoards();

  // Route protection is handled by proxy.ts - show skeleton while loading
  if (!isLoaded || !user) {
    return (
      <div className="p-4">
        <Skeleton className="h-12 w-[200px] mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Total Boards
          </h3>
          <p className="text-3xl font-bold">{boards.length}</p>
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Total Views
          </h3>
          <p className="text-3xl font-bold">
            {boards.reduce((sum, b) => sum + (b.analytics?.views || 0), 0)}
          </p>
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Unique Visitors
          </h3>
          <p className="text-3xl font-bold">
            {boards.reduce(
              (sum, b) => sum + (b.analytics?.uniqueVisitors || 0),
              0
            )}
          </p>
        </div>
      </div>

      {/* Recent Boards */}
      <div>
        <h2 className="text-xl font-bold mb-4">Recent Boards</h2>
        <div className="space-y-3">
          {boards.slice(0, 5).map((board) => (
            <div
              key={board.id}
              className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{board.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    /{user.username}/{board.slug}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {board.analytics?.views || 0} views
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {board.analytics?.uniqueVisitors || 0} visitors
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
