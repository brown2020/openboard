"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/Header";
import { usePathname } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 w-full flex flex-col">
        {!isHomePage && <Header />}
        <div className="flex-1">{children}</div>
      </main>
    </SidebarProvider>
  );
}
