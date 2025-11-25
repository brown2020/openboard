import { create } from "zustand";
import { UserProfile } from "@/types";

// NOTE: We intentionally do NOT persist this store to localStorage
// to avoid hydration issues with stale auth data. The user profile
// is loaded fresh on each page load via useAuth hook.

interface UserState {
  user: UserProfile | null;
  isLoading: boolean;
  isHydrated: boolean;
  setUser: (user: UserProfile | null) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  clearUser: () => void;
  setLoading: (isLoading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  isLoading: true, // Start as loading until auth confirms
  isHydrated: false,

  setUser: (user) => set({ user, isLoading: false, isHydrated: true }),

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  clearUser: () => {
    // Clear any stale localStorage data from previous versions
    if (typeof window !== "undefined") {
      localStorage.removeItem("openboard-user");
    }
    return set({ user: null, isLoading: false, isHydrated: true });
  },

  setLoading: (isLoading) => set({ isLoading }),
  
  setHydrated: (hydrated) => set({ isHydrated: hydrated }),
}));

// Utility to clear all persisted auth state
export function clearAllAuthState() {
  if (typeof window === "undefined") return;
  
  // Clear any openboard-related localStorage
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes("openboard")) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
  
  // Clear sessionStorage too
  const sessionKeysToRemove: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.includes("openboard")) {
      sessionKeysToRemove.push(key);
    }
  }
  sessionKeysToRemove.forEach((key) => sessionStorage.removeItem(key));
}
