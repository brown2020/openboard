"use client";

import { useAuth } from "@/hooks/use-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user, isLoaded, syncError } = useAuth();

  if (isLoaded && !user && !syncError) {
    redirect("/login");
  }

  if (!isLoaded || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        {syncError ? (
          <p className="text-sm text-destructive" role="alert">
            {syncError}
          </p>
        ) : (
          <p className="text-muted-foreground">Loading profile…</p>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">
          The public name used on your board URLs.
        </p>
      </div>

      <dl className="rounded-lg border divide-y">
        <div className="px-4 py-3">
          <dt className="text-xs text-muted-foreground">Display name</dt>
          <dd className="font-medium">{user.displayName || "—"}</dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-xs text-muted-foreground">Username</dt>
          <dd className="font-medium">@{user.username}</dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-xs text-muted-foreground">Email</dt>
          <dd className="font-medium">{user.email}</dd>
        </div>
      </dl>

      <Button asChild variant="outline">
        <Link href="/settings">Account settings</Link>
      </Button>
    </div>
  );
}
