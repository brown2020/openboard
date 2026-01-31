/**
 * Shared utilities for block components
 */

export type VideoPlatform = "youtube" | "vimeo" | "loom" | "unknown";
export type EmbedPlatform = "twitter" | "instagram" | "spotify" | "codepen" | "unknown";

/**
 * Detect video platform from URL
 */
export function detectVideoPlatform(url: string): VideoPlatform {
  const lower = url.toLowerCase();
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
    return "youtube";
  }
  if (lower.includes("vimeo.com")) {
    return "vimeo";
  }
  if (lower.includes("loom.com")) {
    return "loom";
  }
  return "unknown";
}

/**
 * Normalize video URL to embed format
 */
export function normalizeVideoUrl(url: string): string {
  const platform = detectVideoPlatform(url);

  switch (platform) {
    case "youtube": {
      const videoId = extractYouTubeId(url);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    case "vimeo": {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }
    case "loom": {
      const videoId = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)?.[1];
      return videoId ? `https://www.loom.com/embed/${videoId}` : url;
    }
    default:
      return url;
  }
}

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

/**
 * Detect embed platform from URL
 */
export function detectEmbedPlatform(url: string): EmbedPlatform {
  const lower = url.toLowerCase();
  if (lower.includes("twitter.com") || lower.includes("x.com")) {
    return "twitter";
  }
  if (lower.includes("instagram.com")) {
    return "instagram";
  }
  if (lower.includes("spotify.com")) {
    return "spotify";
  }
  if (lower.includes("codepen.io")) {
    return "codepen";
  }
  return "unknown";
}

/**
 * Normalize embed URL to embed format
 */
export function normalizeEmbedUrl(url: string): string {
  const platform = detectEmbedPlatform(url);

  switch (platform) {
    case "twitter": {
      const tweetId = url.match(/status\/(\d+)/)?.[1];
      return tweetId ? `https://twitter.com/i/status/${tweetId}` : url;
    }
    case "spotify": {
      const trackId = url.match(/track\/([a-zA-Z0-9]+)/)?.[1];
      const playlistId = url.match(/playlist\/([a-zA-Z0-9]+)/)?.[1];
      if (trackId) return `https://open.spotify.com/embed/track/${trackId}`;
      if (playlistId) return `https://open.spotify.com/embed/playlist/${playlistId}`;
      return url;
    }
    default:
      return url;
  }
}

/**
 * Normalize calendar URL (Google Calendar, Calendly, etc.)
 */
export function normalizeCalendarUrl(url: string): string {
  // Google Calendar
  if (url.includes("calendar.google.com")) {
    if (!url.includes("ctz=") && !url.includes("mode=")) {
      const separator = url.includes("?") ? "&" : "?";
      return `${url}${separator}ctz=UTC&mode=WEEK`;
    }
  }

  // Calendly - ensure clean embed URL
  if (url.includes("calendly.com")) {
    return url.replace("/event_types/", "/").replace(/\?.*$/, "");
  }

  return url;
}
