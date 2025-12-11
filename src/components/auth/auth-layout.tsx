"use client";

import Image from "next/image";
import OpenBoardLogo from "@/images/openboard_logoword.png";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

/**
 * Auth Layout Component
 * Shared layout wrapper for login, signup, and password reset pages
 */
export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-md w-full mx-4 space-y-8 p-8 bg-card rounded-lg shadow-lg border">
        <div className="flex flex-col items-center">
          <Image
            src={OpenBoardLogo}
            alt="OpenBoard"
            width={200}
            height={60}
            className="h-12 object-contain mb-4"
          />
          <h2 className="text-3xl font-bold text-center">{title}</h2>
          <p className="text-muted-foreground mt-2">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
