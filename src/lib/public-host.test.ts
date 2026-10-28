import { describe, expect, it } from "vitest";
import {
  isBlockedEmbedHost,
  isBlockedHostname,
  isBlockedIp,
  isNonGlobalIpv4,
} from "./public-host";

describe("public host checks", () => {
  it("blocks loopback, link-local, and metadata names", () => {
    expect(isBlockedHostname("localhost.")).toBe(true);
    expect(isBlockedHostname("metadata.google.internal")).toBe(true);
    expect(isBlockedHostname("foo.nip.io")).toBe(true);
    expect(isBlockedHostname("hooks.example.com")).toBe(false);
  });

  it("blocks private and mapped addresses", () => {
    expect(isNonGlobalIpv4("10.1.2.3")).toBe(true);
    expect(isNonGlobalIpv4("169.254.169.254")).toBe(true);
    expect(isNonGlobalIpv4("8.8.8.8")).toBe(false);
    expect(isBlockedIp("::ffff:7f00:1")).toBe(true);
    expect(isBlockedIp("::ffff:a9fe:a9fe")).toBe(true);
    expect(isBlockedIp("fc00::1")).toBe(true);
    expect(isBlockedIp("fe80::1")).toBe(true);
    expect(isBlockedIp("2606:4700:4700::1111")).toBe(false);
    expect(isBlockedEmbedHost("[::1]")).toBe(true);
  });
});
