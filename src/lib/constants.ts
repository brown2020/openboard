import { BoardTheme } from "@/types";

// Re-export route constants/types for backward compatibility.
// (Prefer importing routes from `@/lib/routes` in new server-sensitive code.)
export * from "./routes";

// ============================================================================
// Theme Constants
// ============================================================================

/** Default theme for new boards */
export const DEFAULT_THEME: BoardTheme = {
  name: "Default",
  background: { type: "color", value: "#ffffff" },
  primaryColor: "#000000",
  textColor: "#000000",
  cardBackground: "#f5f5f5",
  borderRadius: "md",
  font: { heading: "system-ui", body: "system-ui" },
};

// Theme presets
export const THEME_PRESETS: BoardTheme[] = [
  {
    name: "Light",
    background: { type: "color", value: "#ffffff" },
    primaryColor: "#000000",
    textColor: "#000000",
    cardBackground: "#f5f5f5",
    borderRadius: "md",
    font: { heading: "system-ui", body: "system-ui" },
  },
  {
    name: "Dark",
    background: { type: "color", value: "#0a0a0a" },
    primaryColor: "#ffffff",
    textColor: "#ffffff",
    cardBackground: "#1a1a1a",
    borderRadius: "md",
    font: { heading: "system-ui", body: "system-ui" },
  },
  {
    name: "Ocean",
    background: {
      type: "gradient",
      value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    primaryColor: "#ffffff",
    textColor: "#ffffff",
    cardBackground: "rgba(255, 255, 255, 0.1)",
    borderRadius: "lg",
    font: { heading: "system-ui", body: "system-ui" },
  },
  {
    name: "Sunset",
    background: {
      type: "gradient",
      value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    primaryColor: "#ffffff",
    textColor: "#ffffff",
    cardBackground: "rgba(255, 255, 255, 0.15)",
    borderRadius: "lg",
    font: { heading: "system-ui", body: "system-ui" },
  },
  {
    name: "Forest",
    background: {
      type: "gradient",
      value: "linear-gradient(135deg, #0ba360 0%, #3cba92 100%)",
    },
    primaryColor: "#ffffff",
    textColor: "#ffffff",
    cardBackground: "rgba(255, 255, 255, 0.1)",
    borderRadius: "lg",
    font: { heading: "system-ui", body: "system-ui" },
  },
  {
    name: "Minimal",
    background: { type: "color", value: "#fafafa" },
    primaryColor: "#171717",
    textColor: "#171717",
    cardBackground: "#ffffff",
    cardBorder: "#e5e5e5",
    borderRadius: "sm",
    font: { heading: "system-ui", body: "system-ui" },
  },
];

// Social platform icons and info
export const SOCIAL_PLATFORMS = [
  { name: "twitter", label: "Twitter/X", icon: "FaXTwitter" },
  { name: "instagram", label: "Instagram", icon: "FaInstagram" },
  { name: "facebook", label: "Facebook", icon: "FaFacebook" },
  { name: "linkedin", label: "LinkedIn", icon: "FaLinkedin" },
  { name: "github", label: "GitHub", icon: "FaGithub" },
  { name: "youtube", label: "YouTube", icon: "FaYoutube" },
  { name: "tiktok", label: "TikTok", icon: "FaTiktok" },
  { name: "discord", label: "Discord", icon: "FaDiscord" },
  { name: "twitch", label: "Twitch", icon: "FaTwitch" },
  { name: "spotify", label: "Spotify", icon: "FaSpotify" },
  { name: "email", label: "Email", icon: "FaEnvelope" },
  { name: "website", label: "Website", icon: "FaGlobe" },
];

// Block type metadata
export const BLOCK_TYPES = [
  {
    type: "link",
    label: "Link",
    description: "Add a clickable link",
    icon: "FaLink",
  },
  {
    type: "text",
    label: "Text",
    description: "Add formatted text",
    icon: "FaAlignLeft",
  },
  {
    type: "image",
    label: "Image",
    description: "Add an image",
    icon: "FaImage",
  },
  {
    type: "video",
    label: "Video",
    description: "Embed a video",
    icon: "FaVideo",
  },
  {
    type: "button",
    label: "Button",
    description: "Add a call-to-action button",
    icon: "FaSquare",
  },
  {
    type: "social-links",
    label: "Social Links",
    description: "Add social media icons",
    icon: "FaShareAlt",
  },
  {
    type: "divider",
    label: "Divider",
    description: "Add a visual separator",
    icon: "FaMinus",
  },
  {
    type: "spacer",
    label: "Spacer",
    description: "Add vertical spacing",
    icon: "FaArrowsAltV",
  },
  {
    type: "embed",
    label: "Embed",
    description: "Embed content from other platforms",
    icon: "FaCode",
  },
  {
    type: "calendar",
    label: "Calendar",
    description: "Add booking calendar",
    icon: "FaCalendar",
  },
];
