"use client";

import { Button } from "@/components/ui/button";
import { GoogleIcon } from "./google-icon";

interface GoogleSignInButtonProps {
  onClick: () => void;
  isLoading: boolean;
  label?: string;
}

/**
 * Google Sign-In Button Component
 * Reusable button for Google OAuth authentication
 */
export function GoogleSignInButton({
  onClick,
  isLoading,
  label = "Sign in with Google",
}: GoogleSignInButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="w-full"
      disabled={isLoading}
    >
      <GoogleIcon className="h-5 w-5 mr-2" />
      {label}
    </Button>
  );
}
