"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PasswordGate({ boardId }: { boardId: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/boards/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardId, password }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Incorrect password");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unlock");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full border rounded-lg p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">Protected Board</h1>
        <p className="text-sm text-muted-foreground text-center">
          Enter the password provided by the board owner to continue.
        </p>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading || !password}>
            {isLoading ? "Unlocking..." : "Unlock"}
          </Button>
        </form>
      </div>
    </div>
  );
}


