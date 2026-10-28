import DOMPurify from "isomorphic-dompurify";

const SAFE_COLOR =
  /^(?:#[0-9a-fA-F]{3,8}|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\))$/;
const SAFE_ALIGN = /^(?:left|center|right|justify)$/;

let styleHookInstalled = false;

function installStyleHook() {
  if (styleHookInstalled) return;
  styleHookInstalled = true;
  DOMPurify.addHook("uponSanitizeAttribute", (_node, data) => {
    if (data.attrName !== "style") return;
    const kept: string[] = [];
    for (const declaration of data.attrValue.split(";")) {
      const [rawName, ...rest] = declaration.split(":");
      const name = rawName?.trim().toLowerCase();
      const value = rest.join(":").trim().toLowerCase();
      if (!name || !value) continue;
      if (name === "color" && SAFE_COLOR.test(value)) {
        kept.push(`color: ${value}`);
      } else if (name === "text-align" && SAFE_ALIGN.test(value)) {
        kept.push(`text-align: ${value}`);
      }
    }
    data.attrValue = kept.join("; ");
    if (!data.attrValue) data.keepAttr = false;
  });
}

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Uses DOMPurify with a configuration suitable for rich text content.
 * Inline styles are limited to color and text-align.
 */
export function sanitizeHtml(html: string): string {
  installStyleHook();
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "a",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "code",
      "pre",
      "span",
      "div",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class", "style"],
    ALLOW_DATA_ATTR: false,
  });
}
