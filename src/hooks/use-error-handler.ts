"use client";

import { useState, useCallback } from "react";

export interface ErrorState {
  message: string;
  code?: string;
  timestamp: number;
}

export interface UseErrorHandlerReturn {
  error: ErrorState | null;
  setError: (error: Error | string | null) => void;
  clearError: () => void;
  handleError: (error: unknown, context?: string) => void;
  hasError: boolean;
}

/**
 * Standardized error handling hook for consistent error management across the app.
 *
 * Usage:
 * ```typescript
 * const { error, handleError, clearError } = useErrorHandler();
 *
 * try {
 *   await someOperation();
 * } catch (err) {
 *   handleError(err, "Failed to load boards");
 * }
 * ```
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setErrorState] = useState<ErrorState | null>(null);

  const setError = useCallback((error: Error | string | null) => {
    if (!error) {
      setErrorState(null);
      return;
    }

    if (typeof error === "string") {
      setErrorState({
        message: error,
        timestamp: Date.now(),
      });
      return;
    }

    setErrorState({
      message: error.message,
      code: (error as { code?: string }).code,
      timestamp: Date.now(),
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const handleError = useCallback(
    (error: unknown, context?: string) => {
      if (error instanceof Error) {
        setError(error);
        return;
      }

      if (typeof error === "string") {
        setError(error);
        return;
      }

      // Fallback for unknown error types
      setError(context || "An unexpected error occurred");
    },
    [setError]
  );

  return {
    error,
    setError,
    clearError,
    handleError,
    hasError: error !== null,
  };
}

/**
 * Helper to extract user-friendly error messages from Firebase errors.
 */
export function getFirebaseErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;

  const messages: Record<string, string> = {
    "auth/email-already-in-use": "This email is already registered",
    "auth/invalid-email": "Invalid email address",
    "auth/user-not-found": "No account found with this email",
    "auth/wrong-password": "Incorrect password",
    "auth/invalid-credential": "Invalid email or password",
    "auth/weak-password": "Password is too weak",
    "auth/too-many-requests": "Too many attempts. Please try again later",
    "auth/popup-closed-by-user": "Sign-in popup was closed. Please try again",
    "auth/network-request-failed": "Network error. Please check your connection",
    "auth/user-disabled": "This account has been disabled",
    "permission-denied": "You don't have permission to perform this action",
    "not-found": "The requested resource was not found",
    "already-exists": "This resource already exists",
    "unauthenticated": "Please sign in to continue",
    "unavailable": "Service temporarily unavailable. Please try again",
    "deadline-exceeded": "Request timed out. Please try again",
  };

  if (code && messages[code]) return messages[code];
  const msg = (error as { message?: string })?.message;
  return msg || "An error occurred";
}
