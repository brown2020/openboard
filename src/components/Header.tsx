"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import OpenBoardLogoOnly from "@/images/openboard_logo.png";
import OpenBoardLogo from "@/images/openboard_logoword.png";
import Image from "next/image";
import { ChevronLeftIcon, MenuIcon } from "lucide-react";
import { useSidebar } from "./ui/sidebar";

export default function Header() {
  //   const { user } = useUser();

  const { toggleSidebar, open, isMobile } = useSidebar();

  return (
    <header className="flex justify-between items-center p-4 border-b border-gray-200">
      {/* Left Side */}
      <div className="h-10 flex items-center">
        {open && !isMobile ? (
          <ChevronLeftIcon className="w-6 h-6" onClick={toggleSidebar} />
        ) : (
          <div className="flex items-center gap-2">
            <MenuIcon className="w-6 h-6" onClick={toggleSidebar} />
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
        <SignedIn>
          <UserButton />
        </SignedIn>

        <SignedOut>
          <Button asChild variant="outline">
            <SignInButton mode="modal" />
          </Button>
        </SignedOut>
      </div>
    </header>
  );
}
