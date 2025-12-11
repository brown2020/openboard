/**
 * Authentication Utilities
 * Centralized auth helpers for OpenBoard
 */

import { User } from "firebase/auth";

/** Singleton promise to prevent multiple simultaneous token refreshes */
let tokenRefreshPromise: Promise<string> | null = null;

/**
 * Get a valid Firebase ID token, with deduplication of refresh requests
 * This prevents multiple components from triggering simultaneous token refreshes
 */
export async function getValidToken(user: User): Promise<string> {
  // If a refresh is already in progress, return that promise
  if (tokenRefreshPromise) {
    return tokenRefreshPromise;
  }

  // Start a new refresh and cache the promise
  tokenRefreshPromise = user.getIdToken(true).finally(() => {
    // Clear the cached promise when done
    tokenRefreshPromise = null;
  });

  return tokenRefreshPromise;
}

/**
 * Check if a token refresh is currently in progress
 */
export function isTokenRefreshing(): boolean {
  return tokenRefreshPromise !== null;
}
