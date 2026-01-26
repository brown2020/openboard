"use client";

import React, { Component, ReactNode } from "react";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary component for graceful error handling.
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary fallback={<CustomError />}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error boundary caught error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error boundary when resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const prevKeys = prevProps.resetKeys || [];
      const currentKeys = this.props.resetKeys || [];

      if (
        prevKeys.length !== currentKeys.length ||
        prevKeys.some((key, i) => key !== currentKeys[i])
      ) {
        this.setState({ hasError: false, error: null });
      }
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          reset={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error | null;
  reset: () => void;
}

function DefaultErrorFallback({ error, reset }: DefaultErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6 space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">
            Something went wrong
          </h2>
          <p className="text-sm text-red-700 dark:text-red-300">
            {error?.message || "An unexpected error occurred"}
          </p>
        </div>
        <Button onClick={reset} variant="outline" size="sm">
          Try again
        </Button>
      </div>
    </div>
  );
}

/**
 * Specialized error boundary for board editor
 */
export function BoardEditorErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-destructive/10 border border-destructive/20 rounded-lg p-6 space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Editor Error</h2>
              <p className="text-sm text-muted-foreground">
                The board editor encountered an error. Your changes may not have been
                saved.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()} size="sm">
                Reload Page
              </Button>
              <Button
                onClick={() => (window.location.href = "/boards")}
                variant="outline"
                size="sm"
              >
                Go to Boards
              </Button>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Specialized error boundary for public board view
 */
export function PublicBoardErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Board Not Available</h2>
              <p className="text-muted-foreground">
                This board could not be loaded. It may have been deleted or you don't
                have permission to view it.
              </p>
            </div>
            <Button onClick={() => (window.location.href = "/")} size="sm">
              Go Home
            </Button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Specialized error boundary for block components
 */
export function BlockErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
          <p className="text-sm text-muted-foreground">
            This block failed to render
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
