import { Timestamp } from "firebase/firestore";

// User Types
export interface UserProfile {
  id: string;
  clerkId: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  customDomain?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Block Types
export type BlockType =
  | "link"
  | "text"
  | "richtext"
  | "image"
  | "video"
  | "embed"
  | "button"
  | "social-links"
  | "calendar"
  | "form"
  | "divider"
  | "spacer";

export interface BaseBlock {
  id: string;
  type: BlockType;
  order: number;
  visible: boolean;
  settings: Record<string, unknown>;
}

export interface LinkBlock extends BaseBlock {
  type: "link";
  settings: {
    url: string;
    title: string;
    description?: string;
    icon?: string;
    thumbnail?: string;
  };
}

export interface TextBlock extends BaseBlock {
  type: "text";
  settings: {
    content: string;
    alignment?: "left" | "center" | "right";
    fontSize?: "sm" | "md" | "lg" | "xl";
  };
}

export interface RichTextBlock extends BaseBlock {
  type: "richtext";
  settings: {
    content: string; // HTML content from Tiptap
    alignment?: "left" | "center" | "right";
  };
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  settings: {
    url: string;
    alt: string;
    caption?: string;
    link?: string;
    aspectRatio?: "square" | "portrait" | "landscape" | "auto";
  };
}

export interface VideoBlock extends BaseBlock {
  type: "video";
  settings: {
    url: string;
    platform: "youtube" | "vimeo" | "custom";
    title?: string;
  };
}

export interface EmbedBlock extends BaseBlock {
  type: "embed";
  settings: {
    url: string;
    embedCode?: string;
    platform?: "spotify" | "twitter" | "instagram" | "custom";
  };
}

export interface ButtonBlock extends BaseBlock {
  type: "button";
  settings: {
    text: string;
    url: string;
    style: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
  };
}

export interface SocialLinksBlock extends BaseBlock {
  type: "social-links";
  settings: {
    links: Array<{
      platform: string;
      url: string;
      icon: string;
    }>;
    layout: "horizontal" | "grid";
  };
}

export interface CalendarBlock extends BaseBlock {
  type: "calendar";
  settings: {
    provider: "cal" | "calendly";
    url: string;
    title?: string;
  };
}

export interface FormBlock extends BaseBlock {
  type: "form";
  settings: {
    fields: Array<{
      id: string;
      type: "text" | "email" | "textarea" | "select";
      label: string;
      required: boolean;
      placeholder?: string;
    }>;
    submitText: string;
    submitUrl?: string;
  };
}

export interface DividerBlock extends BaseBlock {
  type: "divider";
  settings: {
    style: "solid" | "dashed" | "dotted";
    width?: "full" | "medium" | "narrow";
  };
}

export interface SpacerBlock extends BaseBlock {
  type: "spacer";
  settings: {
    height: "sm" | "md" | "lg" | "xl";
  };
}

export type Block =
  | LinkBlock
  | TextBlock
  | RichTextBlock
  | ImageBlock
  | VideoBlock
  | EmbedBlock
  | ButtonBlock
  | SocialLinksBlock
  | CalendarBlock
  | FormBlock
  | DividerBlock
  | SpacerBlock;

// Board Types
export type BoardLayout = "single-column" | "grid" | "masonry";
export type BoardPrivacy = "public" | "unlisted" | "private" | "password";

export interface BoardTheme {
  name: string;
  background: {
    type: "color" | "gradient" | "image";
    value: string;
  };
  primaryColor: string;
  secondaryColor?: string;
  textColor: string;
  cardBackground: string;
  cardBorder?: string;
  borderRadius: "none" | "sm" | "md" | "lg" | "xl";
  font: {
    heading: string;
    body: string;
  };
}

export interface Board {
  id: string;
  slug: string;
  title: string;
  description?: string;
  ownerId: string;
  ownerUsername: string;
  collaborators: string[];
  blocks: Block[];
  layout: BoardLayout;
  theme: BoardTheme;
  privacy: BoardPrivacy;
  /** Only stored server-side for password protected boards; never display to clients */
  passwordHash?: string;
  customDomain?: string;
  favicon?: string;
  seo: {
    title?: string;
    description?: string;
    ogImage?: string;
  };
  analytics: {
    enabled: boolean;
    views: number;
    uniqueVisitors: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
}

// Analytics Types
export interface BoardAnalytics {
  boardId: string;
  date: string;
  views: number;
  uniqueVisitors: number;
  clicks: Record<string, number>; // blockId -> click count
  referrers: Record<string, number>;
  devices: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
}

export interface ClickEvent {
  id: string;
  boardId: string;
  blockId: string;
  timestamp: Timestamp;
  referrer?: string;
  userAgent?: string;
  country?: string;
}

// Template Types
export interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  category: "creator" | "developer" | "business" | "student" | "team" | "other";
  thumbnail: string;
  blocks: Omit<Block, "id">[];
  theme: BoardTheme;
  featured: boolean;
  usageCount: number;
}
