import { describe, expect, it } from "vitest";
import { sanitizeHtml } from "./sanitize";

describe("sanitizeHtml", () => {
  it("keeps color and alignment and drops other inline styles", () => {
    const html = sanitizeHtml(
      '<p style="color: #ff0000; text-align: center; background: url(javascript:alert(1))">Hi</p>'
    );
    expect(html).toContain("color: #ff0000");
    expect(html).toContain("text-align: center");
    expect(html).not.toContain("background");
    expect(html).not.toContain("javascript");
  });
});
