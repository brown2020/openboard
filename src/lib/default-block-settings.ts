import type { Block, BlockType } from "@/types";

/**
 * Default block settings for each block type
 */
export function getDefaultBlockSettings(type: BlockType): Block["settings"] {

  switch (type) {
    case "text":
      return { content: "", alignment: "left", fontSize: "md" };
    case "richtext":
      return { content: "", alignment: "left" };
    case "link":
      return { url: "", title: "New Link", description: "" };
    case "button":
      return { text: "Click me", url: "", style: "primary", size: "md" };
    case "image":
      return { url: "", alt: "", aspectRatio: "auto" };
    case "video":
      return { url: "", platform: "youtube" };
    case "embed":
      return { url: "", platform: "custom" };
    case "social-links":
      return { links: [], layout: "horizontal" };
    case "calendar":
      return { provider: "cal", url: "" };
    case "form":
      return { fields: [], submitText: "Submit" };
    case "divider":
      return { style: "solid", width: "full" };
    case "spacer":
      return { height: "md" };
    default: {
      // Exhaustive check - this should never be reached
      void (type as never);
      return { content: "" } as Block["settings"];
    }
  }
}
