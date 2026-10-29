"use client";

import { getFirebaseErrorMessage } from "@/hooks/use-error-handler";
import { useUIStore, type ToastType } from "@/stores/ui-store";

export function notifyUser(
  type: ToastType,
  title: string,
  message?: string
): void {
  useUIStore.getState().showToast({ type, title, message });
}

/** Toast a Firestore/Storage/Auth write failure and return the message. */
export function reportWriteError(title: string, error: unknown): string {
  const message =
    typeof error === "string" ? error : getFirebaseErrorMessage(error);
  notifyUser("error", title, message);
  return message;
}
