import type { Block, Board, BoardAnalytics, LinkBlock } from "@/types";

export interface DashboardPeriodMetrics {
  views: number;
  clicks: number;
}

export interface DashboardTopLink {
  boardId: string;
  boardTitle: string;
  blockId: string;
  label: string;
  clicks: number;
}

export interface DashboardAnalyticsSummary {
  last7Days: DashboardPeriodMetrics;
  last30Days: DashboardPeriodMetrics;
  topLinks: DashboardTopLink[];
}

const LINK_BLOCK_TYPES = new Set(["link", "button"]);

export function getIsoDateDaysAgo(days: number, from: Date = new Date()): string {
  const date = new Date(from);
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0]!;
}

export function isAnalyticsDateWithinDays(
  date: string,
  days: number,
  from: Date = new Date()
): boolean {
  const startDate = getIsoDateDaysAgo(days, from);
  const endDate = from.toISOString().split("T")[0]!;
  return date >= startDate && date <= endDate;
}

export function sumAnalyticsMetrics(
  analytics: BoardAnalytics[]
): DashboardPeriodMetrics {
  return analytics.reduce(
    (totals, day) => {
      const dayClicks = Object.values(day.clicks ?? {}).reduce(
        (sum, count) => sum + count,
        0
      );

      return {
        views: totals.views + (day.views ?? 0),
        clicks: totals.clicks + dayClicks,
      };
    },
    { views: 0, clicks: 0 }
  );
}

export function sumAnalyticsMetricsForDays(
  analytics: BoardAnalytics[],
  days: number,
  from: Date = new Date()
): DashboardPeriodMetrics {
  const filtered = analytics.filter((day) =>
    isAnalyticsDateWithinDays(day.date, days, from)
  );
  return sumAnalyticsMetrics(filtered);
}

function getBlockLabel(block: Block): string {
  if (block.type === "link") {
    return (block as LinkBlock).settings.title || "Link";
  }
  if (block.type === "button" && "text" in block.settings) {
    return String(block.settings.text) || "Button";
  }
  return `${block.type} block`;
}

export function getTopClickedLinks(
  boards: Board[],
  analytics: BoardAnalytics[],
  limit: number = 5,
  days: number = 30,
  from: Date = new Date()
): DashboardTopLink[] {
  const boardsById = new Map(boards.map((board) => [board.id, board]));
  const clickTotals = new Map<string, number>();

  for (const day of analytics) {
    if (!isAnalyticsDateWithinDays(day.date, days, from)) continue;

    for (const [blockId, count] of Object.entries(day.clicks ?? {})) {
      const key = `${day.boardId}:${blockId}`;
      clickTotals.set(key, (clickTotals.get(key) ?? 0) + count);
    }
  }

  const topLinks: DashboardTopLink[] = [];

  for (const [key, clicks] of clickTotals.entries()) {
    const [boardId, blockId] = key.split(":");
    const board = boardsById.get(boardId);
    if (!board) continue;

    const block = board.blocks.find((item) => item.id === blockId);
    if (!block || !LINK_BLOCK_TYPES.has(block.type)) continue;

    topLinks.push({
      boardId,
      boardTitle: board.title,
      blockId,
      label: getBlockLabel(block),
      clicks,
    });
  }

  return topLinks.sort((a, b) => b.clicks - a.clicks).slice(0, limit);
}

export function buildDashboardAnalyticsSummary(
  boards: Board[],
  analytics: BoardAnalytics[],
  from: Date = new Date()
): DashboardAnalyticsSummary {
  return {
    last7Days: sumAnalyticsMetricsForDays(analytics, 7, from),
    last30Days: sumAnalyticsMetricsForDays(analytics, 30, from),
    topLinks: getTopClickedLinks(boards, analytics, 5, 30, from),
  };
}
