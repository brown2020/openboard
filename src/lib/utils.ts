import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { BoardTheme } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a URL-safe slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Generate a unique slug with a timestamp suffix
 */
export function generateUniqueSlug(text: string): string {
  const baseSlug = generateSlug(text);
  const suffix = Date.now().toString().slice(-4);
  return `${baseSlug}-${suffix}`;
}

/**
 * Get CSS background value from theme
 * Works for both color and gradient backgrounds
 */
export function getThemeBackground(theme: BoardTheme): string {
  return theme.background.value;
}
