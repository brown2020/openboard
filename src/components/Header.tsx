"use client";

import { Button } from "./ui/button";
import OpenBoardLogoOnly from "@/images/openboard_logo.png";
import OpenBoardLogo from "@/images/openboard_logoword.png";
import Image from "next/image";
import { ChevronLeftIcon, MenuIcon, LogOut } from "lucide-react";
import { useSidebar } from "./ui/sidebar";
import { useAuthContext } from "@/lib/auth-context";
import { auth } from "@/lib/firebase";
import { removeAuthCookie } from "@/lib/auth-cookie";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const { toggleSidebar, open, isMobile } = useSidebar();
  const { user } = useAuthContext();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleSignOut = async () => {
    await auth.signOut();
    removeAuthCookie();
    router.push("/");
  };

  return (
    <header className="flex justify-between items-center p-4 border-b border-gray-200">
      {/* Left Side */}
      <div className="h-10 flex items-center">
        {open && !isMobile ? (
          <ChevronLeftIcon
            className="w-6 h-6 cursor-pointer"
            onClick={toggleSidebar}
          />
        ) : (
          <div className="flex items-center gap-2">
            <MenuIcon
              className="w-6 h-6 cursor-pointer"
              onClick={toggleSidebar}
            />
            <Image
              src={OpenBoardLogo}
              alt="logo"
              width={150}
              height={150}
              className="hidden md:block"
            />
            <Image
              src={OpenBoardLogoOnly}
              alt="logo"
              width={40}
              height={40}
              className="block md:hidden"
            />
          </div>
        )}
      </div>

      {/* Right Side */}
      <div>
        {user ? (
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center p-1 sm:p-2 rounded-full hover:bg-gray-100"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <span className="text-primary font-medium">
                    {user.email?.[0]?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-[100]">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  {user.email}
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
