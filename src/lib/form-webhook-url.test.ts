import { describe, expect, it } from "vitest";
import { isAllowedWebhookUrl } from "./form-webhook-url";

describe("isAllowedWebhookUrl", () => {
  it("allows public https webhook URLs", () => {
    expect(isAllowedWebhookUrl("https://hooks.example.com/form")).toBe(true);
    expect(isAllowedWebhookUrl("http://example.com/webhook")).toBe(true);
  });

  it("blocks localhost, private IPs, and non-http protocols", () => {
    expect(isAllowedWebhookUrl("https://localhost/webhook")).toBe(false);
    expect(isAllowedWebhookUrl("https://127.0.0.1/webhook")).toBe(false);
    expect(isAllowedWebhookUrl("https://192.168.1.10/webhook")).toBe(false);
    expect(isAllowedWebhookUrl("ftp://example.com/webhook")).toBe(false);
    expect(isAllowedWebhookUrl("not-a-url")).toBe(false);
  });
});
