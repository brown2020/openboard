"use client";

import { useEffect } from "react";
import { useAuthContext } from "@/lib/auth-context";
import { useUserStore } from "@/stores/user-store";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/types";

export function useAuth() {
  const { user: firebaseUser } = useAuthContext();
  const { user, setUser, clearUser, setLoading } = useUserStore();

  useEffect(() => {
    const syncUser = async () => {
      if (!firebaseUser) {
        clearUser();
        return;
      }

      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          // User exists, load their profile
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
            clerkId: firebaseUser.uid, // Keep for compatibility
            username,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || username,
            avatar: firebaseUser.photoURL || undefined,
            bio: "",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };

          await setDoc(userRef, newUser);

          // Fetch the created user to get the actual timestamp values
          const createdUserSnap = await getDoc(userRef);
          if (createdUserSnap.exists()) {
            setUser(createdUserSnap.data() as UserProfile);
          }
        }
      } catch (error) {
        console.error("Error syncing user:", error);
        setLoading(false);
      }
    };

    syncUser();
  }, [firebaseUser, setUser, clearUser, setLoading]);

  return {
    user,
    firebaseUser,
    isLoaded: true,
    isAuthenticated: !!user,
  };
}
