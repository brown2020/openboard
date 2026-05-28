/** Safe PNG filename for QR code downloads. */
export function buildQrDownloadFilename(slug: string): string {
  const safe =
    slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "") || "board";

  return `${safe}-qr.png`;
}
