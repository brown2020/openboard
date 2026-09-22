"use client";

import { useEffect, useState } from "react";
import { useAuthContext } from "@/lib/auth-context";
import { useUserStore } from "@/stores/user-store";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase";
import { UserProfile } from "@/types";
import { getValidToken } from "@/lib/auth-utils";
import { useErrorHandler, getFirebaseErrorMessage } from "./use-error-handler";

async function loadOrCreateProfile(
  uid: string,
  email: string | null,
  displayName: string | null,
  photoURL: string | null
): Promise<UserProfile> {
  const userRef = doc(getClientDb(), "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }

  const username = email?.split("@")[0] || uid.slice(0, 8);
  const newUser = {
    id: uid,
    username,
    email: (email || "").toLowerCase(),
    displayName: displayName || username,
    avatar: photoURL || undefined,
    bio: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, newUser);
  const createdUserSnap = await getDoc(userRef);
  return createdUserSnap.data() as UserProfile;
}

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
    let ignore = false;

    if (authLoading) {
      return () => {
        ignore = true;
      };
    }

    if (!firebaseUser) {
      clearUser();
      setHydrated(true);
      return () => {
        ignore = true;
      };
    }

    if (user && user.id === firebaseUser.uid && isHydrated) {
      setLoading(false);
      return () => {
        ignore = true;
      };
    }

    setLoading(true);
    setSyncError(null);

    void getValidToken(firebaseUser)
      .then(() =>
        loadOrCreateProfile(
          firebaseUser.uid,
          firebaseUser.email,
          firebaseUser.displayName,
          firebaseUser.photoURL
        )
      )
      .then((profile) => {
        if (ignore) return;
        setUser(profile);
        setHydrated(true);
      })
      .catch((error) => {
        if (ignore) return;
        handleError(error, "Failed to sync user profile");
        setSyncError(getFirebaseErrorMessage(error));
        clearUser();
        setHydrated(true);
      });

    return () => {
      ignore = true;
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
