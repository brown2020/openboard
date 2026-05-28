import { describe, expect, it } from "vitest";
import {
  evaluateProxyRequest,
  isProtectedRoute,
  matchesRoutePrefix,
} from "@/lib/route-match";

describe("matchesRoutePrefix", () => {
  it("matches exact paths and nested segments", () => {
    expect(matchesRoutePrefix("/board/abc", "/board")).toBe(true);
    expect(matchesRoutePrefix("/board", "/board")).toBe(true);
  });

  it("does not match sibling prefixes", () => {
    expect(matchesRoutePrefix("/boards", "/board")).toBe(false);
    expect(matchesRoutePrefix("/boardroom", "/board")).toBe(false);
  });
});

describe("isProtectedRoute", () => {
  it("protects app routes", () => {
    expect(isProtectedRoute("/boards")).toBe(true);
    expect(isProtectedRoute("/board/123")).toBe(true);
    expect(isProtectedRoute("/dashboard")).toBe(true);
    expect(isProtectedRoute("/templates")).toBe(true);
  });

  it("leaves public routes open", () => {
    expect(isProtectedRoute("/")).toBe(false);
    expect(isProtectedRoute("/u/demo/test")).toBe(false);
    expect(isProtectedRoute("/login")).toBe(false);
  });
});

describe("evaluateProxyRequest", () => {
  const origin = "https://openboard.test";

  it("redirects unauthenticated users from protected routes to login", () => {
    const decision = evaluateProxyRequest({
      pathname: "/boards",
      search: "",
      origin,
      isAuthenticated: false,
      shouldClearAuthCookie: false,
    });

    expect(decision.action).toBe("redirect");
    if (decision.action === "redirect") {
      expect(decision.url).toContain("/login");
      expect(decision.url).toContain("redirect=%2Fboards");
    }
  });

  it("blocks unauthenticated AI API requests", () => {
    const decision = evaluateProxyRequest({
      pathname: "/api/ai/suggest",
      search: "",
      origin,
      isAuthenticated: false,
      shouldClearAuthCookie: false,
    });

    expect(decision).toEqual({
      action: "json",
      status: 401,
      body: { error: "Unauthorized" },
    });
  });

  it("blocks unauthenticated privacy API requests", () => {
    const decision = evaluateProxyRequest({
      pathname: "/api/boards/privacy",
      search: "",
      origin,
      isAuthenticated: false,
      shouldClearAuthCookie: false,
    });

    expect(decision.action).toBe("json");
    if (decision.action === "json") {
      expect(decision.status).toBe(401);
    }
  });

  it("allows public unlock API requests", () => {
    const decision = evaluateProxyRequest({
      pathname: "/api/boards/unlock",
      search: "",
      origin,
      isAuthenticated: false,
      shouldClearAuthCookie: false,
    });

    expect(decision.action).toBe("next");
  });

  it("redirects authenticated users away from auth routes", () => {
    const decision = evaluateProxyRequest({
      pathname: "/login",
      search: "",
      origin,
      isAuthenticated: true,
      shouldClearAuthCookie: false,
    });

    expect(decision).toEqual({
      action: "redirect",
      url: "https://openboard.test/boards",
    });
  });
});
