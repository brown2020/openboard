import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import { ToastContainer } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenBoard - Create Beautiful Shareable Boards",
  description:
    "The open-source platform to create beautiful, shareable boards for your links, content, and projects.",
  keywords: [
    "linktree",
    "bio link",
    "link in bio",
    "personal page",
    "portfolio",
    "open source",
    "boards",
    "links",
  ],
  authors: [{ name: "OpenBoard" }],
  creator: "OpenBoard",
  openGraph: {
    title: "OpenBoard - Create Beautiful Shareable Boards",
    description:
      "The open-source platform to create beautiful, shareable boards for your links, content, and projects.",
    type: "website",
    locale: "en_US",
    siteName: "OpenBoard",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenBoard - Create Beautiful Shareable Boards",
    description:
      "The open-source platform to create beautiful, shareable boards for your links, content, and projects.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <AuthProvider>
          {children}
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}
