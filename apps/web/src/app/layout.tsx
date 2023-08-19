import "@/styles/globals.css";

import React from "react";
import { Metadata } from "next";

import { cn } from "@sa/ui/utils";

import { fontSans } from "@/lib/fonts";
import { ClerkProvider } from '@clerk/nextjs'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      default: "Signal Automation",
      template: "%s | SA",
    },
    description: "Signal Automation",
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "white" },
      { media: "(prefers-color-scheme: dark)", color: "black" },
    ],
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
      apple: "/apple-touch-icon.png",
    },
    openGraph: {
      locale: "en_US",
      type: "website",
      siteName: "SA",
      title: "SA",
      description: "Signal Automation",
      images: [
        {
          url: "/api/cms/og",
          width: 1200,
          height: 630,
        },
      ],
    },
    // the manifest will 401 in vercel preview environments and generate repeating console errors
    ...(process.env.NODE_ENV === "production"
      ? { manifest: "/webmanifest.json" }
      : {}),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
      </head>
      <body
        className={cn(
          "flex min-h-screen flex-col overflow-x-hidden bg-background font-sans antialiased ",
          fontSans.variable,
        )}
      >
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
