"use client";

import { useState } from "react";
import { useAuth } from "./use-auth";

export type AIType =
  | "board-description"
  | "link-title"
  | "content-suggestions"
  | "seo-optimization";

interface UseAIResult {
  generate: (
    prompt: string,
    type: AIType,
    onData: (data: string) => void
  ) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useAI(): UseAIResult {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (
    prompt: string,
    type: AIType,
    onData: (data: string) => void
  ) => {
    if (!user) {
      setError("You must be logged in to use AI features");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, type }),
      });

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error("AI features are not configured");
        }
        throw new Error("Failed to generate content");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        result += chunk;
        onData(result);
      }
    } catch (err) {
      console.error("AI Generation Error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generate,
    isLoading,
    error,
  };
}

