"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import type { BoardTemplate } from "@/types";

interface TemplateCardPreviewProps {
  template: BoardTemplate;
}

function ThemeFallbackPreview({ template }: TemplateCardPreviewProps) {
  return (
    <div
      className="h-48 p-6 relative"
      style={{ background: template.theme.background.value }}
    >
      <h3
        className="text-xl font-bold"
        style={{ color: template.theme.textColor }}
      >
        Sample Board
      </h3>
      <div className="mt-4 space-y-2">
        {template.blocks.slice(0, 2).map((block, idx) => {
          const getBlockLabel = () => {
            if (block.type === "link" && "title" in block.settings) {
              return block.settings.title as string;
            }
            if (block.type === "button" && "text" in block.settings) {
              return block.settings.text as string;
            }
            if (block.type === "text" && "content" in block.settings) {
              return (block.settings.content as string).slice(0, 30);
            }
            return `${block.type} block`;
          };

          return (
            <div
              key={idx}
              className="p-2 rounded text-sm"
              style={{
                backgroundColor: template.theme.cardBackground,
                color: template.theme.textColor,
              }}
            >
              {getBlockLabel()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TemplateCardPreview({ template }: TemplateCardPreviewProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="relative h-48 overflow-hidden bg-muted">
      {imageFailed ? (
        <ThemeFallbackPreview template={template} />
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element -- static SVG previews from public/ */
        <img
          src={template.thumbnail}
          alt={`${template.name} preview`}
          width={800}
          height={480}
          className="h-full w-full object-cover object-top"
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      )}
      {template.featured && (
        <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" aria-hidden="true" />
          Featured
        </div>
      )}
    </div>
  );
}
