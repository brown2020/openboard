import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Uses DOMPurify with a configuration suitable for rich text content.
 */
export function sanitizeHtml(html: string): string {
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
