"use client";

import { useEffect, useState } from "react";
import { useAuthContext } from "@/lib/auth-context";
import { useUserStore } from "@/stores/user-store";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/types";
import { getValidToken } from "@/lib/auth-utils";
import { useErrorHandler, getFirebaseErrorMessage } from "./use-error-handler";

export function useAuth() {
  const { user: firebaseUser, loading: authLoading } = useAuthContext();
  const {
    user,
    setUser,
    clearUser,
    setLoading,
    isLoading,
    isHydrated,
    setHydrated,
  } = useUserStore();
  const { handleError } = useErrorHandler();
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    // Use AbortController to prevent race conditions
    const controller = new AbortController();

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
        await getValidToken(firebaseUser);

        // Check if aborted before proceeding
        if (controller.signal.aborted) return;

        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (controller.signal.aborted) return;

        if (userSnap.exists()) {
          const userData = userSnap.data() as UserProfile;
          setUser(userData);
          setHydrated(true);
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

          if (controller.signal.aborted) return;

          // Fetch to get actual timestamps
          const createdUserSnap = await getDoc(userRef);
          if (createdUserSnap.exists()) {
            setUser(createdUserSnap.data() as UserProfile);
            setHydrated(true);
          }
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        handleError(error, "Failed to sync user profile");
        setSyncError(getFirebaseErrorMessage(error));
        // On error, clear stale data but still mark as hydrated
        clearUser();
        setHydrated(true);
      }
    };

    syncUser();

    return () => {
      controller.abort();
    };
  }, [
    firebaseUser,
    authLoading,
    user,
    setUser,
    clearUser,
    setLoading,
    isHydrated,
    handleError,
    setHydrated,
  ]);

  return {
    user,
    firebaseUser,
    isLoading: authLoading || isLoading,
    isLoaded: !authLoading && isHydrated,
    isAuthenticated: !!user && !!firebaseUser && isHydrated,
    syncError,
  };
}
