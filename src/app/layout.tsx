import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
  ],
  authors: [{ name: "OpenBoard" }],
  openGraph: {
    title: "OpenBoard - Create Beautiful Shareable Boards",
    description:
      "The open-source platform to create beautiful, shareable boards for your links, content, and projects.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
