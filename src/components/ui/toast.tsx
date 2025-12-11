"use client";

import { useEffect, useState } from "react";
import { useUIStore, Toast as ToastType } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import {
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

/**
 * Toast Container - Renders all active toasts
 */
export function ToastContainer() {
  const { toasts, dismissToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}

const TOAST_ICONS = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
} as const;

const TOAST_STYLES = {
  success:
    "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800",
  error: "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800",
  warning:
    "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
  info: "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800",
} as const;

/**
 * Individual Toast Item
 */
function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastType;
  onDismiss: (id: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(enterTimer);
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 200);
  };

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border shadow-lg",
        "transition-all duration-200 ease-out",
        TOAST_STYLES[toast.type],
        isVisible && !isExiting
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      )}
    >
      <div className="flex-shrink-0 mt-0.5">{TOAST_ICONS[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground">{toast.title}</p>
        {toast.message && (
          <p className="mt-1 text-sm text-muted-foreground">{toast.message}</p>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
}
