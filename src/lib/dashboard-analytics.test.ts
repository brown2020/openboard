import { describe, expect, it } from "vitest";
import {
  buildDashboardAnalyticsSummary,
  getTopClickedLinks,
  sumAnalyticsMetricsForDays,
} from "./dashboard-analytics";
import type { Board, BoardAnalytics } from "@/types";

const boards: Board[] = [
  {
    id: "board_1",
    ownerId: "user_1",
    ownerUsername: "ada",
    title: "Creator Links",
    slug: "creator",
    description: "",
    blocks: [
      {
        id: "link_1",
        type: "link",
        order: 0,
        visible: true,
        settings: { title: "YouTube", url: "https://youtube.com" },
      },
      {
        id: "btn_1",
        type: "button",
        order: 1,
        visible: true,
        settings: { text: "Subscribe", url: "https://example.com", style: "primary", size: "md" },
      },
    ],
    theme: {
      name: "Default",
      background: { type: "color", value: "#ffffff" },
      primaryColor: "#000000",
      textColor: "#000000",
      cardBackground: "#ffffff",
      borderRadius: "md",
      font: { heading: "system-ui", body: "system-ui" },
    },
    layout: "single-column",
    privacy: "public",
    collaborators: [],
    seo: {},
    analytics: { enabled: true, views: 0, uniqueVisitors: 0 },
    createdAt: {} as Board["createdAt"],
    updatedAt: {} as Board["updatedAt"],
  },
];

const analytics: BoardAnalytics[] = [
  {
    boardId: "board_1",
    date: "2026-05-20",
    views: 10,
    uniqueVisitors: 10,
    clicks: { link_1: 4, btn_1: 1 },
    referrers: {},
    devices: { mobile: 5, desktop: 5, tablet: 0 },
  },
  {
    boardId: "board_1",
    date: "2026-05-24",
    views: 6,
    uniqueVisitors: 6,
    clicks: { link_1: 2 },
    referrers: {},
    devices: { mobile: 3, desktop: 3, tablet: 0 },
  },
  {
    boardId: "board_1",
    date: "2026-04-01",
    views: 100,
    uniqueVisitors: 100,
    clicks: { link_1: 50 },
    referrers: {},
    devices: { mobile: 50, desktop: 50, tablet: 0 },
  },
];

describe("sumAnalyticsMetricsForDays", () => {
  it("totals views and clicks within the requested window", () => {
    expect(
      sumAnalyticsMetricsForDays(analytics, 7, new Date("2026-05-26"))
    ).toEqual({ views: 16, clicks: 7 });
  });
});

describe("getTopClickedLinks", () => {
  it("returns link and button blocks sorted by clicks", () => {
    expect(getTopClickedLinks(boards, analytics, 5, 30, new Date("2026-05-26"))).toEqual([
      {
        boardId: "board_1",
        boardTitle: "Creator Links",
        blockId: "link_1",
        label: "YouTube",
        clicks: 6,
      },
      {
        boardId: "board_1",
        boardTitle: "Creator Links",
        blockId: "btn_1",
        label: "Subscribe",
        clicks: 1,
      },
    ]);
  });
});

describe("buildDashboardAnalyticsSummary", () => {
  it("builds 7-day, 30-day, and top link summaries", () => {
    expect(buildDashboardAnalyticsSummary(boards, analytics, new Date("2026-05-26"))).toEqual({
      last7Days: { views: 16, clicks: 7 },
      last30Days: { views: 16, clicks: 7 },
      topLinks: [
        {
          boardId: "board_1",
          boardTitle: "Creator Links",
          blockId: "link_1",
          label: "YouTube",
          clicks: 6,
        },
        {
          boardId: "board_1",
          boardTitle: "Creator Links",
          blockId: "btn_1",
          label: "Subscribe",
          clicks: 1,
        },
      ],
    });
  });
});
