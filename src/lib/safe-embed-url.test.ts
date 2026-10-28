import { describe, expect, it } from "vitest";
import {
  EMBED_IFRAME_SANDBOX,
  sanitizeCustomEmbed,
  sanitizeProviderEmbed,
} from "./safe-embed-url";

describe("embed URLs", () => {
  it("allows known providers and rejects arbitrary or same-origin frames", () => {
    expect(
      sanitizeProviderEmbed("https://www.youtube.com/embed/abc", "youtube")
    ).toContain("youtube.com");
    expect(sanitizeProviderEmbed("https://evil.example/embed", "youtube")).toBe("");
    expect(sanitizeCustomEmbed("https://cdn.example.com/widget", "cdn.example.com")).toBe("");
    expect(sanitizeCustomEmbed("http://cdn.example.com/widget")).toBe("");
    expect(sanitizeCustomEmbed("https://127.0.0.1/widget")).toBe("");
    expect(EMBED_IFRAME_SANDBOX).not.toContain("allow-top-navigation");
    expect(EMBED_IFRAME_SANDBOX).not.toContain("allow-popups-to-escape-sandbox");
  });
});
