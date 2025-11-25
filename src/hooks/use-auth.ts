"use client";

import { useEffect, useState } from "react";
import { useAuthContext } from "@/lib/auth-context";
import { useUserStore, clearAllAuthState } from "@/stores/user-store";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/types";

export function useAuth() {
  const { user: firebaseUser, loading: authLoading } = useAuthContext();
  const { user, setUser, clearUser, setLoading, isLoading, isHydrated, setHydrated } = useUserStore();
  const [syncError, setSyncError] = useState<string | null>(null);

  // Clear any stale localStorage on mount
  useEffect(() => {
    clearAllAuthState();
  }, []);

  useEffect(() => {
    const syncUser = async () => {
      // If auth is still loading, wait
      if (authLoading) {
        return;
      }

      // If no Firebase user, clear everything and mark as hydrated
      if (!firebaseUser) {
        clearUser();
        setHydrated(true);
        return;
      }

      // If we already have the correct user loaded, skip
      if (user && user.id === firebaseUser.uid && isHydrated) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setSyncError(null);

      try {
        // Force refresh the ID token to ensure Firestore has the latest auth state
        await firebaseUser.getIdToken(true);
        
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data() as UserProfile;
          setUser(userData);
        } else {
          // New user, create profile
          const username =
            firebaseUser.email?.split("@")[0] || firebaseUser.uid.slice(0, 8);
          const newUser: Omit<UserProfile, "createdAt" | "updatedAt"> & {
            createdAt: ReturnType<typeof serverTimestamp>;
            updatedAt: ReturnType<typeof serverTimestamp>;
          } = {
            id: firebaseUser.uid,
            clerkId: firebaseUser.uid,
            username,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || username,
            avatar: firebaseUser.photoURL || undefined,
            bio: "",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };

          await setDoc(userRef, newUser);

          // Fetch to get actual timestamps
          const createdUserSnap = await getDoc(userRef);
          if (createdUserSnap.exists()) {
            setUser(createdUserSnap.data() as UserProfile);
          }
        }
      } catch (error) {
        console.error("Error syncing user:", error);
        setSyncError(error instanceof Error ? error.message : "Unknown error");
        // On error, clear stale data but still mark as hydrated
        clearUser();
        setHydrated(true);
      }
    };

    syncUser();
  }, [firebaseUser, authLoading, user, setUser, clearUser, setLoading, isHydrated, setHydrated]);

  return {
    user,
    firebaseUser,
    isLoading: authLoading || isLoading,
    isLoaded: !authLoading && isHydrated,
    isAuthenticated: !!user && !!firebaseUser && isHydrated,
    syncError,
  };
}
