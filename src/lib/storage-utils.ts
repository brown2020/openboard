/**
 * Storage Utilities
 * Centralized localStorage/sessionStorage management for OpenBoard
 */

const STORAGE_PREFIX = "openboard";

/**
 * Clear all OpenBoard-related data from localStorage and sessionStorage
 */
export function clearOpenboardStorage(): void {
  if (typeof window === "undefined") return;

  // Clear localStorage
  const localKeysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.includes(STORAGE_PREFIX)) {
      localKeysToRemove.push(key);
    }
  }
  localKeysToRemove.forEach((key) => localStorage.removeItem(key));

  // Clear sessionStorage
  const sessionKeysToRemove: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key?.includes(STORAGE_PREFIX)) {
      sessionKeysToRemove.push(key);
    }
  }
  sessionKeysToRemove.forEach((key) => sessionStorage.removeItem(key));
}

/**
 * Remove a specific key from localStorage
 */
export function removeStorageItem(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

/**
 * Get an item from localStorage with type safety
 */
export function getStorageItem<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch {
    return null;
  }
}

/**
 * Set an item in localStorage
 */
export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
}
