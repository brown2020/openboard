"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { removeAuthCookie } from "@/lib/auth-cookie";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ResetAuthPage() {
  const [status, setStatus] = useState<"idle" | "clearing" | "done">("idle");
  const [details, setDetails] = useState<string[]>([]);

  const addDetail = (msg: string) => {
    setDetails((prev) => [...prev, msg]);
  };

  const handleReset = async () => {
    setStatus("clearing");
    setDetails([]);

    try {
      // 1. Clear localStorage
      addDetail("Clearing localStorage...");
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
        addDetail(`  Removed localStorage: ${key}`);
      });

      // 2. Clear sessionStorage
      addDetail("Clearing sessionStorage...");
      const sessionKeysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach((key) => {
        sessionStorage.removeItem(key);
        addDetail(`  Removed sessionStorage: ${key}`);
      });

      // 3. Clear auth cookie
      addDetail("Clearing auth cookie...");
      removeAuthCookie();
      addDetail("  Auth cookie removed");

      // 4. Sign out from Firebase
      addDetail("Signing out from Firebase...");
      try {
        await signOut(auth);
        addDetail("  Firebase sign out successful");
      } catch (e) {
        addDetail(`  Firebase sign out: ${e instanceof Error ? e.message : "no session"}`);
      }

      // 5. Clear all cookies
      addDetail("Clearing all cookies...");
      document.cookie.split(";").forEach((c) => {
        const name = c.trim().split("=")[0];
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        addDetail(`  Cleared cookie: ${name}`);
      });

      // 6. Clear IndexedDB (Firebase uses this for auth persistence)
      addDetail("Clearing IndexedDB...");
      try {
        const databases = await indexedDB.databases();
        for (const db of databases) {
          if (db.name) {
            indexedDB.deleteDatabase(db.name);
            addDetail(`  Deleted IndexedDB: ${db.name}`);
          }
        }
      } catch (e) {
        addDetail(`  IndexedDB clear error: ${e instanceof Error ? e.message : "unknown"}`);
        // Fallback: try to delete known Firebase databases
        const knownDbs = [
          "firebaseLocalStorageDb",
          "firebase-heartbeat-database",
          "firebase-installations-database"
        ];
        for (const dbName of knownDbs) {
          try {
            indexedDB.deleteDatabase(dbName);
            addDetail(`  Deleted IndexedDB: ${dbName}`);
          } catch {
            // ignore
          }
        }
      }

      addDetail("✅ All auth state cleared!");
      addDetail("⚠️ Please close this tab and open a new one to fully reset.");
      setStatus("done");
    } catch (error) {
      addDetail(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      setStatus("done");
    }
  };

  useEffect(() => {
    // Auto-run on page load
    handleReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Auth Reset Tool
        </h1>

        <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 mb-4 max-h-80 overflow-y-auto font-mono text-xs">
          {status === "idle" && (
            <p className="text-gray-500">Click the button to clear all auth state...</p>
          )}
          {status === "clearing" && (
            <p className="text-yellow-600">Clearing auth state...</p>
          )}
          {details.map((detail, i) => (
            <p key={i} className="text-gray-700 dark:text-gray-300">
              {detail}
            </p>
          ))}
        </div>

        {status === "done" && (
          <div className="space-y-3">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
                Important: Close this browser tab completely and open a new one before logging in.
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleReset} variant="outline">
                Reset Again
              </Button>
              <Link href="/login">
                <Button>Go to Login</Button>
              </Link>
            </div>
          </div>
        )}

        {status !== "done" && (
          <Button onClick={handleReset} disabled={status === "clearing"}>
            {status === "clearing" ? "Clearing..." : "Clear All Auth State"}
          </Button>
        )}
      </div>
    </div>
  );
}
