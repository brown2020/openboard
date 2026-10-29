import { describe, expect, it } from "vitest";
import { sanitizeRedirectPath } from "@/lib/safe-redirect";

describe("sanitizeRedirectPath", () => {
  it("returns fallback for missing or unsafe values", () => {
    expect(sanitizeRedirectPath(null)).toBe("/boards");
    expect(sanitizeRedirectPath("//evil.com")).toBe("/boards");
    expect(sanitizeRedirectPath("https://evil.com")).toBe("/boards");
    expect(sanitizeRedirectPath("/\\evil.com")).toBe("/boards");
    expect(sanitizeRedirectPath("/login")).toBe("/boards");
  });

  it("allows protected app destinations", () => {
    expect(sanitizeRedirectPath("/boards")).toBe("/boards");
    expect(sanitizeRedirectPath("/board/abc123")).toBe("/board/abc123");
    expect(sanitizeRedirectPath("/dashboard")).toBe("/dashboard");
    expect(sanitizeRedirectPath("/templates")).toBe("/templates");
    expect(sanitizeRedirectPath("/settings")).toBe("/settings");
    expect(sanitizeRedirectPath("/profile")).toBe("/profile");
  });

  it("preserves query strings on allowed paths", () => {
    expect(sanitizeRedirectPath("/boards?tab=recent")).toBe("/boards?tab=recent");
  });
});
