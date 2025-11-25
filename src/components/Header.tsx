"use client";

import { Button } from "./ui/button";
import OpenBoardLogoOnly from "@/images/openboard_logo.png";
import OpenBoardLogo from "@/images/openboard_logoword.png";
import Image from "next/image";
import {
  ChevronLeftIcon,
  MenuIcon,
  LogOut,
  User,
  Settings,
  Moon,
  Sun,
} from "lucide-react";
import { useSidebar } from "./ui/sidebar";
import { useAuthContext } from "@/lib/auth-context";
import { auth } from "@/lib/firebase";
import { removeAuthCookie } from "@/lib/auth-cookie";
import { useUserStore } from "@/stores/user-store";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Header() {
  const { toggleSidebar, open, isMobile } = useSidebar();
  const { user } = useAuthContext();
  const clearUser = useUserStore((state) => state.clearUser);
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Check system preference and localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (stored === "dark" || (!stored && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Handle clicks outside profile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      removeAuthCookie();
      clearUser();
      setIsProfileOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="flex justify-between items-center px-4 py-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      {/* Left Side */}
      <div className="h-10 flex items-center gap-3">
        {open && !isMobile ? (
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Close sidebar"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Open sidebar"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <Link href="/" className="flex items-center">
              <Image
                src={OpenBoardLogo}
                alt="OpenBoard"
                width={150}
                height={40}
                className="hidden md:block h-8 w-auto"
              />
              <Image
                src={OpenBoardLogoOnly}
                alt="OpenBoard"
                width={40}
                height={40}
                className="block md:hidden h-8 w-8"
              />
            </Link>
          </div>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {user ? (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={cn(
                "flex items-center gap-2 p-1.5 rounded-full transition-colors",
                "hover:bg-muted",
                isProfileOpen && "bg-muted"
              )}
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <span className="text-primary font-medium text-sm">
                    {user.email?.[0]?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-popover rounded-xl shadow-lg border border-border py-2 z-[100] animate-in fade-in-0 zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-border">
                  <p className="font-medium text-sm truncate">
                    {user.displayName || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      router.push("/dashboard");
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    <User className="w-4 h-4 mr-3 text-muted-foreground" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-3 text-muted-foreground" />
                    Settings
                  </button>
                </div>

                <div className="border-t border-border pt-1">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
