import { describe, expect, it } from "vitest";
import { buildQrDownloadFilename } from "@/lib/qr-code";

describe("buildQrDownloadFilename", () => {
  it("builds a safe png filename from board slug", () => {
    expect(buildQrDownloadFilename("My Links")).toBe("my-links-qr.png");
  });

  it("falls back when slug sanitizes to empty", () => {
    expect(buildQrDownloadFilename("!!!")).toBe("board-qr.png");
  });
});
