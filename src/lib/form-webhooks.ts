import type { Block, FormBlock } from "@/types";

function isFormBlock(block: Block): block is FormBlock {
  return block.type === "form";
}

export function extractFormSubmitUrls(blocks: Block[]): Record<string, string> {
  const urls: Record<string, string> = {};
  for (const block of blocks) {
    if (!isFormBlock(block)) continue;
    const url = block.settings.submitUrl?.trim();
    if (url) urls[block.id] = url;
  }
  return urls;
}

export function stripFormSubmitUrls(blocks: Block[]): Block[] {
  return blocks.map((block) => {
    if (!isFormBlock(block) || !block.settings.submitUrl) return block;
    const { submitUrl: _submitUrl, ...settings } = block.settings;
    return { ...block, settings };
  });
}

export function mergeFormSubmitUrls(
  blocks: Block[],
  urls: Record<string, string> | undefined
): Block[] {
  if (!urls) return blocks;
  return blocks.map((block) => {
    if (!isFormBlock(block)) return block;
    const url = urls[block.id];
    if (!url) return block;
    return {
      ...block,
      settings: { ...block.settings, submitUrl: url },
    };
  });
}
