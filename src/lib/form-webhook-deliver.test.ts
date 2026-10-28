import { describe, expect, it } from "vitest";
import { isAllowedWebhookUrl } from "./form-webhook-url";
import {
  deliverFormWebhook,
  isAllowedWebhookDestination,
} from "./form-webhook-deliver";

describe("isAllowedWebhookUrl", () => {
  it("allows public https webhook URLs", () => {
    expect(isAllowedWebhookUrl("https://hooks.example.com/form")).toBe(true);
    expect(isAllowedWebhookUrl("http://example.com/webhook")).toBe(true);
  });

  it("blocks localhost, private IPs, alternate encodings, and metadata hosts", () => {
    expect(isAllowedWebhookUrl("https://localhost/webhook")).toBe(false);
    expect(isAllowedWebhookUrl("http://localhost./hook")).toBe(false);
    expect(isAllowedWebhookUrl("https://127.0.0.1/webhook")).toBe(false);
    expect(isAllowedWebhookUrl("http://2130706433/")).toBe(false);
    expect(isAllowedWebhookUrl("http://0x7f000001/")).toBe(false);
    expect(isAllowedWebhookUrl("http://[::ffff:127.0.0.1]/")).toBe(false);
    expect(isAllowedWebhookUrl("http://[::ffff:169.254.169.254]/")).toBe(false);
    expect(isAllowedWebhookUrl("http://[fc00::1]/")).toBe(false);
    expect(isAllowedWebhookUrl("http://[fe80::1]/")).toBe(false);
    expect(isAllowedWebhookUrl("http://127.0.0.1.nip.io/hook")).toBe(false);
    expect(
      isAllowedWebhookUrl("http://metadata.google.internal/computeMetadata/v1/")
    ).toBe(false);
    expect(isAllowedWebhookUrl("https://192.168.1.10/webhook")).toBe(false);
    expect(isAllowedWebhookUrl("https://hooks.example.com:8443/hook")).toBe(false);
    expect(isAllowedWebhookUrl("ftp://example.com/webhook")).toBe(false);
    expect(isAllowedWebhookUrl("not-a-url")).toBe(false);
  });
});

describe("isAllowedWebhookDestination", () => {
  it("rejects hostnames that resolve to private addresses", async () => {
    await expect(
      isAllowedWebhookDestination("https://hooks.example.com/form", async () => [
        "127.0.0.1",
      ])
    ).resolves.toBe(false);

    await expect(
      isAllowedWebhookDestination("https://hooks.example.com/form", async () => [
        "1.1.1.1",
      ])
    ).resolves.toBe(true);
  });
});

describe("deliverFormWebhook", () => {
  it("does not follow a redirect to a private address", async () => {
    const fetchImpl = async () =>
      new Response(null, {
        status: 302,
        headers: { location: "http://127.0.0.1/latest/meta-data" },
      });

    const result = await deliverFormWebhook({
      url: "https://hooks.example.com/form",
      body: "{}",
      lookup: async () => ["1.1.1.1"],
      fetchImpl,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(400);
  });

  it("posts only when the destination stays public", async () => {
    const seen: string[] = [];
    const fetchImpl = async (url: string | URL | Request) => {
      seen.push(String(url));
      return new Response("ok", { status: 200 });
    };

    const result = await deliverFormWebhook({
      url: "https://hooks.example.com/form",
      body: "{}",
      lookup: async () => ["1.1.1.1"],
      fetchImpl,
    });

    expect(result).toEqual({ ok: true });
    expect(seen).toEqual(["https://hooks.example.com/form"]);
  });
});
