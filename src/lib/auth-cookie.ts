"use client";

import { User } from "firebase/auth";

// Set the auth cookie with the user's ID token
export const setAuthCookie = async (user: User | null) => {
  if (user) {
    // Get the user's ID token
    const token = await user.getIdToken();
    // Exchange for an HttpOnly session cookie (server-set).
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
    });
  } else {
    // Remove the cookie if user is null (logged out)
    await fetch("/api/auth/session", { method: "DELETE" });
  }
};

// Remove the auth cookie (for logout)
export const removeAuthCookie = () => {
  // Best-effort.
  fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
};
