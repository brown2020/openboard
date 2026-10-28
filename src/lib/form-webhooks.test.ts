import { describe, expect, it } from "vitest";
import {
  extractFormSubmitUrls,
  mergeFormSubmitUrls,
  stripFormSubmitUrls,
} from "./form-webhooks";
import type { FormBlock } from "@/types";

function form(id: string, submitUrl?: string): FormBlock {
  return {
    id,
    type: "form",
    order: 0,
    visible: true,
    settings: {
      fields: [],
      submitText: "Send",
      submitUrl,
    },
  };
}

describe("form webhook storage", () => {
  it("moves submit URLs out of the public block payload and merges them back", () => {
    const blocks = [form("form-1", "https://hooks.example.com/a")];
    expect(extractFormSubmitUrls(blocks)).toEqual({
      "form-1": "https://hooks.example.com/a",
    });
    const stripped = stripFormSubmitUrls(blocks);
    expect(stripped[0]?.type === "form" && stripped[0].settings.submitUrl).toBeUndefined();
    const merged = mergeFormSubmitUrls(stripped, {
      "form-1": "https://hooks.example.com/a",
    });
    expect(merged[0]?.type === "form" && merged[0].settings.submitUrl).toBe(
      "https://hooks.example.com/a"
    );
  });
});
