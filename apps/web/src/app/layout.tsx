import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

/* ============================================================
   FONT SYSTEM
   ============================================================ */

/**
 * Primary application font.
 *
 * Used for:
 * - Navigation
 * - Messages
 * - Buttons
 * - Forms
 * - Headings
 * - General UI
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/**
 * Monospace font.
 *
 * Used later for:
 * - Code
 * - Technical information
 * - IDs
 * - Developer/admin interfaces
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


/* ============================================================
   APPLICATION METADATA
   ============================================================ */

export const metadata: Metadata = {
  title: "Chat Platform",
  description: "Modern real-time communication platform",
};


/* ============================================================
   ROOT LAYOUT
   ============================================================ */

/**
 * RootLayout
 *
 * Global layout for the entire web application.
 *
 * Responsibilities:
 * - Loads global CSS
 * - Loads application fonts
 * - Defines HTML language
 * - Provides the root body container
 * - Provides global metadata
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full antialiased">
        {children}
      </body>
    </html>
  );
}


