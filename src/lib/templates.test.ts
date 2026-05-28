import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BOARD_TEMPLATES } from "./templates";

describe("BOARD_TEMPLATES", () => {
  it("defines five templates with unique ids", () => {
    expect(BOARD_TEMPLATES).toHaveLength(5);

    const ids = BOARD_TEMPLATES.map((template) => template.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ships preview assets for every template thumbnail", () => {
    for (const template of BOARD_TEMPLATES) {
      expect(template.thumbnail).toMatch(/^\/templates\/[\w-]+\.svg$/);

      const assetPath = join(
        process.cwd(),
        "public",
        template.thumbnail.replace(/^\//, "")
      );
      expect(existsSync(assetPath)).toBe(true);
    }
  });
});
