"use client";

import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { buildQrDownloadFilename } from "@/lib/qr-code";

interface BoardQrCodeProps {
  url: string;
  boardSlug: string;
}

export function BoardQrCode({ url, boardSlug }: BoardQrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    let cancelled = false;

    setIsGenerating(true);
    setError(null);
    setDataUrl(null);

    void QRCode.toDataURL(url, {
      width: 256,
      margin: 2,
      errorCorrectionLevel: "M",
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((result) => {
        if (!cancelled) {
          setDataUrl(result);
          setIsGenerating(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not generate QR code. Please try again.");
          setIsGenerating(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  const handleDownload = useCallback(() => {
    if (!dataUrl) return;

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = buildQrDownloadFilename(boardSlug);
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, [boardSlug, dataUrl]);

  if (isGenerating) {
    return (
      <div
        className="w-full min-h-48 border rounded-xl flex flex-col items-center justify-center gap-2 bg-muted/30"
        aria-live="polite"
      >
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Generating QR code…</p>
      </div>
    );
  }

  if (error || !dataUrl) {
    return (
      <div className="w-full min-h-48 border border-destructive/30 rounded-xl flex items-center justify-center bg-destructive/5 p-4">
        <p className="text-sm text-destructive text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="w-full flex flex-col items-center gap-3 rounded-xl border bg-white p-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- QR data URL is generated client-side */}
        <img
          src={dataUrl}
          alt={`QR code linking to ${url}`}
          width={256}
          height={256}
          className="h-auto w-full max-w-[256px]"
        />
        <p className="text-xs text-muted-foreground text-center break-all">{url}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleDownload}
      >
        <Download className="w-4 h-4 mr-2" />
        Download PNG
      </Button>
    </div>
  );
}
