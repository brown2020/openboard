"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { removeAuthCookie } from "@/lib/auth-cookie";
import { useUserStore } from "@/stores/user-store";
import { notifyUser } from "@/lib/write-error";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { user, firebaseUser, isLoaded, syncError } = useAuth();
  const clearUser = useUserStore((state) => state.clearUser);
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  if (isLoaded && !firebaseUser) {
    redirect("/login");
  }

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await auth.signOut();
      removeAuthCookie();
      clearUser();
      router.push("/");
    } catch (error) {
      notifyUser(
        "error",
        "Could not sign out",
        error instanceof Error ? error.message : "Please try again."
      );
      setSigningOut(false);
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        {syncError ? (
          <p className="text-sm text-destructive" role="alert">
            {syncError}
          </p>
        ) : (
          <p className="text-muted-foreground">Loading settings…</p>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Account details for {user.email}. Board privacy and sharing live in
          each board&apos;s share dialog.
        </p>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <h2 className="font-medium">Profile</h2>
        <p className="text-sm text-muted-foreground">
          Signed in as @{user.username}
          {user.displayName ? ` (${user.displayName})` : ""}.
        </p>
        <Button asChild variant="outline">
          <Link href="/profile">View profile</Link>
        </Button>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <h2 className="font-medium">Session</h2>
        <Button
          variant="destructive"
          onClick={() => void handleSignOut()}
          disabled={signingOut}
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </Button>
      </div>
    </div>
  );
}
