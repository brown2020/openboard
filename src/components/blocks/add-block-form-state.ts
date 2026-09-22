import type { BlockType, VideoBlock, EmbedBlock, SocialLinksBlock, CalendarBlock } from "@/types";


// ============================================================================
// Types & Interfaces
// ============================================================================

export type FormFieldType = "text" | "email" | "textarea";

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  required: boolean;
  placeholder?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

// Form state for all block types
export interface FormState {
  selectedType: BlockType | null;
  // Link
  linkTitle: string;
  linkUrl: string;
  // Text
  textContent: string;
  // Rich Text
  richTextContent: string;
  // Button
  buttonText: string;
  buttonUrl: string;
  // Image
  imageUrl: string;
  imageAlt: string;
  selectedImageFile: File | null;
  // Video
  videoUrl: string;
  videoTitle: string;
  // Embed
  embedUrl: string;
  embedCustomUrl: string;
  embedPlatform: EmbedBlock["settings"]["platform"];
  // Social Links
  socialLinks: SocialLink[];
  socialLayout: SocialLinksBlock["settings"]["layout"];
  // Calendar
  calendarProvider: CalendarBlock["settings"]["provider"];
  calendarUrl: string;
  calendarTitle: string;
  // Form
  formFields: FormField[];
  formSubmitText: string;
  formSubmitUrl: string;
}

export type FormAction =
  | { type: "SET_SELECTED_TYPE"; payload: BlockType | null }
  | { type: "SET_FIELD"; field: keyof FormState; value: unknown }
  | {
      type: "SET_SOCIAL_LINK";
      index: number;
      field: keyof SocialLink;
      value: string;
    }
  | { type: "ADD_SOCIAL_LINK" }
  | { type: "REMOVE_SOCIAL_LINK"; index: number }
  | {
      type: "SET_FORM_FIELD";
      index: number;
      field: keyof FormField;
      value: unknown;
    }
  | { type: "ADD_FORM_FIELD" }
  | { type: "REMOVE_FORM_FIELD"; index: number }
  | { type: "RESET" };

// ============================================================================
// Initial State & Reducer
// ============================================================================

export const initialState: FormState = {
  selectedType: null,
  linkTitle: "",
  linkUrl: "",
  textContent: "",
  richTextContent: "",
  buttonText: "",
  buttonUrl: "",
  imageUrl: "",
  imageAlt: "",
  selectedImageFile: null,
  videoUrl: "",
  videoTitle: "",
  embedUrl: "",
  embedCustomUrl: "",
  embedPlatform: "custom",
  socialLinks: [
    { platform: "Instagram", url: "", icon: "📸" },
    { platform: "Twitter", url: "", icon: "🐦" },
  ],
  socialLayout: "horizontal",
  calendarProvider: "cal",
  calendarUrl: "",
  calendarTitle: "",
  formFields: [
    { id: "field_name", type: "text", label: "Name", required: true },
    { id: "field_email", type: "email", label: "Email", required: true },
  ],
  formSubmitText: "Send",
  formSubmitUrl: "",
};

export function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_SELECTED_TYPE":
      return { ...state, selectedType: action.payload };

    case "SET_FIELD":
      return { ...state, [action.field]: action.value };

    case "SET_SOCIAL_LINK":
      return {
        ...state,
        socialLinks: state.socialLinks.map((link, i) =>
          i === action.index ? { ...link, [action.field]: action.value } : link
        ),
      };

    case "ADD_SOCIAL_LINK":
      return {
        ...state,
        socialLinks: [
          ...state.socialLinks,
          { platform: "", url: "", icon: "🔗" },
        ],
      };

    case "REMOVE_SOCIAL_LINK":
      return {
        ...state,
        socialLinks: state.socialLinks.filter((_, i) => i !== action.index),
      };

    case "SET_FORM_FIELD":
      return {
        ...state,
        formFields: state.formFields.map((field, i) =>
          i === action.index
            ? { ...field, [action.field]: action.value }
            : field
        ),
      };

    case "ADD_FORM_FIELD":
      return {
        ...state,
        formFields: [
          ...state.formFields,
          {
            id: `field_${Date.now()}`,
            type: "text",
            label: "Untitled field",
            required: false,
          },
        ],
      };

    case "REMOVE_FORM_FIELD":
      if (state.formFields.length === 1) return state;
      return {
        ...state,
        formFields: state.formFields.filter((_, i) => i !== action.index),
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

export function detectVideoPlatform(url: string): VideoBlock["settings"]["platform"] {
  if (/youtu\.be|youtube\.com/.test(url)) return "youtube";
  if (/vimeo\.com/.test(url)) return "vimeo";
  return "custom";
}

export function detectEmbedPlatform(url: string): EmbedBlock["settings"]["platform"] {
  if (/spotify\.com/.test(url)) return "spotify";
  if (/twitter\.com|x\.com/.test(url)) return "twitter";
  if (/instagram\.com/.test(url)) return "instagram";
  return "custom";
}

export function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

// ============================================================================
// Component
// ============================================================================

